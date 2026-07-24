const mongoose = require('mongoose');
const Transaction = require('./backend/src/models/Transaction');
require('./backend/src/models/User');

mongoose.connect('mongodb://localhost:27017/ecommerce').then(async () => {
    const txs = await Transaction.find().populate('customer');
    const naTxs = txs.filter(tx => !tx.customer || !tx.customer.fullName);
    console.log(`Total transactions: ${txs.length}`);
    console.log(`Found ${naTxs.length} transactions with N/A customer.`);
    if (naTxs.length > 0) {
        console.log('Sample N/A transaction customer field:', naTxs[0].customer);
        console.log('Sample raw customer ID:', naTxs[0].get('customer'));
    }
    process.exit(0);
}).catch(console.error);
