const express = require('express');
const router = express.Router();
const {
  getCampaigns,
  createCampaign,
  getTemplates,
  createTemplate,
  trackOpen,
  trackClick
} = require('../controllers/marketingController');
const { protect } = require('../middleware/auth');

// Public tracking routes
router.get('/track/open/:id', trackOpen);
router.get('/track/click/:id', trackClick);

// Private marketing management routes
router.get('/campaigns', protect, getCampaigns);
router.post('/campaigns', protect, createCampaign);
router.get('/templates', protect, getTemplates);
router.post('/templates', protect, createTemplate);

module.exports = router;
