/**
 * Global error handling middleware
 * This middleware catches all errors and formats them consistently
 */

// Handle 404 errors
const handleNotFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;
  next(error);
};

// Global error handler
const handleError = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error('🚨 Error Details:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, status: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${field} = ${value}. Please use another value.`;
    error = { message, status: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, status: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, status: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, status: 401 };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, status: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, status: 400 };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, status: 429 };
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    const message = 'Database connection error. Please try again later.';
    error = { message, status: 503 };
  }

  // Default error
  const status = error.status || err.status || 500;
  const message = error.message || err.message || 'Internal Server Error';

  // Determine if we should send detailed error info
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // Error response object
  const errorResponse = {
    success: false,
    message: message,
    status: status,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add stack trace in development
  if (isDevelopment && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Add additional error details in development
  if (isDevelopment) {
    errorResponse.error = {
      name: err.name,
      code: err.code,
      details: err.errors || err.keyValue || null
    };
  }

  // Production error handling
  if (isProduction) {
    // Don't expose internal error details in production
    if (status === 500) {
      errorResponse.message = 'Internal Server Error';
      errorResponse.error = null;
    }
  }

  // Set appropriate headers
  res.status(status);

  // Special handling for specific error types
  if (status === 401) {
    res.set('WWW-Authenticate', 'Bearer');
  }

  if (status === 429) {
    const retryAfter = err.retryAfter || 60;
    res.set('Retry-After', retryAfter.toString());
  }

  // Send error response
  res.json(errorResponse);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create operational error
 */
const createOperationalError = (message, statusCode) => {
  return new AppError(message, statusCode, true);
};

/**
 * Create programming error
 */
const createProgrammingError = (message, statusCode = 500) => {
  return new AppError(message, statusCode, false);
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = (err) => {
  console.error('🚨 UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  
  process.exit(1);
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = (err) => {
  console.error('🚨 UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  
  process.exit(1);
};

/**
 * Setup global error handlers
 */
const setupGlobalErrorHandlers = () => {
  process.on('unhandledRejection', handleUnhandledRejection);
  process.on('uncaughtException', handleUncaughtException);
};

/**
 * Remove global error handlers (useful for testing)
 */
const removeGlobalErrorHandlers = () => {
  process.removeListener('unhandledRejection', handleUnhandledRejection);
  process.removeListener('uncaughtException', handleUncaughtException);
};

/**
 * Error logging utility
 */
const logError = (error, req = null, additionalInfo = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode
    },
    request: req ? {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    } : null,
    additionalInfo
  };

  console.error('🚨 Error Log:', JSON.stringify(errorLog, null, 2));
  
  // In production, you might want to send this to a logging service
  // like Winston, Bunyan, or an external service like Loggly, Papertrail, etc.
};

/**
 * Validation error formatter
 */
const formatValidationErrors = (errors) => {
  if (!errors) return [];
  
  return Object.keys(errors).map(field => ({
    field,
    message: errors[field].message,
    value: errors[field].value,
    kind: errors[field].kind
  }));
};

/**
 * Database error handler
 */
const handleDatabaseError = (error) => {
  if (error.name === 'ValidationError') {
    return {
      status: 400,
      message: 'Validation failed',
      errors: formatValidationErrors(error.errors)
    };
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return {
      status: 400,
      message: `Duplicate field: ${field}`,
      field,
      value: error.keyValue[field]
    };
  }

  if (error.name === 'CastError') {
    return {
      status: 400,
      message: 'Invalid ID format',
      field: error.path,
      value: error.value
    };
  }

  return {
    status: 500,
    message: 'Database error occurred'
  };
};

module.exports = {
  handleNotFound,
  handleError,
  asyncHandler,
  AppError,
  createOperationalError,
  createProgrammingError,
  setupGlobalErrorHandlers,
  removeGlobalErrorHandlers,
  logError,
  formatValidationErrors,
  handleDatabaseError
};
