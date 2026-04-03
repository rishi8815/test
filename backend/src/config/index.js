const dotenv = require('dotenv');

// Load env vars if not already loaded
dotenv.config();

const env = process.env.NODE_ENV || 'development';

const config = {
  env,
  isProd: env === 'production',
  isDev: env === 'development',
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  
  // Feature Toggles
  features: {
    mockPayments: process.env.MOCK_PAYMENTS === 'true' || env !== 'production',
    detailedLogging: process.env.DETAILED_LOGGING === 'true' || env !== 'production',
    emailSending: process.env.ENABLE_EMAIL === 'true', // Mock otherwise
  },

  // Services
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    // ...
  }
};

module.exports = config;
