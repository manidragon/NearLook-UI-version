require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./src/models/Transaction');

const URI = process.env.MONGO_URI || 'mongodb+srv://manidragon0604_db_user:JImf5rlbLjgGUwJI@cluster0.viwwn8s.mongodb.net/?appName=Cluster0';

mongoose.connect(URI).then(async () => {
    const sellerId = "69673f19fdeb1cdde0436d74";
    const allForSeller = await Transaction.find({ seller: sellerId });
    console.log(`Total transactions for seller: ${allForSeller.length}`);

    const completed = await Transaction.find({ seller: sellerId, paymentStatus: 'COMPLETED' });
    console.log(`COMPLETED: ${completed.length}`);

    const notSettled = await Transaction.find({ seller: sellerId, paymentStatus: 'COMPLETED', isSettled: false });
    console.log(`COMPLETED + NOT SETTLED: ${notSettled.length}`);

    const notOffline = await Transaction.find({ seller: sellerId, paymentStatus: 'COMPLETED', isSettled: false, isOffline: { $ne: true } });
    console.log(`COMPLETED + NOT SETTLED + NOT OFFLINE: ${notOffline.length}`);

    const nullPayout = await Transaction.find({ seller: sellerId, paymentStatus: 'COMPLETED', isSettled: false, payoutId: null });
    console.log(`COMPLETED + NOT SETTLED + PAYOUTID=null: ${nullPayout.length}`);

    process.exit(0);
}).catch(console.error);
