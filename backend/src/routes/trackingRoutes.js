const express = require('express');
const router = express.Router();
const {
  trackClick,
  recordConversion,
  getDashboardStats,
} = require('../controllers/trackingController');
const { protect } = require('../middleware/auth');

router.post('/click', trackClick);
router.post('/conversion', protect, recordConversion); // Should be protected or have API Key
router.get('/dashboard', protect, getDashboardStats);

module.exports = router;
