const express = require('express');
const router = express.Router();
const chatController = require('../controllers/ChatController');
const authenticate = require('../middlewares/userAuthMiddleware');
const authenticateSeller = require('../middlewares/sellerAuthMiddleware');

// Customer Routes
router.get('/user', authenticate, chatController.getUserChats);
router.post('/user/create', authenticate, chatController.getOrCreateChat);

// Seller Routes
router.get('/seller', authenticateSeller, chatController.getSellerChats);

// General Route (accessible by both, ideally we should check if they are part of the chat)
router.get('/:chatId/messages', chatController.getChatMessages);

module.exports = router;
