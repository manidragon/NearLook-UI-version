require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./src/models/Transaction');

const URI = process.env.MONGO_URI || 'mongodb+srv://manidragon0604_db_user:JImf5rlbLjgGUwJI@cluster0.viwwn8s.mongodb.net/?appName=Cluster0';

mongoose.connect(URI).then(async () => {
    const sellerId = "69673f19fdeb1cdde0436d74"; // Sakthivel M
    const pendingTransactions = await Transaction.find({
        seller: sellerId,
        paymentStatus: 'COMPLETED',
        isSettled: false,
        isOffline: { $ne: true }
    });
    console.log(`Found ${pendingTransactions.length} pending transactions for seller ${sellerId}`);
    
    let totalEarnings = 0;
    const transactionIds = [];
    for (const tx of pendingTransactions) {
        const platformFee = 7;
        const sellerEarning = (tx.amount || 0) - platformFee;
        totalEarnings += sellerEarning;
        transactionIds.push(tx._id);
    }
    console.log(`Total Earnings Calculated: ${totalEarnings}`);
    
    // Let's also check what the UI sees
    let uiTotal = 0;
    for (const tx of pendingTransactions) {
        uiTotal += (tx.netAmount || 0);
    }
    console.log(`UI Total Calculated (using netAmount): ${uiTotal}`);

    process.exit(0);
}).catch(console.error);
