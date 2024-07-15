'use strict'

const cartModel = require('../models/cart.model')

class CartService {
    static async createUserCart({ userId, product }) {
        const query = { cart_userId: userId, cart_state: 'active' }
        const updateOrInsert = {
            $addToSet: {
                cart_products: product,
            },
        }
        const options = { upset: true, new: true }

        return await cartModel.findOneAndUpdate(query, updateOrInsert, options)
    }

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product
        const query = {
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_state: 'active',
        }
        const updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity, // $ => update chinh phan tu duoc tim thay
            },
        }
        const options = { upset: true, new: true }

        return await cartModel.findOneAndUpdate(query, updateSet, options)
    }

    static async addToCart({ userId, product = {} }) {
        const userCart = await cartModel.findOne({ cart_userId: userId })
        if (!userCart) {
            return await CartService.createUserCart({ userId, product })
        }

        if (!userCart.cart_products.length) {
            userCart.cart_products = [product]
            return await userCart.save()
        }

        return await CartService.updateUserCartQuantity({ userId, product })
    }
}

module.exports = CartService
