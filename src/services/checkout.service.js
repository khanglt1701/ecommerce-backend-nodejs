'use strict'

const { NotFoundError, BadRequestError } = require('../core/error.response')
const { order } = require('../models/order.model')
const {
    findCartById,
    checkProductByServer,
} = require('../models/repositories/cart.repo')
const { getDiscountAmount } = require('./discount.service')
const { acquireLock, releaseLock } = require('./redis.service')

class CheckoutService {
    /**
    {
      cartId,
      userId,
      shop_order_ids: [
        {
          shopId,
          shop_discount: [],
          item_products: [
            {
              price,
              quantity,
              product
            }
          ]
        }
      ]
    }
   */
    static async checkoutReview({ cartId, userId, shop_order_ids }) {
        // check cartId exist
        const foundCart = await findCartById(cartId)
        if (!foundCart) {
            throw new BadRequestError('Cart does not exists')
        }

        const checkout_order = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0,
        }
        const shop_order_ids_new = []

        for (let i = 0; i < shop_order_ids.length; i++) {
            const {
                shopId,
                shop_discount = [],
                item_products = [],
            } = shop_order_ids[i]
            // check product available
            const checkProductServer = await checkProductByServer(item_products)
            if (!checkProductByServer[0]) {
                throw new BadRequestError('order wrong!!!')
            }

            // total bill
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + product.price * product.quantity
            }, 0)

            // total bill before handle
            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // total before discount,
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer,
            }

            if (shop_discounts.length > 0) {
                const { totalPrice = 0, discount = 0 } =
                    await getDiscountAmount({
                        codeId: shop_discount[0].codeId,
                        userId,
                        shopId,
                        products: checkProductServer,
                    })

                checkout_order.totalDiscount += discount

                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }

            // final total bill
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order,
        }
    }

    // order
    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {},
    }) {
        const { shop_order_ids_new, checkout_order } =
            await CheckoutService.checkoutReview({
                cartId,
                userId,
                shop_order_ids,
            })

        const products = shop_order_ids_new.flatMap(
            (order) => order.item_products
        )

        const acquireProduct = []
        for (let i = 0; i < products.length; i++) {
            const { productId, quantity } = products[i]
            const keyLock = await acquireLock(productId, quantity, cartId)
            acquireProduct.push(keyLock ? true : false)
            if (keyLock) {
                await releaseLock(keyLock)
            }
        }

        // check if have a product is out of stock
        if (acquireProduct.includes(false)) {
            throw new BadRequestError(
                'Some products have been updated, please return to the cart!'
            )
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new,
        })

        // remove products from the cart if the insert is successful.
        if (newOrder) {
        }
        return newOrder
    }

    static async getOrdersByUser() {}

    static async getOneOrderByUser() {}

    static async cancelOrderByUser() {}

    static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService
