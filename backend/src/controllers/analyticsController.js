const Event = require('../models/Event');
const Transaction = require('../models/Transaction');

// @desc    Ingest raw event (clickstream)
// @route   POST /api/analytics/events
// @access  Public (or with public API key)
const ingestEvent = async (req, res) => {
  const { type, resellerId, sessionId, metadata, url } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  // Async processing (fire and forget for response speed, or queue)
  // For MVP, we save directly
  try {
    await Event.create({
      type,
      resellerId,
      sessionId,
      metadata,
      url,
      ipAddress,
      userAgent
    });
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    // Don't block client on analytics error
    console.error('Event ingestion error:', error);
    res.status(200).json({ status: 'queued' }); 
  }
};

// @desc    Get aggregated analytics
// @route   GET /api/analytics/stats
// @access  Private (Admin)
const getAnalyticsStats = async (req, res) => {
  const { range = '30d' } = req.query;
  const now = new Date();
  const past = new Date();
  if (range === '7d') past.setDate(now.getDate() - 7);
  else if (range === '90d') past.setDate(now.getDate() - 90);
  else past.setDate(now.getDate() - 30);

  // Aggregation Pipeline for Transactions
  const revenueStats = await Transaction.aggregate([
    { $match: { createdAt: { $gte: past }, status: 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalRevenue: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Aggregation Pipeline for Events
  const eventStats = await Event.aggregate([
    { $match: { createdAt: { $gte: past } } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    range,
    revenueTrend: revenueStats,
    eventBreakdown: eventStats
  });
};

module.exports = {
  ingestEvent,
  getAnalyticsStats
};
