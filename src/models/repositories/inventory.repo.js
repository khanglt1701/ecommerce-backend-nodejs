'use strict'

const {
    getSelectData,
    getUnSelectData,
    convertToObjectIdMongodb,
} = require('../../utils')
const { inventory } = require('../inventory.model')
const { Types } = require('mongoose')

const insertInventory = async ({
    productId,
    shopId,
    stock,
    location = 'unknown',
}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_shopId: shopId,
        inven_location: location,
        inven_stock: stock,
    })
}

const reservationInventory = async ({ productId, quantity, cartId }) => {
    const query = {
        inven_productId: convertToObjectIdMongodb(productId),
        inven_stock: { $gte: quantity },
    }
    const updateSet = {
        $inc: {
            inven_stock: -quantity,
        },
        $push: {
            inven_reservation: {
                quantity,
                cartId,
                createOn: new Date(),
            },
        },
    }
    const options = { upsert: true, new: true }

    return await inventory.updateOne(query, updateSet, options)
}

module.exports = {
    insertInventory,
    reservationInventory,
}
