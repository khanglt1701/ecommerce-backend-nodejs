'use strict'

const { BadRequestError } = require('../core/error.response')
const {
    product,
    clothing,
    electronic,
    furniture,
} = require('../models/product.model')

// define Factory class to create product
class ProducFactory {
    static productRegistry = {} // key-class

    static registerProductType(type, classRef) {
        ProducFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload) {
        const productClass = ProducFactory.productRegistry[type]
        if (!productClass) {
            throw new BadRequestError(`Invalid Product Types ${type}`)
        }

        return new productClass(payload).createProduct()
    }
}

// define base product class
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes,
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id })
    }
}

// define sub-class for difference product types Clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        })
        if (!newClothing) {
            throw new BadRequestError('create new Clothing error')
        }

        const newProduct = await super.createProduct(newClothing._id)
        if (!newProduct) {
            throw new BadRequestError('create new Product error')
        }

        return newProduct
    }
}

// define sub-class for difference product types Electronic
class Electronic extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        })
        if (!newElectronic) {
            throw new BadRequestError('create new Electronic error')
        }

        const newProduct = await super.createProduct(newElectronic._id)
        if (!newProduct) {
            throw new BadRequestError('create new Product error')
        }

        return newProduct
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        })
        if (!newFurniture) {
            throw new BadRequestError('create new Furniture error')
        }

        const newProduct = await super.createProduct(newFurniture._id)
        if (!newProduct) {
            throw new BadRequestError('create new Product error')
        }

        return newProduct
    }
}

// register product types
ProducFactory.registerProductType('Electronics', Electronic)
ProducFactory.registerProductType('Clothing', Clothing)
ProducFactory.registerProductType('Furniture', Furniture)

module.exports = ProducFactory
