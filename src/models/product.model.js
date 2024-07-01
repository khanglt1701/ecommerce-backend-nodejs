'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

var productSchema = new Schema(
    {
        product_name: {
            type: String,
            require: true,
        },
        product_thumb: {
            type: String,
            require: true,
        },
        product_description: String,
        product_price: {
            type: Number,
            require: true,
        },
        product_quantity: {
            type: Number,
            require: true,
        },
        product_type: {
            type: String,
            require: true,
            enum: ['Electronics', 'Clothing', 'Furniture'],
        },
        product_shop: {
            type: Schema.Types.ObjectId,
            ref: 'Shop',
        },
        product_attributes: {
            type: Schema.Types.Mixed,
            require: true,
        },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
)

// defind the product with type = clothing
const clothingSchema = new Schema(
    {
        brand: {
            type: String,
            require: true,
        },
        size: String,
        material: String,
        product_shop: {
            type: Schema.Types.ObjectId,
            ref: 'Shop',
        },
    },
    {
        collection: 'Clothes',
        timestamps: true,
    }
)

// defind the product with type = electronic
const electronicSchema = new Schema(
    {
        manufacturer: {
            type: String,
            require: true,
        },
        model: String,
        color: String,
        product_shop: {
            type: Schema.Types.ObjectId,
            ref: 'Shop',
        },
    },
    {
        collection: 'Electronics',
        timestamps: true,
    }
)

// defind the product with type = furniture
const furnitureSchema = new Schema(
    {
        brand: {
            type: String,
            require: true,
        },
        size: String,
        material: String,
        product_shop: {
            type: Schema.Types.ObjectId,
            ref: 'Shop',
        },
    },
    {
        collection: 'Furnitures',
        timestamps: true,
    }
)

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    clothing: model('Clothing', clothingSchema),
    electronic: model('Electronic', electronicSchema),
    furniture: model('Furnitures', furnitureSchema),
}
