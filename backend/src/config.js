/**
 * Centralized Configuration Module
 * 
 * Validates required environment variables at startup
 * and exports them for use across the application.
 */

require('dotenv').config();

// ============ Required Environment Variables ============

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is required.');
  console.error('Please set JWT_SECRET in your .env file with a strong secret key.');
  process.exit(1);
}

if (process.env.JWT_SECRET === 'change_me') {
  console.warn('WARNING: Default JWT_SECRET detected. Please use a strong secret in production.');
}

// ============ Exports ============

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/se',
};
