"use strict"

const JWT = require("jsonwebtoken")
const { asyncHandler } = require("../helpers/asyncHandler")
const { AuthFailureError, NotFoundError } = require("../core/error.response")
const { findByUserId } = require("../services/keyToken.service")

const HEADERS = {
    API_KEY: "x-api-key",
    AUTHORIZATION: "authorization",
    CIENT_ID: "x-client-id",
    REFRESH_TOKEN: "x-rtoken-id",
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // accessToken
        const accessToken = await JWT.sign(payload, publicKey, {
            // algorithm: 'RS256',
            expiresIn: "2 days",
        })

        const refreshToken = await JWT.sign(payload, privateKey, {
            // algorithm: 'RS256',
            expiresIn: "7 days",
        })

        //

        JWT.verify(accessToken, publicKey, (error, decode) => {
            if (error) {
                console.log(`error verify:: ${error}`)
            } else {
                console.log(`decode verify:: ${decode}`)
            }
        })

        return { accessToken, refreshToken }
    } catch (error) {}
}

// const authentication = asyncHandler(async (req, res, next) => {
//     /*
//         1 - check userId missing??
//         2 - get accessToken
//         3 - verifyToken
//         4 - check user in dbs?
//         5 - check keyStore with this userId
//         6 - return next()
//      */

//     // 1
//     const userId = req.headers[HEADERS.CIENT_ID]
//     if (!userId) {
//         throw new AuthFailureError("Invalid Request userId")
//     }

//     // 2
//     const keyStore = await findByUserId(userId)
//     if (!keyStore) {
//         throw new NotFoundError("Not found keyStore")
//     }

//     //3
//     const accessToken = req.headers[HEADERS.AUTHORIZATION]
//     if (!accessToken) {
//         throw new AuthFailureError("Invalid Requestz")
//     }

//     try {
//         const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
//         if (userId !== decodeUser.userId) {
//             throw new AuthFailureError("Invalid User")
//         }
//         req.keyStore = keyStore
//         return next()
//     } catch (error) {
//         throw error
//     }
// })

const authenticationV2 = asyncHandler(async (req, res, next) => {
    /*
        1 - check userId missing??
        2 - get accessToken
        3 - verifyToken
        4 - check user in dbs?
        5 - check keyStore with this userId
        6 - return next()
     */

    // 1
    const userId = req.headers[HEADERS.CIENT_ID]
    if (!userId) {
        throw new AuthFailureError("Invalid Request userId")
    }

    // 2
    const keyStore = await findByUserId(userId)
    if (!keyStore) {
        throw new NotFoundError("Not found keyStore")
    }

    //3
    if (req.headers[HEADERS.REFRESH_TOKEN]) {
        try {
            const refreshToken = req.headers[HEADERS.REFRESH_TOKEN]
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
            if (userId !== decodeUser.userId) {
                throw new AuthFailureError("Invalid User")
            }
            req.keyStore = keyStore
            req.user = decodeUser
            req.refreshToken = refreshToken

            return next()
        } catch (error) {
            throw error
        }
    }

    const accessToken = req.headers[HEADERS.AUTHORIZATION]
    if (!accessToken) {
        throw new AuthFailureError("Invalid Requestz")
    }

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) {
            throw new AuthFailureError("Invalid User")
        }
        req.keyStore = keyStore
        return next()
    } catch (error) {
        throw error
    }
})

const verifyJWT = async (token, keySecret) => {
    return JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    // authentication,
    verifyJWT,
    authenticationV2,
}
