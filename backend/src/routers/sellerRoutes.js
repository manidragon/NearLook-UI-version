const express = require('express');
const router = express.Router();

const sellerController =
require('../controllers/sellerController');

const sellerAuthMiddleware =
require('../middlewares/sellerAuthMiddleware');

const offlineSaleController = require('../controllers/offlineSaleController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');


router.get(
'/analytics',
sellerAuthMiddleware,
sellerController.getAnalytics
);

router.get(
'/profile',
sellerAuthMiddleware,
sellerController.getSellerProfile
);

router.post(
'/',
sellerController.createSeller
);

router.get(
'/',
sellerController.getAllSellers
);

router.patch(
'/',
sellerAuthMiddleware,
sellerController.updateSeller
);


/* NEW */
router.post(
'/offline-sale/checkout',
sellerAuthMiddleware,
offlineSaleController.checkout
);

/* NEW */
router.get(
'/:id/products',
sellerController.getSellerProductsById
);


router.patch(
'/:id/view',
sellerController.incrementProfileViews
);

router.patch(
'/:id/follow',
userAuthMiddleware,
sellerController.toggleFollowSeller
);

router.get(
'/:id',
sellerController.getSellerById
);


router.post(
'/verify/login-otp',
sellerController.verifyLoginOtp
);

router.post(
'/send-login-otp',
sellerController.sendLoginOtp
);

router.delete(
'/:id',
sellerController.deleteSeller
);

router.post(
'/verify/otp',
sellerController.verifyEmail
);

module.exports = router;