const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  senderType: {
    type: String,
    enum: ['User', 'Seller'],
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderType'
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// TTL Index: Delete message 15 days (1296000 seconds) after creation
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1296000 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
