const Campaign = require('../models/Campaign');
const Template = require('../models/Template');

// @desc    Get all campaigns
// @route   GET /api/marketing/campaigns
// @access  Private
const getCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({ createdBy: req.user.id })
    .sort({ createdAt: -1 });

  res.json({ data: campaigns });
};

// @desc    Create a campaign
// @route   POST /api/marketing/campaigns
// @access  Private
const createCampaign = async (req, res) => {
  const { name, subject, content, scheduledAt } = req.body;

  if (!name || !subject || !content) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const campaign = await Campaign.create({
    name,
    subject,
    content,
    scheduledAt,
    status: scheduledAt ? 'Scheduled' : 'Draft',
    createdBy: req.user.id,
  });

  res.status(201).json({ data: campaign });
};

// @desc    Get all templates
// @route   GET /api/marketing/templates
// @access  Private
const getTemplates = async (req, res) => {
  // Get system global templates + user's own templates
  const templates = await Template.find({
    $or: [
      { isGlobal: true },
      { createdBy: req.user.id }
    ]
  }).sort({ createdAt: -1 });

  res.json({ data: templates });
};

// @desc    Create a template
// @route   POST /api/marketing/templates
// @access  Private
const createTemplate = async (req, res) => {
  const { name, subject, content } = req.body;

  const template = await Template.create({
    name,
    subject,
    content,
    createdBy: req.user.id,
    isGlobal: req.user.role === 'admin' // Only admins create global templates
  });

  res.status(201).json({ data: template });
};

// @desc    Track email open (Pixel)
// @route   GET /api/marketing/track/open/:id
// @access  Public
const trackOpen = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Increment open count atomically
    await Campaign.findByIdAndUpdate(id, {
      $inc: { 'stats.opened': 1 }
    });
  } catch (error) {
    console.error('Track open error:', error);
  }

  // Return 1x1 transparent GIF
  const img = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': img.length,
  });
  res.end(img);
};

// @desc    Track email click
// @route   GET /api/marketing/track/click/:id
// @access  Public
const trackClick = async (req, res) => {
  const { id } = req.params;
  const { url } = req.query;

  try {
    await Campaign.findByIdAndUpdate(id, {
      $inc: { 'stats.clicked': 1 }
    });
  } catch (error) {
    console.error('Track click error:', error);
  }

  if (url) {
    res.redirect(url);
  } else {
    res.status(400).send('Invalid URL');
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
  getTemplates,
  createTemplate,
  trackOpen,
  trackClick
};
