const express = require('express');
const router = express.Router();
const adminPayoutController = require('../controllers/adminPayoutController');
// Note: Ensure admin authentication middleware is applied here if needed.

// Note: Ensure admin authentication middleware is applied here if needed.
// We assume it's mounted under /api/admin/payouts in index.js with appropriate auth

router.get('/', adminPayoutController.getAllPayouts);
router.post('/trigger', adminPayoutController.triggerPayouts);
router.get('/:id', adminPayoutController.getPayoutDetails);
router.put('/:id/complete', adminPayoutController.completePayout);

module.exports = router;
