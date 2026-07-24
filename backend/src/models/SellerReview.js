const mongoose =
require("mongoose");

const sellerReviewSchema =
new mongoose.Schema({

reviewText:{
type:String,
required:true
},

rating:{
type:Number,
required:true
},

images:{
type:[String],
default:[]
},

seller:{
type:
mongoose.Schema.Types.ObjectId,

ref:"Seller",

required:true
},

user:{
type:
mongoose.Schema.Types.ObjectId,

ref:"User",

required:true
},

orderItem:{
type:
mongoose.Schema.Types.ObjectId,

ref:"OrderItem",

required:false
}

},
{
timestamps:true
}
);


// Static method to calculate average rating and update Seller
sellerReviewSchema.statics.calcAverageRatings = async function(sellerId) {
    const stats = await this.aggregate([
        {
            $match: { seller: sellerId }
        },
        {
            $group: {
                _id: '$seller',
                totalReviews: { $sum: 1 },
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        if (stats.length > 0) {
            await mongoose.model('Seller').findByIdAndUpdate(sellerId, {
                totalReviews: stats[0].totalReviews,
                averageRating: Math.round(stats[0].averageRating * 10) / 10
            });
        } else {
            await mongoose.model('Seller').findByIdAndUpdate(sellerId, {
                totalReviews: 0,
                averageRating: 0
            });
        }
    } catch (err) {
        console.error('Error updating seller ratings:', err);
    }
};

// Call calcAverageRatings after save
sellerReviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.seller);
});

// Call calcAverageRatings after remove/delete
sellerReviewSchema.post('deleteOne', { document: true, query: false }, function() {
    this.constructor.calcAverageRatings(this.seller);
});
sellerReviewSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await doc.constructor.calcAverageRatings(doc.seller);
    }
});

module.exports = mongoose.model("SellerReview", sellerReviewSchema);