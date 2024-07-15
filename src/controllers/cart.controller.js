'use strict'

const { CREATED, SuccessResponse } = require('../core/success.response')
const CartService = require('../services/cart.service')

class CartController {
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new Cart Successfully!',
            metadata: await CartService.addToCart(req.body),
        }).send(res)
    }

    update = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update Cart Successfully!',
            metadata: await CartService.addToCartV2(req.body),
        }).send(res)
    }

    delete = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete Cart Successfully!',
            metadata: await CartService.deleteUserCart(req.body),
        }).send(res)
    }

    listToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'List Cart Successfully!',
            metadata: await CartService.getListUserCart(req.query),
        }).send(res)
    }
}

module.exports = new CartController()
