const SellerReviewService =
require(
"../services/sellerReviewService"
);

class Controller{

async createReview(
req,
res,
next
){

try{

const review =
await SellerReviewService
.createReview(
req.body,
req.user
);

res.status(201)
.json(review);

}
catch(err){

next(err);

}

}


async getReviews(
req,
res,
next
){

try{

const reviews =
await SellerReviewService
.getReviews(
req.params.sellerId
);

res.json(reviews);

}
catch(err){

next(err);

}

}

async getAllReviews(req, res, next) {
    try {
        const reviews = await SellerReviewService.getAllReviews();
        res.json(reviews);
    } catch (err) {
        next(err);
    }
}

async deleteReview(req, res, next) {
    try {
        const result = await SellerReviewService.deleteReview(req.params.reviewId, req.user._id);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

}

module.exports=
new Controller();