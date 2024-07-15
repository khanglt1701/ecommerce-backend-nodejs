'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'

var cartSchema = new Schema(
    {
        cart_state: {
            type: String,
            require: true,
            enum: ['active', 'completed', 'failed', 'pending'],
            default: 'active',
        },
        cart_products: {
            type: Array, // productId, shopId, quaantity, name, price
            require: true,
            default: [],
        },
        cart_count_product: { type: Number, default: 0 },
        cart_userId: { type: Number, require: true },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
)

module.exports = model(DOCUMENT_NAME, cartSchema)
