'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'Discounts'

var discountSchema = new Schema(
    {
        discount_name: { type: String, require: true },
        discount_description: { type: String, require: true },
        discount_type: { type: String, default: 'fixed-amount' }, // percentage
        discount_value: { type: Number, require: true }, // 10.000, 10%
        discount_code: { type: String, require: true },
        discount_start_date: { type: Date, require: true },
        discount_end_date: { type: Date, require: true },
        discount_max_uses: { type: Number, require: true }, // Number of discount codes used
        discount_users_used: { type: Array, default: [] },
        discount_max_uses_per_user: { type: Array, default: [] }, // Number of discount allowed per user
        discount_min_order_value: { type: Number, require: true },
        discount_uses_count: { type: Number, require: true },
        discount_max_value: { type: Number, require: true },
        discount_shop_id: { type: Schema.Types.ObjectId, ref: 'Shop' },
        discount_is_active: { type: Boolean, default: true },
        discount_applies_to: {
            type: String,
            require: true,
            enum: ['all', 'specific'],
        },
        discount_product_ids: { type: Array, default: [] }, // Quantity of products applied
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
)

module.exports = model(DOCUMENT_NAME, discountSchema)
