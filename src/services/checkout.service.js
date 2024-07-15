'use strict'

const { NotFoundError, BadRequestError } = require('../core/error.response')
const cartModel = require('../models/cart.model')
const {
    findCartById,
    checkProductByServer,
} = require('../models/repositories/cart.repo')
const { getDiscountAmount } = require('./discount.service')

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
}

module.exports = CheckoutService
