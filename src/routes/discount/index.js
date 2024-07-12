'use strict'

const express = require('express')
const discountController = require('../../controllers/discount.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

const router = express.Router()

router.post('/amount', asyncHandler(discountController.getDiscountAmount))
router.get(
    '/list_product_code',
    asyncHandler(discountController.getAllDiscountCodesWithProduct)
)

// AUTHENTICATION //
router.use(authenticationV2)
// AUTHENTICATION //

router.post('', asyncHandler(discountController.createDiscountCode))
router.get('', asyncHandler(discountController.getAllDiscountCodes))

module.exports = router
