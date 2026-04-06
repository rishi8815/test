require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const { initScheduler } = require('./services/scheduler');

const PORT = process.env.PORT || 4000;

// Validate Environment Variables
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is not defined in production environment');
    process.exit(1);
  }
}

// Connect to Database and start server
connectDB().then(() => {
  // Initialize Background Jobs
  initScheduler();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
