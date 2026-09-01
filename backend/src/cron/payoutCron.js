const cron = require('node-cron');
const Seller = require('../models/Seller');
const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');

// Run everyday at 1:00 AM
cron.schedule('0 1 * * *', async () => {
    console.log('Running Payout Generation Cron Job...');
    try {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
        const dayOfMonth = today.getDate();

        // Find active sellers
        const sellers = await Seller.find({ accountStatus: 'ACTIVE' });

        for (const seller of sellers) {
            let shouldGeneratePayout = false;

            if (dayOfWeek === 1) {
                // Generate weekly payouts on Monday for everyone
                shouldGeneratePayout = true;
            }

            if (shouldGeneratePayout) {
                // Find all completed transactions that are not settled
                const pendingTransactions = await Transaction.find({
                    seller: seller._id,
                    paymentStatus: 'COMPLETED',
                    isSettled: false,
                    payoutId: null
                });

                if (pendingTransactions.length > 0) {
                    let totalEarnings = 0;
                    const transactionIds = [];

                    for (const tx of pendingTransactions) {
                        // Customer already paid the 7 Rs platform fee in the total amount
                        // Seller earnings = Total Amount - 7
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
                            status: 'PENDING',
                            payoutPeriodEnd: today
                        });

                        await payout.save();

                        // Link transactions to this payout
                        await Transaction.updateMany(
                            { _id: { $in: transactionIds } },
                            { $set: { payoutId: payout._id } }
                        );
                        
                        console.log(`Generated payout for Seller ${seller._id}: ${totalEarnings}`);
                    }
                }
            }
        }
        console.log('Payout Generation Cron Job Completed.');
    } catch (error) {
        console.error('Error in Payout Generation Cron Job:', error);
    }
});
