const Payout = require('../models/Payout');
const Transaction = require('../models/Transaction');
const Seller = require('../models/Seller');

const adminPayoutController = {
    // Get all payouts (with optional filters)
    getAllPayouts: async (req, res) => {
        try {
            const { status, sellerId } = req.query;
            let query = {};
            if (status) query.status = status;
            if (sellerId) query.seller = sellerId;

            const payouts = await Payout.find(query)
                .populate('seller', 'sellerName email bankDetails')
                .sort({ createdAt: -1 });

            res.status(200).json(payouts);
        } catch (error) {
            console.error('Error fetching payouts:', error);
            res.status(500).json({ message: 'Failed to fetch payouts', error: error.message });
        }
    },

    // Get specific payout details
    getPayoutDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const payout = await Payout.findById(id)
                .populate('seller', 'sellerName email bankDetails mobile')
                .populate({
                    path: 'transactions',
                    populate: {
                        path: 'order',
                        select: 'totalSellingPrice orderStatus deliverDate _id'
                    }
                });

            if (!payout) {
                return res.status(404).json({ message: 'Payout not found' });
            }

            res.status(200).json(payout);
        } catch (error) {
            console.error('Error fetching payout details:', error);
            res.status(500).json({ message: 'Failed to fetch payout details', error: error.message });
        }
    },

    // Update payout status to COMPLETED (Manual Settlement)
    completePayout: async (req, res) => {
        try {
            const { id } = req.params;
            const { razorpayTransferId } = req.body;

            const payout = await Payout.findById(id);
            if (!payout) {
                return res.status(404).json({ message: 'Payout not found' });
            }

            if (payout.status === 'COMPLETED') {
                return res.status(400).json({ message: 'Payout is already completed' });
            }

            payout.status = 'COMPLETED';
            payout.razorpayTransferId = razorpayTransferId || null;
            payout.payoutDate = new Date();
            await payout.save();

            // Mark all associated transactions as settled
            await Transaction.updateMany(
                { _id: { $in: payout.transactions } },
                { $set: { isSettled: true } }
            );

            res.status(200).json({ message: 'Payout marked as completed', payout });
        } catch (error) {
            console.error('Error completing payout:', error);
            res.status(500).json({ message: 'Failed to complete payout', error: error.message });
        }
    },

    // Manually trigger payout generation
    triggerPayouts: async (req, res) => {
        try {
            console.log('Manually Triggering Payout Generation...');
            const today = new Date();
            let generatedCount = 0;
            const { sellerIds } = req.body;

            let query = { accountStatus: 'ACTIVE' };
            if (sellerIds && sellerIds.length > 0) {
                query._id = { $in: sellerIds };
            }

            const sellers = await Seller.find(query);

            for (const seller of sellers) {
                // Remove any existing PENDING payouts for this seller to consolidate into a single new one
                await Payout.deleteMany({ seller: seller._id, status: 'PENDING' });

                // Find all unsettled, completed, online transactions
                let pendingTransactions = await Transaction.find({
                    seller: seller._id,
                    paymentStatus: 'COMPLETED',
                    isSettled: { $ne: true },
                    isOffline: { $ne: true },
                    paymentMethod: { $ne: 'CASH_ON_DELIVERY' }
                }).populate('order', 'orderStatus');

                // Filter transactions to ensure only DELIVERED orders are settled
                pendingTransactions = pendingTransactions.filter(tx => tx.order && tx.order.orderStatus === 'DELIVERED');

                if (pendingTransactions.length > 0) {
                    let totalEarnings = 0;
                    const transactionIds = [];

                    for (const tx of pendingTransactions) {
                        const platformFee = 7;
                        const sellerEarning = tx.amount - platformFee;
                        totalEarnings += sellerEarning;
                        transactionIds.push(tx._id);
                    }

                    if (totalEarnings > 0) {
                        const payout = new Payout({
                            seller: seller._id,
                            amount: totalEarnings,
                            transactions: transactionIds,
                            status: 'COMPLETED',
                            payoutPeriodEnd: today,
                            payoutDate: today
                        });

                        await payout.save();

                        await Transaction.updateMany(
                            { _id: { $in: transactionIds } },
                            { $set: { payoutId: payout._id, isSettled: true } }
                        );
                        
                        console.log(`Generated payout for Seller ${seller._id}: ${totalEarnings}`);
                        generatedCount++;
                    }
                }
            }

            res.status(200).json({ message: `Successfully generated ${generatedCount} payouts.` });
        } catch (error) {
            console.error('Error triggering payouts:', error);
            res.status(500).json({ message: 'Failed to trigger payouts', error: error.message });
        }
    }
};

module.exports = adminPayoutController;
