const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const reviewController = require('../controllers/reviewController');
const sellerReviewController = require('../controllers/sellerReviewController');
const transactionController = require('../controllers/transactionController');

// Admin routes
router.patch('/seller/:id/status/:status', sellerController.updateSellerAccountStatus);

// Admin product routes
router.get('/products', productController.getAllAdminProducts);
router.patch('/product/:productId/status', productController.updateProductStatus);

// Admin approval routes
router.get('/approvals/products', productController.getPendingProducts);
router.get('/approvals/offers', productController.getPendingOffers);
router.get('/offers', productController.getAllOffers);
router.patch('/approvals/product/:productId', productController.updateProductStatus);
router.patch('/approvals/offer/:productId/variants/:variantId/offers/:offerId', productController.updateOfferStatus);

// Admin order routes
router.get('/orders', orderController.getAllOrders);

// Admin transaction routes
router.get('/transactions', transactionController.getAllTransactionsForAdmin);

// Admin review routes
router.get('/reviews/products', reviewController.getAllReviews);
router.get('/reviews/sellers', sellerReviewController.getAllReviews);

module.exports = router;
