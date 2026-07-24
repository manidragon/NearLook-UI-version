const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const checkout = async (req, res) => {
    // We expect { cart, billing } in req.body
    const { cart, billing } = req.body;
    const sellerId = req.seller._id;

    if (!cart || cart.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let totalMrpPrice = 0;
        let totalSellingPrice = 0;
        let totalItem = 0;
        const orderItemsIds = [];

        // 1. Process Cart Items and Deduct Stock
        for (const item of cart) {
            const qty = item.qty;
            const sellingPrice = Number(item.offer.sellingPrice);
            const mrpPrice = Number(item.offer.mrpPrice);
            const variantId = item.variantId;
            const offerId = item.offer._id;
            const productId = item.productId;

            totalMrpPrice += mrpPrice * qty;
            totalSellingPrice += sellingPrice * qty;
            totalItem += qty;

            // Deduct Stock
            const result = await Product.updateOne(
                {
                    _id: productId,
                    'variants._id': variantId,
                    'variants.offers._id': offerId,
                    'variants.offers.stock': { $gte: qty } // Ensure enough stock
                },
                {
                    $inc: { 'variants.$[v].offers.$[o].stock': -qty }
                },
                {
                    arrayFilters: [
                        { 'v._id': variantId },
                        { 'o._id': offerId }
                    ],
                    session
                }
            );

            if (result.modifiedCount === 0) {
                throw new Error(`Insufficient stock or invalid product for: ${item.productTitle}`);
            }

            // Create OrderItem
            const orderItem = new OrderItem({
                product: productId,
                size: item.color + ' ' + Object.values(item.specifications).join(' '),
                quantity: qty,
                mrpPrice: mrpPrice,
                sellingPrice: sellingPrice,
                isOffline: true
            });
            await orderItem.save({ session });
            orderItemsIds.push(orderItem._id);
        }

        const discount = Number(billing?.discount) || 0;
        const finalAmount = Math.max(0, totalSellingPrice - discount);

        // 2. Create Order
        const order = new Order({
            seller: sellerId,
            orderItems: orderItemsIds,
            totalMrpPrice,
            totalSellingPrice,
            discount,
            orderStatus: 'DELIVERED', // Offline sales are instantly delivered
            fulfillmentType: 'SELF_PICKUP',
            totalItem,
            paymentMethod: 'CASH_ON_DELIVERY', // Defaulted to COD as requested
            paymentStatus: 'COMPLETED',
            isOffline: true,
            billingInfo: {
                customerName: billing?.customerName || "Walk-in Customer",
                customerPhone: billing?.customerPhone || "",
                discount: discount
            }
        });
        await order.save({ session });

        // 3. Create Transaction
        const transaction = new Transaction({
            order: order._id,
            seller: sellerId,
            amount: finalAmount,
            platformFee: 0, // No platform fee for offline sales? 
            netAmount: finalAmount,
            paymentStatus: 'COMPLETED',
            paymentMethod: 'CASH_ON_DELIVERY',
            isOffline: true
        });
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ message: "Offline sale recorded successfully", order });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Offline Sale Error:", error);
        res.status(400).json({ message: error.message || "Failed to record offline sale" });
    }
};

module.exports = {
    checkout
};
