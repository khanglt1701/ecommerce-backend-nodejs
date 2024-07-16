'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

var orderSchema = new Schema(
    {
        order_userId: { type: Number, require: true },
        order_checkout: { type: Object, default: {} },
        /**
          order_checkout = {
            totalPrice,
            totalApplyDiscount,
            feeShip
          }
        */
        order_shipping: { type: Object, default: {} },
        /**
          order_shipping = {
            street,
            city,
            state,
            country
          }
        */
        order_payment: { type: Object, default: {} },
        order_products: { type: Array, require: true },
        order_trackingNumber: { type: String, default: '#0000116052022' },
        order_status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'],
            default: 'pending',
        },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
)

module.exports = { order: model(DOCUMENT_NAME, orderSchema) }
