'use strict'

const { getSelectData, unGetSelectData } = require('../../utils')
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
        .select(unGetSelectData(unSelect))
        .lean()
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
    foundShop.isPublish = true
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
    foundShop.isPublish = false
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
                isPublish: true,
            },
            { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .lean()

    return result
}

module.exports = {
    findAllDraftsForShop,
    findAllPublishForShop,
    publishProductByShop,
    unpublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
}
