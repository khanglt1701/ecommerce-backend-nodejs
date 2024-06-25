'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'ApiKey'
const COLLECTION_NAME = 'ApiKeys'

var keyTokenSchema = new Schema(
    {
        key: {
            type: String,
            require: true,
            unique: true,
        },
        status: {
            type: Boolean,
            default: true,
        },
        permissions: {
            type: [String],
            require: true,
            enum: ['0000', '1111', '2222'],
        },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
)

module.exports = model(DOCUMENT_NAME, keyTokenSchema)
