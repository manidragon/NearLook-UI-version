const express =
require("express");

const router =
express.Router();

const auth =
require(
"../middlewares/userAuthMiddleware"
);

const controller =
require(
"../controllers/sellerReviewController"
);


router.post(
"/",
auth,              // ← ADD BACK
controller.createReview
);


router.get(
"/:sellerId",
controller.getReviews
);

router.delete(
"/:reviewId",
auth,
controller.deleteReview
);


module.exports =
router;