const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }],
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    payoutPeriodStart: {
        type: Date
    },
    payoutPeriodEnd: {
        type: Date
    },
    razorpayTransferId: {
        type: String,
        trim: true,
        default: null
    },
    payoutDate: {
        type: Date
    }
}, {
    timestamps: true
});

payoutSchema.index({ seller: 1, status: 1 });
payoutSchema.index({ status: 1 });

const Payout = mongoose.model('Payout', payoutSchema);
module.exports = Payout;
