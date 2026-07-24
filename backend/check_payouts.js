const mongoose = require('mongoose');
const Transaction = require('./src/models/Transaction');
const Payout = require('./src/models/Payout');

mongoose.connect('mongodb://localhost:27017/ecommerce').then(async () => {
    const txs = await Transaction.find({ paymentStatus: 'COMPLETED', isSettled: false, isOffline: { $ne: true } }).populate('seller');
    console.log(`Found ${txs.length} pending transactions`);
    let noPayout = 0;
    let withPayout = 0;
    let amountWithPayout = 0;
    let amountNoPayout = 0;
    txs.forEach(tx => {
        if (tx.payoutId) {
            withPayout++;
            amountWithPayout += tx.netAmount;
        } else {
            noPayout++;
            amountNoPayout += tx.netAmount;
        }
    });
    console.log(`With payoutId: ${withPayout} (Total: ${amountWithPayout}), Without payoutId: ${noPayout} (Total: ${amountNoPayout})`);
    
    const payouts = await Payout.find();
    console.log(`Found ${payouts.length} payouts in DB`);
    console.log(JSON.stringify(payouts, null, 2));

    process.exit(0);
}).catch(console.error);
