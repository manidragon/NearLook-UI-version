const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/authenticate');

router.post('/register-token', authenticate, notificationController.registerToken);

module.exports = router;
