'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

const router = express.Router()

router.post('/shop/signup', asyncHandler(accessController.signUp))
router.post('/shop/login', asyncHandler(accessController.login))

// AUTHENTICATION //
router.use(authenticationV2)
// AUTHENTICATION //

router.post('/shop/logout', asyncHandler(accessController.logout))
router.post(
    '/shop/handleRefreshToken',
    asyncHandler(accessController.handleRefreshToken)
)

module.exports = router
