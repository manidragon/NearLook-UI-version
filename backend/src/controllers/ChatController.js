const Chat = require('../models/Chat');
const Message = require('../models/Message');

module.exports = {
  // Get all chats for a user (Customer)
  getUserChats: async (req, res) => {
    try {
      const chats = await Chat.find({ user: req.user._id })
        .populate({ path: 'seller', populate: { path: 'businessDetails' } })
        .populate('lastMessage')
        .sort({ updatedAt: -1 });
      res.status(200).json(chats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all chats for a seller
  getSellerChats: async (req, res) => {
    try {
      const chats = await Chat.find({ seller: req.seller._id })
        .populate('user', 'fullName email profilePicture')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });
      res.status(200).json(chats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get or Create a chat between a user and a seller
  getOrCreateChat: async (req, res) => {
    try {
      const { sellerId } = req.body;
      const userId = req.user._id;

      let chat = await Chat.findOne({ user: userId, seller: sellerId })
        .populate({ path: 'seller', populate: { path: 'businessDetails' } });

      if (!chat) {
        chat = await Chat.create({ user: userId, seller: sellerId });
        chat = await chat.populate({ path: 'seller', populate: { path: 'businessDetails' } });
      }
      res.status(200).json(chat);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get messages for a specific chat
  getChatMessages: async (req, res) => {
    try {
      const { chatId } = req.params;
      const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 });
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
