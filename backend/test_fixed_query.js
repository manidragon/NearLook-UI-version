require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./src/models/Transaction');

const URI = process.env.MONGO_URI || 'mongodb+srv://manidragon0604_db_user:JImf5rlbLjgGUwJI@cluster0.viwwn8s.mongodb.net/?appName=Cluster0';

mongoose.connect(URI).then(async () => {
    const sellerId = "69673f19fdeb1cdde0436d74";

    const notOffline = await Transaction.find({ seller: sellerId, paymentStatus: 'COMPLETED', isSettled: { $ne: true }, isOffline: { $ne: true } });
    console.log(`COMPLETED + NOT SETTLED ($ne) + NOT OFFLINE: ${notOffline.length}`);
    
    process.exit(0);
}).catch(console.error);
