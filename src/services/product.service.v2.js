'use strict'

const { BadRequestError } = require('../core/error.response')
const { Types } = require('mongoose')
const {
    product,
    clothing,
    electronic,
    furniture,
} = require('../models/product.model')
const {
    findAllDraftsForShop,
    findAllPublishForShop,
    publishProductByShop,
    unpublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
} = require('../models/repositories/product.repo')
const { removeUndefindedObject, updateNestedObjectParser } = require('../utils')
const { insertInventory } = require('../models/repositories/inventory.repo')

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

    static async updateProduct(type, productId, payload) {
        const productClass = ProducFactory.productRegistry[type]
        if (!productClass) {
            throw new BadRequestError(`Invalid Product Types ${type}`)
        }

        return new productClass(payload).updateProduct(productId)
    }

    // PUT //
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id })
    }

    static async unpublishProductByShop({ product_shop, product_id }) {
        return await unpublishProductByShop({ product_shop, product_id })
    }
    // END PUT //

    // Query
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true }
        return await findAllDraftsForShop({ query, limit, skip })
    }

    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true }
        return await findAllPublishForShop({ query, limit, skip })
    }

    static async getListSearchProduct({ keySearch }) {
        return await searchProductByUser({ keySearch })
    }

    static async findAllProducts({
        limit = 50,
        sort = 'ctime',
        page = 1,
        filter = { isPublished: true },
        select, // ['product_name', 'product_price', 'product_thumb']
    }) {
        return await findAllProducts({
            limit,
            sort,
            page,
            filter,
            select: ['product_name', 'product_price', 'product_thumb'],
        })
    }

    static async findProduct({ product_id }) {
        return await findProduct({ product_id, unSelect: ['__v'] })
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
        const newProduct = await product.create({ ...this, _id: product_id })
        if (newProduct) {
            // add product_stock into inventory collection
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity,
            })
        }

        return newProduct
    }

    async updateProduct(productId, payload) {
        return await updateProductById({
            productId,
            payload: payload,
            model: product,
        })
    }
}

// define sub-class for difference product types Clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this,
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

    async updateProduct(productId) {
        // 1. Remove attributes has null and undefined
        const objectParams = removeUndefindedObject(this)
        // 2. Check where need updating
        if (objectParams.product_attributes) {
            // update child
            await updateProductById({
                productId,
                payload: updateNestedObjectParser(
                    objectParams.product_attributes
                ),
                model: clothing,
            })
        }

        const updateProduct = await super.updateProduct(
            productId,
            updateNestedObjectParser(objectParams)
        )

        return updateProduct
    }
}

// define sub-class for difference product types Electronic
class Electronic extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this,
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

    async updateProduct(productId) {
        // 1. Remove attributes has null and undefined
        const objectParams = removeUndefindedObject(this)
        // 2. Check where need updating
        if (objectParams.product_attributes) {
            // update child
            await updateProductById({
                productId,
                payload: updateNestedObjectParser(
                    objectParams.product_attributes
                ),
                model: electronic,
            })
        }

        const updateProduct = await super.updateProduct(
            productId,
            updateNestedObjectParser(objectParams)
        )

        return updateProduct
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this,
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

    async updateProduct(productId) {
        // 1. Remove attributes has null and undefined
        const objectParams = removeUndefindedObject(this)
        // 2. Check where need updating
        if (objectParams.product_attributes) {
            // update child
            await updateProductById({
                productId,
                payload: updateNestedObjectParser(
                    objectParams.product_attributes
                ),
                model: furniture,
            })
        }

        const updateProduct = await super.updateProduct(
            productId,
            updateNestedObjectParser(objectParams)
        )

        return updateProduct
    }
}

// register product types
ProducFactory.registerProductType('Electronics', Electronic)
ProducFactory.registerProductType('Clothing', Clothing)
ProducFactory.registerProductType('Furniture', Furniture)

module.exports = ProducFactory
