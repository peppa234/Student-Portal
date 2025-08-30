const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  authenticateToken, 
  requireAdmin
} = require('../middleware/auth');
const {
  validateStudent,
  validateObjectId,
  validatePagination,
  validateSearch,
  handleValidationErrors
} = require('../middleware/validators');

// Import controller
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAcademicPerformance,
  transferStudentToClass,
  getStudentsByClass
} = require('../controllers/StudentController');

// All routes require authentication
router.use(authenticateToken);

// All routes require admin access
router.use(requireAdmin);

// Get all students with pagination and search
router.get('/', 
  validatePagination,
  validateSearch,
  handleValidationErrors,
  asyncHandler(getAllStudents)
);

// Get students by class
router.get('/class/:classId',
  validateObjectId,
  validatePagination,
  handleValidationErrors,
  asyncHandler(getStudentsByClass)
);

// Get student academic performance
router.get('/:id/performance',
  validateObjectId,
  handleValidationErrors,
  asyncHandler(getStudentAcademicPerformance)
);

// Create new student
router.post('/',
  validateStudent,
  handleValidationErrors,
  asyncHandler(createStudent)
);

// Transfer student to different class
router.put('/:id/transfer-class',
  validateObjectId,
  handleValidationErrors,
  asyncHandler(transferStudentToClass)
);

// Update student
router.put('/:id',
  validateObjectId,
  validateStudent,
  handleValidationErrors,
  asyncHandler(updateStudent)
);

// Delete student
router.delete('/:id',
  validateObjectId,
  handleValidationErrors,
  asyncHandler(deleteStudent)
);

// Get single student by ID
router.get('/:id',
  validateObjectId,
  handleValidationErrors,
  asyncHandler(getStudentById)
);

module.exports = router;
