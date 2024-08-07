'use strict'

const {
    getSelectData,
    getUnSelectData,
    convertToObjectIdMongodb,
} = require('../../utils')
const { product, electronic, clothing, furniture } = require('../product.model')
const { Types } = require('mongoose')

const findAllDraftsForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const findAllPublishForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const products = await product
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean()

    return products
}

const findProduct = async ({ product_id, unSelect }) => {
    return await product
        .findById(product_id)
        .select(getUnSelectData(unSelect))
        .lean()
}

const updateProductById = async ({
    productId,
    payload,
    model,
    isNew = true,
}) => {
    return await model.findByIdAndUpdate(productId, payload, { new: isNew })
}

const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    })
    if (!foundShop) {
        return null
    }

    foundShop.isDraft = false
    foundShop.isPublished = true
    const { modifiedCount } = await foundShop.updateOne(foundShop)

    return modifiedCount
}

const unpublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    })
    if (!foundShop) {
        return null
    }

    foundShop.isDraft = true
    foundShop.isPublished = false
    const { modifiedCount } = await foundShop.updateOne(foundShop)

    return modifiedCount
}

const queryProduct = async ({ query, limit, skip }) => {
    return await product
        .find(query)
        .populate('product_shop', 'name email -_id')
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}

const searchProductByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch)
    const result = await product
        .find(
            {
                $text: { $search: regexSearch },
                isPublished: true,
            },
            { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .lean()

    return result
}

const getProductById = async (productId) => {
    return await product
        .findOne({ _id: convertToObjectIdMongodb(productId) })
        .lean()
}

module.exports = {
    findAllDraftsForShop,
    findAllPublishForShop,
    publishProductByShop,
    unpublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById,
}
