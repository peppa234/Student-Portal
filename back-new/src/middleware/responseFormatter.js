/**
 * Response formatter middleware
 * Standardizes all API responses to ensure consistency
 */

const responseFormatter = (req, res, next) => {
  // Add response formatting methods to res object
  res.formatSuccess = (data, message = 'Success', status = 200) => {
    res.status(status).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    });
  };
  
  res.formatError = (message, status = 500, error = null) => {
    res.status(status).json({
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    });
  };
  
  next();
};

module.exports = {
  responseFormatter
};
