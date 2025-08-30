/**
 * Input validation middleware
 * Common validation rules for the application
 */

const { body, param, query, validationResult } = require('express-validator');

// Sanitize search input to prevent regex injection
const sanitizeSearch = (search) => {
  if (!search) return '';
  return search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Common validation rules
const validateObjectId = param('id').isMongoId().withMessage('Invalid ID format');

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const validateSearch = [
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term too long')
];

// Student validation rules
const validateStudent = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be between 1 and 50 characters')
    .escape(),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be between 1 and 50 characters')
    .escape(),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('dateOfBirth')
    .isISO8601()
    .toDate()
    .withMessage('Valid date of birth is required'),
  
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number too long'),
  
  body('currentClass')
    .optional()
    .isMongoId()
    .withMessage('Invalid class ID format'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'graduated', 'transferred', 'suspended'])
    .withMessage('Invalid status value')
];

// Teacher validation rules
const validateTeacher = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be between 1 and 50 characters')
    .escape(),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be between 1 and 50 characters')
    .escape(),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('phone')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Phone number is required and must be between 1 and 20 characters'),
  
  body('department')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Department is required and must be between 1 and 100 characters'),
  
  body('position')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Position is required and must be between 1 and 100 characters')
];

// Authentication validation rules
const validateLogin = [
  body('username')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Username is required and must be between 1 and 50 characters'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.formatError('Validation failed', 400, errors.array());
  }
  next();
};

module.exports = {
  sanitizeSearch,
  validateObjectId,
  validatePagination,
  validateSearch,
  validateStudent,
  validateTeacher,
  validateLogin,
  handleValidationErrors
};
