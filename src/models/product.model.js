'use strict'

const { Schema, model } = require('mongoose')
const slugify = require('slugify')

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

var productSchema = new Schema(
    {
        product_name: { type: String, require: true },
        product_thumb: { type: String, require: true },
        product_description: String,
        product_slug: String,
        product_price: { type: Number, require: true },
        product_quantity: { type: Number, require: true },
        product_type: {
            type: String,
            require: true,
            enum: ['Electronics', 'Clothing', 'Furniture'],
        },
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
        product_attributes: { type: Schema.Types.Mixed, require: true },
        product_ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be more than 1.0'],
            max: [5, 'Rating must be less than 5.0'],
            set: (val) => Math.round(val),
        },
        product_variations: { type: Array, default: [] },
        isDraft: { type: Boolean, default: true, index: true, select: false },
        isPublish: {
            type: Boolean,
            default: false,
            index: true,
            select: false,
        },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
)
// create index for search
productSchema.index({ product_name: 'text', product_description: 'text' })

// Document middleware: runs before .save() and .create()
productSchema.pre('save', function (next) {
    console.log('this', this)
    this.product_slug = slugify(this.product_name, { lower: true })
    next()
})

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
