const mongoose = require('mongoose');

// Define the Review schema
const reviewSchema = new mongoose.Schema({
    reviewText: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    productImages: {
        type: [String],  
        default: []
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',  
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
        required: true
    },
    orderItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now  
    }
}, {
    timestamps: true  
});

// Static method to calculate average rating and update product
reviewSchema.statics.calcAverageRatings = async function(productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: '$product',
                totalReviews: { $sum: 1 },
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        if (stats.length > 0) {
            await mongoose.model('Product').findByIdAndUpdate(productId, {
                totalReviews: stats[0].totalReviews,
                averageRating: Math.round(stats[0].averageRating * 10) / 10
            });
        } else {
            await mongoose.model('Product').findByIdAndUpdate(productId, {
                totalReviews: 0,
                averageRating: 0
            });
        }
    } catch (err) {
        console.error('Error updating product ratings:', err);
    }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.product);
});

// Call calcAverageRatings after remove/delete
reviewSchema.post('deleteOne', { document: true, query: false }, function() {
    this.constructor.calcAverageRatings(this.product);
});
reviewSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await doc.constructor.calcAverageRatings(doc.product);
    }
});

// Create and export the Review model
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
