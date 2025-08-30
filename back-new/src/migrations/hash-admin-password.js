/**
 * Admin Password Migration Script
 * 
 * This script helps migrate from plain text admin passwords to bcrypt hashed passwords.
 * 
 * USAGE:
 * 1. Set your desired admin password in ADMIN_PASSWORD environment variable
 * 2. Run: node src/migrations/hash-admin-password.js
 * 3. Copy the generated hash to your .env file as ADMIN_PASSWORD_HASH
 * 4. Update your .env file to remove ADMIN_PASSWORD
 * 5. Restart your server
 * 
 * SECURITY NOTES:
 * - Never commit .env files to version control
 * - Use strong passwords (minimum 8 characters, mix of upper/lower/numbers/symbols)
 * - Consider using a password manager to generate secure passwords
 */

const bcrypt = require('bcryptjs');
require('dotenv').config();

const generatePasswordHash = async (password) => {
  try {
    // Generate salt with 12 rounds (industry standard)
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('✅ Password hash generated successfully');
    console.log('📝 Copy this hash to your .env file as ADMIN_PASSWORD_HASH:');
    console.log('');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('1. Remove ADMIN_PASSWORD from your .env file');
    console.log('2. Add ADMIN_PASSWORD_HASH with the value above');
    console.log('3. Restart your server');
    console.log('4. Delete this script after migration');
    
    return hash;
  } catch (error) {
    console.error('❌ Error generating password hash:', error.message);
    process.exit(1);
  }
};

const verifyPassword = async (password, hash) => {
  try {
    const isValid = await bcrypt.compare(password, hash);
    console.log(`🔐 Password verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    return isValid;
  } catch (error) {
    console.error('❌ Error verifying password:', error.message);
    return false;
  }
};

const main = async () => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    console.error('❌ ADMIN_PASSWORD environment variable not set');
    console.log('');
    console.log('💡 To use this script:');
    console.log('1. Set ADMIN_PASSWORD in your .env file');
    console.log('2. Run: node src/migrations/hash-admin-password.js');
    process.exit(1);
  }
  
  if (adminPassword.length < 8) {
    console.error('❌ Password must be at least 8 characters long');
    process.exit(1);
  }
  
  console.log('🔐 Admin Password Migration Script');
  console.log('=====================================');
  console.log('');
  console.log(`📝 Current password length: ${adminPassword.length} characters`);
  console.log('');
  
  // Generate hash
  const hash = await generatePasswordHash(adminPassword);
  
  // Verify the hash works
  console.log('');
  console.log('🔍 Verifying generated hash...');
  await verifyPassword(adminPassword, hash);
  
  console.log('');
  console.log('🎉 Migration script completed successfully!');
  console.log('📋 Follow the steps above to complete the migration.');
};

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generatePasswordHash,
  verifyPassword
};
