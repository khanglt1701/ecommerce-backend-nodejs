'use strict'

const _ = require('lodash')
const { Types } = require('mongoose')

const convertToObjectIdMongodb = (id) => Types.ObjectId(id)

const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields)
}

// ['a', 'b'] => {a: 1, b: 1}
const getSelectData = (select = []) => {
    return Object.fromEntries(select.map((item) => [item, 1]))
}

const getUnSelectData = (select = []) => {
    return Object.fromEntries(select.map((item) => [item, 0]))
}

const removeUndefindedObject = (object = {}) => {
    Object.keys(object).forEach((key) => {
        if (object[key] === null || object[key] === undefined) {
            delete object[key]
        }
    })

    return object
}

/*
    const a = {
        c: {
            d: 1,
            e: 2
        }
    }

    db.collection.updateOne({
        `c.d`: 1,
        `c.e`: 2
    })
 */
const updateNestedObjectParser = (object = {}) => {
    const final = {}

    Object.keys(object).forEach((key) => {
        if (typeof object[key] === 'object' && !Array.isArray(object[key])) {
            const response = updateNestedObjectParser(object[key])
            Object.keys(response).forEach((x) => {
                final[`${key}.${x}`] = response[x]
            })
        } else {
            final[key] = object[key]
        }
    })

    return final
}

module.exports = {
    getInfoData,
    getSelectData,
    getUnSelectData,
    removeUndefindedObject,
    updateNestedObjectParser,
    convertToObjectIdMongodb,
}
