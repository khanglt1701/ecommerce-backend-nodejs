'use strict'

const { CREATED, SuccessResponse } = require('../core/success.response')
const ProductService = require('../services/product.service')
const ProductServiceV2 = require('../services/product.service.v2')

class ProductController {
    // createProduct = async (req, res, next) => {
    //     new SuccessResponse({
    //         message: 'Create new Product success!',
    //         metadata: await ProductService.createProduct(
    //             req.body.product_type,
    //             {
    //                 ...req.body,
    //                 product_shop: req.user.userId,
    //             }
    //         ),
    //     }).send(res)
    // }

    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new Product success!',
            metadata: await ProductServiceV2.createProduct(
                req.body.product_type,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res)
    }

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Publish Product success!',
            metadata: await ProductServiceV2.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id,
            }),
        }).send(res)
    }

    unpublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Unpublish Product success!',
            metadata: await ProductServiceV2.unpublishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id,
            }),
        }).send(res)
    }

    // QUERY //

    /**
     * @desc Get all Drafts for shop
     * @param {Number} limit
     * @param {Number} skip
     * @return {JSON}
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Draft success!',
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId,
            }),
        }).send(res)
    }

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Publish success!',
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId,
            }),
        }).send(res)
    }

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get getListSearchProduct success!',
            metadata: await ProductServiceV2.getListSearchProduct(req.params),
        }).send(res)
    }

    getAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get getAllProducts success!',
            metadata: await ProductServiceV2.findAllProducts(req.query),
        }).send(res)
    }

    getProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get getProduct success!',
            metadata: await ProductServiceV2.findProduct({
                product_id: req.params.product_id,
            }),
        }).send(res)
    }
    // END QUERY //
}

module.exports = new ProductController()
