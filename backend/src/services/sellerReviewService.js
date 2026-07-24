const SellerReview =
    require(
        "../models/SellerReview"
    );

class SellerReviewService {

    async createReview(
        data,
        user
    ) {

        const existingReviewQuery = {
            seller: data.sellerId,
            user: user._id
        };
        if (data.orderItemId) {
            existingReviewQuery.orderItem = data.orderItemId;
        }

        const existingReview = await SellerReview.findOne(existingReviewQuery);

        if (existingReview) {

            throw new Error(
                "You have already reviewed this seller for this order"
            );

        }

        const review =
            await SellerReview.create({

                reviewText:
                    data.reviewText,

                rating:
                    data.rating,

                images:
                    data.images,

                seller:
                    data.sellerId,

                user:
                    user?._id,

                orderItem:
                    data.orderItemId || null

            });

        return review;

    }


    async getReviews(
        sellerId
    ) {

        return await SellerReview
            .find({
                seller: sellerId
            })
            .populate(
                "user",
                "fullName"
            );

    }

    async getAllReviews() {
        return await SellerReview.find()
            .populate("user", "fullName email")
            .populate("seller", "sellerName businessDetails")
            .sort({ createdAt: -1 });
    }

    async deleteReview(reviewId, userId) {
        const review = await SellerReview.findById(reviewId);
        if (!review) throw new Error("Review not found");
        if (review.user.toString() !== userId.toString()) {
            throw new Error("You can only delete your own review");
        }
        await SellerReview.findByIdAndDelete(reviewId);
        return { message: "Review deleted successfully" };
    }

}

module.exports =
    new SellerReviewService();