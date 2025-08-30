const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Simple in-memory store for failed login attempts (in production, use Redis or database)
const failedLoginAttempts = new Map();

const login = (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if account is locked
    const attempts = failedLoginAttempts.get(username) || 0;
    if (attempts >= 5) {
      return res.formatError('Account temporarily locked due to too many failed attempts. Please try again in 15 minutes.', 429);
    }

    if (!username || !password) {
      return res.formatError('Username and password are required', 400);
    }

    // Check if environment variables are loaded
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) {
      console.error('❌ Environment variables not loaded!');
      return res.formatError('Server configuration error - admin credentials not set', 500);
    }

    // Compare username
    const usernameMatch = username === process.env.ADMIN_USERNAME;
    
    if (!usernameMatch) {
      // Increment failed attempts
      failedLoginAttempts.set(username, attempts + 1);
      
      // Clear attempts after 15 minutes
      setTimeout(() => {
        failedLoginAttempts.delete(username);
      }, 15 * 60 * 1000);
      
      return res.formatError('Invalid credentials', 401);
    }

    // Compare password using bcrypt
    const passwordMatch = bcrypt.compareSync(password, process.env.ADMIN_PASSWORD_HASH);
    
    if (!passwordMatch) {
      // Increment failed attempts
      failedLoginAttempts.set(username, attempts + 1);
      
      // Clear attempts after 15 minutes
      setTimeout(() => {
        failedLoginAttempts.delete(username);
      }, 15 * 60 * 1000);
      
      return res.formatError('Invalid credentials', 401);
    }

    // Clear failed attempts on successful login
    failedLoginAttempts.delete(username);

    // Generate JWT
    const token = jwt.sign(
      { role: 'admin', username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Development logging only
    if (process.env.NODE_ENV === 'development') {
      console.log('🎉 Login successful for user:', username);
    }

    res.formatSuccess({
      message: 'Login successful',
      token,
      user: { username, role: 'admin' }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.formatError('Login failed', 500, error.message);
  }
};

const getProfile = (req, res) => {
  try {
    res.formatSuccess({
      message: 'Profile retrieved successfully',
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.formatError('Failed to get profile', 500, error.message);
  }
};

const updateProfile = (req, res) => {
  try {
    const { username } = req.body;
    
    if (username && username !== req.user.username) {
      return res.formatError('Username cannot be changed', 400);
    }
    
    res.formatSuccess({
      message: 'Profile updated successfully',
      user: req.user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.formatError('Failed to update profile', 500, error.message);
  }
};

const changePassword = (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.formatError('Current and new password are required', 400);
    }
    
    // Verify current password
    const currentPasswordMatch = bcrypt.compareSync(currentPassword, process.env.ADMIN_PASSWORD_HASH);
    if (!currentPasswordMatch) {
      return res.formatError('Current password is incorrect', 401);
    }
    
    // Validate new password
    if (newPassword.length < 8) {
      return res.formatError('New password must be at least 8 characters long', 400);
    }
    
    // Hash new password
    const newPasswordHash = bcrypt.hashSync(newPassword, 12);
    
    res.formatSuccess({
      message: 'Password changed successfully. Please update your .env file with the new hash and restart the server.',
      newHash: newPasswordHash
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.formatError('Failed to change password', 500, error.message);
  }
};

const logout = (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    res.formatSuccess({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.formatError('Logout failed', 500, error.message);
  }
};

const verifyToken = (req, res) => {
  try {
    res.formatSuccess({
      message: 'Token is valid',
      user: req.user
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.formatError('Token verification failed', 500, error.message);
  }
};

const getSystemStats = (req, res) => {
  try {
    // Basic system stats - in a real app you might get these from the database
    const stats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    };
    
    res.formatSuccess({
      message: 'System stats retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.formatError('Failed to get system stats', 500, error.message);
  }
};

module.exports = { 
  login, 
  getProfile, 
  updateProfile, 
  changePassword, 
  logout, 
  verifyToken, 
  getSystemStats 
};