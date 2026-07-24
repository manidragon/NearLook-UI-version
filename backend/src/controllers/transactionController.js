// D:\Mani\Code with Zosh\Backup\source code\backend\src\controllers\transactionController.js
const SellerService = require("../services/SellerService");
const TransactionService = require("../services/TransactionService");

class TransactionController {
async getTransactionBySeller(req, res) {
  try {
    const seller = await req.seller;
    
    // ✅ Parse query params for filtering
    const { startDate, endDate, status } = req.query;
    
    const transactions = await TransactionService.getTransactionsBySellerId(
      seller._id,
      { startDate, endDate, status }
    );
    
    
    // ✅ Return just the array (simpler for frontend)
    return res.status(200).json(transactions);
  } catch (error) {
    console.error("❌ Error fetching transactions:", {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      error: "Failed to fetch transactions", 
      message: error.message 
    });
  }
}
  async getAllTransactionsForAdmin(req, res) {
    try {
      const transactions = await TransactionService.getAllTransactions();
      return res.status(200).json(transactions);
    } catch (error) {
      console.error("❌ Error fetching all transactions:", error);
      return res.status(500).json({ error: "Failed to fetch transactions" });
    }
  }
}

module.exports = new TransactionController();