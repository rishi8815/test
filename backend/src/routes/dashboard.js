const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getTransactions,
  getPayouts,
  requestPayout,
  getProfile,
  updateProfile,
  getSettings,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes protected

router.get('/dashboard', getDashboard);
router.get('/transactions', getTransactions);
router.get('/payouts', getPayouts);
router.post('/payouts', requestPayout);
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.get('/settings', getSettings);

module.exports = router;
