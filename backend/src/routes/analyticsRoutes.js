const express = require('express');
const router = express.Router();
const { ingestEvent, getAnalyticsStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.post('/events', ingestEvent);
router.get('/stats', protect, authorize('admin'), getAnalyticsStats);

module.exports = router;
