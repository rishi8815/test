const cron = require('node-cron');
const Campaign = require('../models/Campaign');
const config = require('../config');

// Mock Email Sender
const sendEmail = async (campaign, recipient) => {
  // Integrate with SES / SendGrid here
  console.log(`[Email Mock] Sending '${campaign.subject}' to ${recipient.email}`);
  return true;
};

const initScheduler = () => {
  console.log('Scheduler initialized...');

  // Check for scheduled campaigns every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Find campaigns scheduled for now or past that are still 'Scheduled'
      const campaigns = await Campaign.find({
        status: 'Scheduled',
        scheduledAt: { $lte: now }
      });

      for (const campaign of campaigns) {
        console.log(`Processing campaign: ${campaign.name}`);
        campaign.status = 'Sending';
        await campaign.save();

        // Simulate sending to a list (Mock)
        // In real app, fetch users/segments
        const mockRecipients = [{ email: 'test@example.com' }]; 
        
        for (const recipient of mockRecipients) {
          await sendEmail(campaign, recipient);
          campaign.stats.sent += 1;
        }

        campaign.status = 'Sent';
        campaign.sentAt = new Date();
        await campaign.save();
        console.log(`Campaign ${campaign.name} sent.`);
      }

    } catch (error) {
      console.error('Scheduler Error:', error);
    }
  });
};

module.exports = { initScheduler };
