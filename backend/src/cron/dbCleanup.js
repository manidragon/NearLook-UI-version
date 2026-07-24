const cron = require('node-cron');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const initDbCleanup = () => {
  // Run every day at 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      // Find all chats
      const chats = await Chat.find({});
      let deletedCount = 0;
      for (const chat of chats) {
        // Count how many messages belong to this chat
        const messageCount = await Message.countDocuments({ chat: chat._id });
        
        // If there are no messages left (all expired), we can delete the Chat document
        if (messageCount === 0) {
          await Chat.findByIdAndDelete(chat._id);
          deletedCount++;
        }
      }
    } catch (error) {
      console.error('Error during database cleanup task:', error);
    }
  });
};
module.exports = initDbCleanup;