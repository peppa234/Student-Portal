const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  authenticateToken, 
  requireAdmin
} = require('../middleware/auth');

// Import controller
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
  getClassAttendanceSummary,
  getClassAcademicPerformance,
  getClassesByTeacher,
  getClassesByGrade
} = require('../controllers/ClassesController');

// All routes require authentication
router.use(authenticateToken);

// All routes require admin access
router.use(requireAdmin);

// All class routes (admin only)
router.get('/', asyncHandler(getAllClasses));
router.get('/stats', asyncHandler(getClassAcademicPerformance));
router.get('/grade/:grade', asyncHandler(getClassesByGrade));
router.get('/teacher/:teacherId', asyncHandler(getClassesByTeacher));
router.get('/available', asyncHandler(getAllClasses));

router.get('/:id', asyncHandler(getClassById));

// Class management routes (admin only)
router.post('/', asyncHandler(createClass));
router.put('/:id', asyncHandler(updateClass));
router.delete('/:id', asyncHandler(deleteClass));

// Student enrollment management (admin only)
router.post('/:id/enroll', asyncHandler(addStudentToClass));
router.delete('/:id/enroll/:studentId', asyncHandler(removeStudentFromClass));
router.put('/:id/assign-teacher', asyncHandler(updateClass));
router.delete('/:id/remove-teacher', asyncHandler(updateClass));

module.exports = router;
