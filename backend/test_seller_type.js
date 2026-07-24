require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./src/models/Transaction');

const URI = process.env.MONGO_URI || 'mongodb+srv://manidragon0604_db_user:JImf5rlbLjgGUwJI@cluster0.viwwn8s.mongodb.net/?appName=Cluster0';

mongoose.connect(URI).then(async () => {
    const rawTxs = await mongoose.connection.db.collection('transactions').find({
        seller: "69673f19fdeb1cdde0436d74" // as string
    }).toArray();
    console.log(`Transactions with seller as STRING: ${rawTxs.length}`);

    const rawTxsId = await mongoose.connection.db.collection('transactions').find({
        seller: new mongoose.Types.ObjectId("69673f19fdeb1cdde0436d74") // as ObjectId
    }).toArray();
    console.log(`Transactions with seller as OBJECTID: ${rawTxsId.length}`);

    process.exit(0);
}).catch(console.error);
