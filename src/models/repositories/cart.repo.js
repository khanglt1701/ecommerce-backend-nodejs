'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const cartModel = require('../cart.model')
const { getProductById } = require('./product.repo')

const findCartById = async (cartId) => {
    return await cartModel.findOne({ _id: convertToObjectIdMongodb(cartId) })
}

const checkProductByServer = async (products) => {
    return await Promise.all(
        products.map(async (product) => {
            const foundProduct = await getProductById(product.productId)
            if (foundProduct) {
                return {
                    price: foundProduct.product_price,
                    quantity: foundProduct.quantity,
                    productId: product.productId,
                }
            }
        })
    )
}

module.exports = { findCartById, checkProductByServer }
