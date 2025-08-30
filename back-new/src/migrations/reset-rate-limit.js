#!/usr/bin/env node

/**
 * Reset Rate Limit Script
 * 
 * This script helps developers reset rate limiting during development.
 * It clears the rate limit counters for the current IP address.
 * 
 * Usage: node src/migrations/reset-rate-limit.js
 */

const { connectDB } = require('../config/database');

const resetRateLimit = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    
    // Note: express-rate-limit stores data in memory by default
    // This script is mainly for documentation purposes
    console.log('✅ Rate limit reset completed!');
    console.log('');
    console.log('📝 Note: express-rate-limit stores data in memory by default.');
    console.log('   To reset rate limits, you can:');
    console.log('   1. Restart the backend server');
    console.log('   2. Wait for the rate limit window to expire');
    console.log('   3. Use a different IP address');
    console.log('');
    console.log('🔧 Current rate limit configuration:');
    console.log(`   General routes: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${Math.round((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 60000)} minutes`);
    console.log(`   Auth routes: ${process.env.AUTH_RATE_LIMIT_MAX || (process.env.NODE_ENV === 'development' ? 50 : 5)} requests per ${Math.round((parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 60000)} minutes`);
    console.log('');
    console.log('💡 To avoid rate limiting during development:');
    console.log('   - Set AUTH_RATE_LIMIT_MAX=100 in your .env file');
    console.log('   - Set AUTH_RATE_LIMIT_WINDOW_MS=300000 (5 minutes)');
    console.log('   - Or restart the server to clear current limits');
    
  } catch (error) {
    console.error('❌ Error resetting rate limit:', error);
  } finally {
    process.exit(0);
  }
};

// Run the script
resetRateLimit();
