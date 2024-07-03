'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const {
    removeKeyById,
    findByRefreshTokenUsed,
    findByRefreshToken,
    deleteKeyById,
    createKeyToken,
} = require('./keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { type } = require('os')
const { getInfoData } = require('../utils')
const {
    BadRequestError,
    AuthFailureError,
    ForbiddenError,
} = require('../core/error.response')
const { findByEmail } = require('./shop.service')

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
}

class AccessService {
    static handleRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
        const { userId, email } = user
        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            // remove all token with userId
            await deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happed !! Pls relogin')
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new AuthFailureError('Shop not registered!')
        }

        // check userId
        const foundShop = await findByEmail({ email })
        if (!foundShop) {
            throw new AuthFailureError('Shop not registered')
        }

        // create a new pair token
        const tokens = await createTokenPair(
            { userId, email },
            keyStore.publicKey,
            keyStore.privateKey
        )

        // update token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken, // used to get new token
            },
        })

        return {
            user,
            tokens,
        }
    }

    static logout = async (keyStore) => {
        const delKey = await removeKeyById(keyStore._id)
        return delKey
    }

    /*
        1 - check email in dbs
        2 - match passwords
        3 - create AccessToken vs RefreshToken and save
        4 - generate tokens
        5 - get data return login
    */
    static login = async ({ email, password, refreshToken = null }) => {
        // 1
        const foundShop = await findByEmail({ email })

        if (!foundShop) {
            throw new BadRequestError('Shop is not resgisterd')
        }

        // 2
        const match = bcrypt.compare(password, foundShop.password)
        if (!match) {
            throw new AuthFailureError('Authen error')
        }

        // 3
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        // 4
        const { _id: userId } = foundShop
        const tokens = await createTokenPair(
            { userId, email },
            publicKey,
            privateKey
        )

        await createKeyToken({
            userId,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken,
        })

        return {
            shop: getInfoData({
                fields: ['_id', 'name', 'email'],
                object: foundShop,
            }),
            tokens,
        }
    }

    static signUp = async ({ name, email, password, roles }) => {
        // try {
        // step 1: check email exist
        const holderShop = await shopModel.findOne({ email }).lean()

        if (holderShop) {
            throw new BadRequestError('Error: Shop already registered!')
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.SHOP],
        })

        if (newShop) {
            // create privateKey, publicKey
            // const { privateKey, publicKey } = crypto.generateKeyPairSync(
            //     'rsa',
            //     {
            //         modulusLength: 4096,
            //         publicKeyEncoding: {
            //             type: 'pkcs1', // Public Key CryptoGraphy Standards 1
            //             format: 'pem',
            //         },
            //         privateKeyEncoding: {
            //             type: 'pkcs1', // Public Key CryptoGraphy Standards 1
            //             format: 'pem',
            //         },
            //     }
            // )

            const privateKey = crypto.randomBytes(64).toString('hex')
            const publicKey = crypto.randomBytes(64).toString('hex')

            const keyStore = await createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            })

            if (!keyStore) {
                throw new BadRequestError('Error: keyStore error')
            }

            // create token pair

            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKey,
                privateKey
            )

            return {
                shop: getInfoData({
                    fields: ['_id', 'name', 'email'],
                    object: newShop,
                }),
                tokens,
            }
        }

        return {
            code: 200,
            metadata: null,
        }
        // } catch (error) {
        //     return {
        //         code: 'xxx',
        //         message: error.message,
        //         status: 'error',
        //     }
        // }
    }
}

module.exports = AccessService
