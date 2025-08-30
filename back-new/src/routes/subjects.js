const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  authenticateToken, 
  requireAdmin
} = require('../middleware/auth');

// Import controller
const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignTeacherToSubject,
  assignMultipleTeachersToSubject,
  removeTeacherFromSubject,
  getSubjectPerformance,
  getSubjectsByDepartment,
  getSubjectsByGrade,
  getSubjectsByTeacher
} = require('../controllers/SubjectController');

// All routes require authentication
router.use(authenticateToken);

// All routes require admin access
router.use(requireAdmin);

// All subject routes (admin only)
router.get('/', asyncHandler(getAllSubjects));
router.get('/stats', asyncHandler(getSubjectPerformance));
router.get('/grade/:grade', asyncHandler(getSubjectsByGrade));
router.get('/department/:department', asyncHandler(getSubjectsByDepartment));
router.get('/available', asyncHandler(getSubjectsByTeacher));
router.get('/:id', asyncHandler(getSubjectById));

// Subject management routes (admin only)
router.post('/', asyncHandler(createSubject));
router.put('/:id', asyncHandler(updateSubject));
router.delete('/:id', asyncHandler(deleteSubject));

// Subject-teacher relationship management (admin only)
router.put('/:id/assign-teacher', asyncHandler(assignTeacherToSubject));
router.put('/:id/remove-teacher', asyncHandler(removeTeacherFromSubject));
router.put('/:id/assign-multiple-teachers', asyncHandler(assignMultipleTeachersToSubject));

// Subject prerequisites management (admin only)
router.post('/:id/prerequisites', asyncHandler(assignTeacherToSubject));
router.delete('/:id/prerequisites/:prereqId', asyncHandler(removeTeacherFromSubject));
router.post('/:id/corequisites', asyncHandler(assignTeacherToSubject));
router.delete('/:id/corequisites/:coreqId', asyncHandler(removeTeacherFromSubject));

module.exports = router;
