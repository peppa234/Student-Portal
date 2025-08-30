/**
 * JWT Secret Generator Script
 * 
 * This script generates a cryptographically secure JWT secret.
 * 
 * USAGE:
 * 1. Run: node src/migrations/generate-jwt-secret.js
 * 2. Copy the generated secret to your .env file as JWT_SECRET
 * 3. Ensure JWT_SECRET is at least 32 characters long
 * 4. Restart your server
 * 
 * SECURITY NOTES:
 * - Never commit .env files to version control
 * - Use different secrets for different environments
 * - Rotate secrets periodically in production
 * - Store secrets securely (environment variables, secret management services)
 */

const crypto = require('crypto');

const generateJWTSecret = () => {
  try {
    // Generate 64 random bytes (512 bits) and convert to hex
    const secret = crypto.randomBytes(64).toString('hex');
    
    console.log('🔐 JWT Secret Generator');
    console.log('========================');
    console.log('');
    console.log('✅ Secure JWT secret generated successfully');
    console.log('📝 Copy this secret to your .env file as JWT_SECRET:');
    console.log('');
    console.log(`JWT_SECRET=${secret}`);
    console.log('');
    console.log('📊 Secret details:');
    console.log(`   Length: ${secret.length} characters`);
    console.log(`   Entropy: ${secret.length * 4} bits`);
    console.log(`   Format: Hexadecimal`);
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('1. Add JWT_SECRET to your .env file with the value above');
    console.log('2. Ensure JWT_SECRET is at least 32 characters long');
    console.log('3. Restart your server');
    console.log('4. Delete this script after use');
    console.log('');
    console.log('🔒 Security recommendations:');
    console.log('   - Use different secrets for development/staging/production');
    console.log('   - Rotate secrets periodically in production');
    console.log('   - Store secrets securely (not in code)');
    console.log('   - Consider using secret management services in production');
    
    return secret;
  } catch (error) {
    console.error('❌ Error generating JWT secret:', error.message);
    process.exit(1);
  }
};

const validateExistingSecret = (secret) => {
  if (!secret) {
    console.log('❌ No JWT_SECRET found in environment');
    return false;
  }
  
  if (secret.length < 32) {
    console.log(`❌ JWT_SECRET too short (${secret.length} chars, minimum 32 required)`);
    return false;
  }
  
  console.log(`✅ JWT_SECRET validation passed (${secret.length} chars)`);
  return true;
};

const main = () => {
  const existingSecret = process.env.JWT_SECRET;
  
  if (existingSecret) {
    console.log('🔍 Found existing JWT_SECRET in environment');
    validateExistingSecret(existingSecret);
    console.log('');
    console.log('💡 To generate a new secret, remove JWT_SECRET from your .env file and run this script again');
  } else {
    generateJWTSecret();
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateJWTSecret,
  validateExistingSecret
};
