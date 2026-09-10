const Order = require("../models/Order");
const ReturnRequest = require("../models/ReturnRequest");
const Enquiry = require("../models/Enquiry");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

class SellerNotificationController {
  async getNotificationCounts(req, res) {
    try {
      const jwt = req.headers.authorization?.split(" ")[1];
      if (!jwt) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const SellerService = require("../services/SellerService");
      const seller = await SellerService.getSellerProfile(jwt);

      if (!seller) {
        return res.status(404).json({ error: "Seller not found" });
      }

      const sellerId = seller._id;

      const [
        ordersCount,
        returnsCount,
        replacementsCount,
        enquiriesCount,
        chatsCount
      ] = await Promise.all([
        // Orders: PLACED or PENDING
        Order.countDocuments({
          seller: sellerId,
          orderStatus: { $in: ['PLACED', 'PENDING'] }
        }),

        // Returns: PENDING, isReplacement: false
        ReturnRequest.countDocuments({
          seller: sellerId,
          status: 'PENDING',
          isReplacement: { $ne: true }
        }),

        // Replacements: PENDING, isReplacement: true
        ReturnRequest.countDocuments({
          seller: sellerId,
          status: 'PENDING',
          isReplacement: true
        }),

        // Enquiries: NEW
        Enquiry.countDocuments({
          seller: sellerId,
          status: 'NEW'
        }),

        // Chats: Unread messages from users in this seller's chats
        Chat.distinct('_id', { seller: sellerId }).then(chatIds => 
          Message.countDocuments({ 
            chat: { $in: chatIds }, 
            senderType: 'User', 
            isRead: false 
          })
        )
      ]);

      return res.status(200).json({
        orders: ordersCount,
        returns: returnsCount,
        replacements: replacementsCount,
        enquiries: enquiriesCount,
        chats: chatsCount
      });

    } catch (error) {
      console.error("Error fetching notification counts:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

module.exports = new SellerNotificationController();
