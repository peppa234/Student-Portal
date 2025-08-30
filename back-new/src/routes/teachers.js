const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  authenticateToken, 
  requireAdmin 
} = require('../middleware/auth');

// Import controller
const {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherStats,
  getTeachersByDepartment
} = require('../controllers/TeacherController');

// All routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Teacher management routes
router.get('/', asyncHandler(getAllTeachers));
router.get('/stats', asyncHandler(getTeacherStats));
router.get('/department/:department', asyncHandler(getTeachersByDepartment));

// Individual teacher routes
router.get('/:id', asyncHandler(getTeacherById));
router.post('/', asyncHandler(createTeacher));
router.put('/:id', asyncHandler(updateTeacher));
router.delete('/:id', asyncHandler(deleteTeacher));

module.exports = router;
