// D:\Mani\Code with Zosh\Backup\source code\backend\src\services\SellerReportService.js
const OrderStatus = require("../domain/OrderStatus");
const SellerReport = require("../models/SellerReport");  // ✅ FIXED: Correct filename
const Order = require("../models/Order");

class SellerReportService {

  // ✅ ENHANCED: Get or create seller report
  async getSellerReport(sellerId) {
    try {
      // ✅ Always recalculate to ensure data matches transactions exactly
      const sellerReport = await this.recalculateSellerReport(sellerId);

      return sellerReport;
    } catch (err) {
      console.error("❌ Error fetching seller report:", err);
      throw new Error(`Error fetching seller report: ${err.message}`);
    }
  }

  // ✅ NEW: Incrementally update seller report when order is created/paid
  async incrementSellerReport(sellerId, orderData) {
    try {
      const {
        orderAmount,
        platformFee = 0,
        orderStatus = OrderStatus.PLACED,
        isCancelled = false
      } = orderData;

      const netEarnings = orderAmount - platformFee;

      // ✅ Use atomic $inc for race-condition safety
      const update = {
        $inc: {},
        $set: { updatedAt: new Date() }
      };

      // Always increment total orders
      update.$inc.totalOrders = 1;
      update.$inc.totalTransactions = 1;

      if (isCancelled || orderStatus === OrderStatus.CANCELLED) {
        // Cancelled order: increment canceled count, add to refunds
        update.$inc.canceledOrders = 1;
        update.$inc.totalRefunds = orderAmount;
        // Don't add to earnings for cancelled orders
      } else {
        // Successful order: add to earnings and sales
        update.$inc.totalEarnings = orderAmount;
        update.$inc.totalSales = 1;  // Count of successful sales
        update.$inc.netEarnings = netEarnings;
        update.$inc.totalTax = 0;  // Add tax calculation if needed
      }

      const updatedReport = await SellerReport.findOneAndUpdate(
        { seller: sellerId },
        update,
        { new: true, upsert: true, runValidators: true }
      );

      console.log("📈 Seller report updated:", {
        sellerId,
        orderAmount,
        platformFee,
        netEarnings,
        status: orderStatus
      });

      return updatedReport;
    } catch (err) {
      console.error("❌ Error incrementing seller report:", err);
      throw new Error(`Error updating seller report: ${err.message}`);
    }
  }

  // ✅ NEW: Decrement seller report when order is cancelled/refunded
  async decrementSellerReport(sellerId, refundData) {
    try {

      let sellerReport = await SellerReport.findOne({ seller: sellerId });

      // ✅ Create report if not exists
      if (!sellerReport) {
        sellerReport = new SellerReport({
          seller: sellerId,
          totalRefunds: refundData.amount,
          netEarnings: -refundData.amount
        });
      } else {
        // ✅ Safe updates with null checks
        sellerReport.totalRefunds = (sellerReport.totalRefunds || 0) + refundData.amount;
        sellerReport.netEarnings = (sellerReport.netEarnings || 0) - refundData.amount;

        // ✅ Fix: Ensure transactions array exists before unshift
        if (!sellerReport.transactions) {
          sellerReport.transactions = [];
        }
        sellerReport.transactions.unshift({
          type: 'REFUND',
          amount: refundData.amount,
          reason: refundData.reason || 'Return refund',
          referenceId: refundData.referenceId,
          createdAt: new Date()
        });
      }

      await sellerReport.save();

    } catch (error) {
      // ✅ Don't fail the main flow for report errors
      console.error('⚠️ Seller report adjustment failed (non-critical):', error.message);
      // Continue without throwing - refund already initiated
    }
  }

  // ✅ UPDATED: Update seller report (for manual adjustments or bulk sync)
  async updateSellerReport(sellerReport) {
    try {
      // ✅ Validate required fields
      if (!sellerReport._id || !sellerReport.seller) {
        throw new Error('Seller report must have _id and seller fields');
      }

      // ✅ Only update specific fields, don't replace entire document
      const updateFields = {
        totalEarnings: sellerReport.totalEarnings,
        totalSales: sellerReport.totalSales,
        totalRefunds: sellerReport.totalRefunds,
        totalTax: sellerReport.totalTax,
        netEarnings: sellerReport.netEarnings,
        totalOrders: sellerReport.totalOrders,
        canceledOrders: sellerReport.canceledOrders,
        totalTransactions: sellerReport.totalTransactions,
        updatedAt: new Date()
      };

      return await SellerReport.findByIdAndUpdate(
        sellerReport._id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );
    } catch (err) {
      console.error("❌ Error updating seller report:", err);
      throw new Error(`Error updating seller report: ${err.message}`);
    }
  }

  // ✅ NEW: Recalculate seller report from scratch (for data repair)
  async recalculateSellerReport(sellerId) {
    try {

      // Require Transaction here to avoid circular dependencies if any
      const Transaction = require("../models/Transaction");

      // We calculate based on COMPLETED transactions just like the TransactionTable
      const completedTransactions = await Transaction.find({ 
        seller: sellerId,
        paymentStatus: 'COMPLETED'
      }).populate({
        path: 'order',
        populate: {
          path: 'orderItems',
          populate: {
            path: 'returnRequest',
            select: 'status refundStatus refundAmount'
          }
        }
      });

      const totalSales = completedTransactions.length;
      let totalGross = 0;
      let totalFees = 0;
      let totalNet = 0;
      let totalRefunds = 0;

      for (const t of completedTransactions) {
        totalGross += (t.amount || 0);
        totalFees += (t.platformFee || 0);
        totalNet += (t.netAmount || 0);

        // Calculate refunded amount for this transaction's order
        let orderRefunded = 0;
        if (t.order && t.order.orderItems) {
          const hasRefund = t.order.orderItems.some(item => 
            item.returnRequest && 
            item.returnRequest.status === 'COMPLETED' && 
            item.returnRequest.refundStatus === 'COMPLETED'
          );

          if (hasRefund) {
            orderRefunded = t.order.orderItems.reduce((sum, item) => {
              if (item.returnRequest && 
                  item.returnRequest.status === 'COMPLETED' && 
                  item.returnRequest.refundStatus === 'COMPLETED') {
                return sum + (item.returnRequest.refundAmount || item.sellingPrice || 0);
              }
              return sum;
            }, 0);
          }
        }
        totalRefunds += orderRefunded;
      }

      const netAfterReturns = totalNet - totalRefunds;

      // Also count cancelled orders if we want
      const canceledOrders = await Order.countDocuments({
        seller: sellerId,
        orderStatus: OrderStatus.CANCELLED
      });

      // ✅ Update or create report with calculated values
      const report = await SellerReport.findOneAndUpdate(
        { seller: sellerId },
        {
          $set: {
            totalEarnings: netAfterReturns,
            totalSales,
            totalRefunds,
            totalTax: totalFees, // Store platform fees here or use a separate field if available
            netEarnings: netAfterReturns,
            totalOrders: totalSales + canceledOrders,
            canceledOrders,
            totalTransactions: await Transaction.countDocuments({ seller: sellerId }),
            lastRecalculated: new Date(),
            updatedAt: new Date()
          }
        },
        { new: true, upsert: true, runValidators: true }
      );



      return report;
    } catch (err) {
      console.error("❌ Error recalculating seller report:", err);
      throw new Error(`Error recalculating seller report: ${err.message}`);
    }
  }
}

module.exports = new SellerReportService();