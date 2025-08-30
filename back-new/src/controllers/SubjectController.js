const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Classes = require('../models/Classes');
const { getNextSequence } = require('../utils/getNextSequence');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public (can be made private later)
const getAllSubjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, grade, academicYear, semester, department, category, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { subjectName: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } },
        { shortName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by grade
    if (grade) {
      query.grade = grade;
    }

    // Filter by academic year
    if (academicYear) {
      query.academicYear = academicYear;
    }

    // Filter by semester
    if (semester) {
      query.semester = semester;
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const subjects = await Subject.find(query)
      .populate('teachers', 'firstName lastName email')
      .populate('classes', 'className grade section')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Subject.countDocuments(query);

    res.status(200).json({
      success: true,
      count: subjects.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: subjects
    });
  } catch (error) {
    console.error('Error getting subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single subject by ID
// @route   GET /api/subjects/:id
// @access  Public
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('teachers', 'firstName lastName email department')
      .populate('classes', 'className grade section room')
      .populate('prerequisites', 'subjectName subjectCode');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error getting subject:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res) => {
  try {
    const {
      subjectName,
      shortName,
      grade,
      academicYear,
      semester,
      description,
      objectives,
      learningOutcomes,
      prerequisites,
      curriculum,
      assessment,
      teachers,
      classes,
      textbooks,
      materials,
      onlineResources,
      department,
      category,
      difficulty,
      notes
    } = req.body;

    // Generate auto-incrementing subject code
    const subjectCode = await getNextSequence('subjectCode');

    // Check if subject already exists (only check combination since code is auto-generated)
    const existingSubject = await Subject.findOne({
      subjectName, 
      grade, 
      academicYear, 
      semester 
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this combination of name, grade, academic year, and semester already exists'
      });
    }

    // Validate prerequisites exist if provided
    if (prerequisites && prerequisites.length > 0) {
      const prerequisitesExist = await Subject.find({ _id: { $in: prerequisites } });
      if (prerequisitesExist.length !== prerequisites.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more prerequisites not found'
        });
      }
    }

    // Validate teachers exist if provided
    if (teachers && teachers.length > 0) {
      const teachersExist = await Teacher.find({ _id: { $in: teachers } });
      if (teachersExist.length !== teachers.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more teachers not found'
        });
      }
    }

    // Validate classes exist if provided
    if (classes && classes.length > 0) {
      const classesExist = await Classes.find({ _id: { $in: classes } });
      if (classesExist.length !== classes.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more classes not found'
        });
      }
    }

    // Create subject
    const subject = new Subject({
      subjectCode,
      subjectName,
      shortName,
      grade,
      academicYear,
      semester,
      description,
      objectives,
      learningOutcomes,
      prerequisites,
      curriculum,
      assessment,
      teachers,
      classes,
      textbooks,
      materials,
      onlineResources,
      department,
      category,
      difficulty,
      notes
    });

    const savedSubject = await subject.save();

    // Populate basic information
    await savedSubject.populate('teachers', 'firstName lastName email');
    await savedSubject.populate('classes', 'className grade section');
    await savedSubject.populate('prerequisites', 'subjectName subjectCode');

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: savedSubject
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res) => {
  try {
    const {
      subjectCode,
      subjectName,
      shortName,
      grade,
      academicYear,
      semester,
      description,
      objectives,
      learningOutcomes,
      prerequisites,
      curriculum,
      assessment,
      teachers,
      classes,
      textbooks,
      materials,
      onlineResources,
      department,
      category,
      difficulty,
      credits,
      hoursPerWeek,
      isActive,
      notes
    } = req.body;

    // Check if subject exists
    let subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if subject code is being changed and if it's already taken
    if (subjectCode && subjectCode !== subject.subjectCode) {
      const codeExists = await Subject.findOne({ subjectCode, _id: { $ne: req.params.id } });
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'Subject code already exists'
        });
      }
    }

    // Validate prerequisites exist if being changed
    if (prerequisites) {
      const prerequisitesExist = await Subject.find({ _id: { $in: prerequisites } });
      if (prerequisitesExist.length !== prerequisites.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more prerequisites not found'
        });
      }
    }

    // Validate teachers exist if being changed
    if (teachers) {
      const teachersExist = await Teacher.find({ _id: { $in: teachers } });
      if (teachersExist.length !== teachers.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more teachers not found'
        });
      }
    }

    // Validate classes exist if being changed
    if (classes) {
      const classesExist = await Classes.find({ _id: { $in: classes } });
      if (classesExist.length !== classes.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more classes not found'
        });
      }
    }

    // Update subject
    subject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        subjectCode,
        subjectName,
        shortName,
        grade,
        academicYear,
        semester,
        description,
        objectives,
        learningOutcomes,
        prerequisites,
        curriculum,
        assessment,
        teachers,
        classes,
        textbooks,
        materials,
        onlineResources,
        department,
        category,
        difficulty,
        credits,
        hoursPerWeek,
        isActive,
        notes
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('teachers', 'firstName lastName email')
     .populate('classes', 'className grade section')
     .populate('prerequisites', 'subjectName subjectCode');

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if subject is taught in classes
    const hasClasses = subject.classes.length > 0;

    if (hasClasses) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subject with existing class assignments. Consider deactivating instead.'
      });
    }

    // Remove subject from teachers
    if (subject.teachers.length > 0) {
      await Teacher.updateMany(
        { _id: { $in: subject.teachers } },
        { $pull: { subjects: req.params.id } }
      );
    }

    // Remove subject from classes
    if (subject.classes.length > 0) {
      await Classes.updateMany(
        { _id: { $in: subject.classes } },
        { $pull: { 'subjects.subject': req.params.id } }
      );
    }

    await Subject.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Assign teacher to subject
// @route   PUT /api/subjects/:id/assign-teacher
// @access  Private
const assignTeacherToSubject = async (req, res) => {
  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required'
      });
    }

    // Check if subject exists
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if teacher exists - handle both teacherId and _id
    let teacher;
    if (teacherId.match(/^[0-9a-fA-F]{24}$/)) {
      // Search by MongoDB _id
      teacher = await Teacher.findById(teacherId);
    } else {
      // Search by custom teacherId (like T001)
      teacher = await Teacher.findOne({ teacherId: teacherId });
    }
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
        searchedBy: teacherId.match(/^[0-9a-fA-F]{24}$/) ? 'MongoDB ObjectId' : 'Teacher ID'
      });
    }

    // Check if already assigned (using the resolved teacher ObjectId)
    if (subject.teachers.includes(teacher._id)) {
      return res.status(400).json({
        success: false,
        message: 'Teacher is already assigned to this subject'
      });
    }

    // Add teacher to subject's teachers array
    subject.teachers.push(teacher._id);
    await subject.save();

    // Add subject to teacher's subjects array
    teacher.subjects.push(req.params.id);
    await teacher.save();

    res.status(200).json({
      success: true,
      message: 'Teacher assigned successfully',
      data: {
        subject: await subject.populate('teachers', 'firstName lastName email'),
        teacher: await teacher.populate('subjects', 'subjectName subjectCode')
      }
    });
  } catch (error) {
    console.error('Error assigning teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Remove teacher from subject
// @route   PUT /api/subjects/:id/remove-teacher
// @access  Private
const removeTeacherFromSubject = async (req, res) => {
  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required'
      });
    }

    // Check if subject exists
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if teacher exists - handle both teacherId and _id
    let teacher;
    if (teacherId.match(/^[0-9a-fA-F]{24}$/)) {
      // Search by MongoDB _id
      teacher = await Teacher.findById(teacherId);
    } else {
      // Search by custom teacherId (like T001)
      teacher = await Teacher.findOne({ teacherId: teacherId });
    }
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
        searchedBy: teacherId.match(/^[0-9a-fA-F]{24}$/) ? 'MongoDB ObjectId' : 'Teacher ID'
      });
    }

    // Check if teacher is assigned (using the resolved teacher ObjectId)
    if (!subject.teachers.includes(teacher._id)) {
      return res.status(400).json({
        success: false,
        message: 'Teacher is not assigned to this subject'
      });
    }

    // Remove teacher from subject's teachers array
    subject.teachers = subject.teachers.filter(id => id.toString() !== teacher._id.toString());
    await subject.save();

    // Remove subject from teacher's subjects array
    teacher.subjects = teacher.subjects.filter(id => id.toString() !== req.params.id);
    await teacher.save();

    res.status(200).json({
      success: true,
      message: 'Teacher removed successfully',
      data: {
        subject: await subject.populate('teachers', 'firstName lastName email'),
        teacher: await teacher.populate('subjects', 'subjectName subjectCode')
      }
    });
  } catch (error) {
    console.error('Error removing teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get subject performance statistics
// @route   GET /api/subjects/:id/performance
// @access  Private
const getSubjectPerformance = async (req, res) => {
  try {
    // Note: Grades functionality has been removed
    res.status(200).json({
      success: true,
      data: {
        message: 'Grades functionality has been removed from the system',
        statistics: {
          totalStudents: 0,
          totalClasses: 0,
          totalMarks: 0,
          totalObtainedMarks: 0,
          averagePercentage: 0,
          averageGPA: 0,
          passedStudents: 0,
          failedStudents: 0,
          passRate: 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting subject performance:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get subjects by department
// @route   GET /api/subjects/department/:department
// @access  Private
const getSubjectsByDepartment = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, grade, academicYear } = req.query;
    const department = req.params.department;

    // Build query
    let query = { department: { $regex: department, $options: 'i' } };
    if (status) query.status = status;
    if (grade) query.grade = grade;
    if (academicYear) query.academicYear = academicYear;

    const subjects = await Subject.find(query)
      .populate('teachers', 'firstName lastName email')
      .populate('classes', 'className grade section')
      .sort({ academicYear: -1, grade: 1, subjectName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subject.countDocuments(query);

    res.status(200).json({
      success: true,
      count: subjects.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: subjects
    });
  } catch (error) {
    console.error('Error getting subjects by department:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get subjects by grade
// @route   GET /api/subjects/grade/:grade
// @access  Private
const getSubjectsByGrade = async (req, res) => {
  try {
    const { page = 1, limit = 20, academicYear, semester, status, category } = req.query;
    const grade = req.params.grade;

    // Build query
    let query = { grade: { $regex: grade, $options: 'i' } };
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    if (status) query.status = status;
    if (category) query.category = category;

    const subjects = await Subject.find(query)
      .populate('teachers', 'firstName lastName email')
      .populate('classes', 'className grade section')
      .sort({ academicYear: -1, subjectName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subject.countDocuments(query);

    res.status(200).json({
      success: true,
      count: subjects.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: subjects
    });
  } catch (error) {
    console.error('Error getting subjects by grade:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get subjects by teacher
// @route   GET /api/subjects/teacher/:teacherId
// @access  Private
const getSubjectsByTeacher = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, grade, academicYear } = req.query;
    const teacherId = req.params.teacherId;

    // Check if teacher exists - handle both teacherId and _id
    let teacherExists;
    if (teacherId.match(/^[0-9a-fA-F]{24}$/)) {
      // Search by MongoDB _id
      teacherExists = await Teacher.findById(teacherId);
    } else {
      // Search by custom teacherId (like T001)
      teacherExists = await Teacher.findOne({ teacherId: teacherId });
    }
    
    if (!teacherExists) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
        searchedBy: teacherId.match(/^[0-9a-fA-F]{24}$/) ? 'MongoDB ObjectId' : 'Teacher ID'
      });
    }

    // Build query using the resolved teacher ObjectId
    let query = { teachers: teacherExists._id };
    if (status) query.status = status;
    if (grade) query.grade = grade;
    if (academicYear) query.academicYear = academicYear;

    const subjects = await Subject.find(query)
      .populate('classes', 'className grade section')
      .sort({ academicYear: -1, grade: 1, subjectName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subject.countDocuments(query);

    res.status(200).json({
      success: true,
      count: subjects.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: subjects
    });
  } catch (error) {
    console.error('Error getting subjects by teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Assign multiple teachers to subject
// @route   PUT /api/subjects/:id/assign-multiple-teachers
// @access  Private
const assignMultipleTeachersToSubject = async (req, res) => {
  try {
    const { teacherIds } = req.body;
    
    if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Teacher IDs array is required and must not be empty'
      });
    }

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ 
        success: false,
        message: 'Subject not found' 
      });
    }

    const results = [];
    const errors = [];

    for (const teacherId of teacherIds) {
      try {
        let teacher;
        if (teacherId.match(/^[0-9a-fA-F]{24}$/)) {
          teacher = await Teacher.findById(teacherId);
        } else {
          teacher = await Teacher.findOne({ teacherId: teacherId });
        }

        if (!teacher) {
          errors.push(`Teacher ${teacherId} not found`);
          continue;
        }

        if (subject.teachers.includes(teacher._id)) {
          errors.push(`Teacher ${teacherId} is already assigned`);
          continue;
        }

        // Add teacher to subject
        subject.teachers.push(teacher._id);
        
        // Add subject to teacher
        if (!teacher.subjects.includes(subject._id)) {
          teacher.subjects.push(subject._id);
          await teacher.save();
        }

        results.push({ 
          teacherId: teacherId, 
          teacherName: `${teacher.firstName} ${teacher.lastName}`, 
          status: 'assigned' 
        });
      } catch (error) {
        errors.push(`Error processing teacher ${teacherId}: ${error.message}`);
      }
    }

    await subject.save();
    
    // Populate teachers for response
    await subject.populate('teachers', 'firstName lastName email department');

    res.status(200).json({
      success: true,
      message: `Processed ${teacherIds.length} teachers`,
      data: { 
        subject, 
        results, 
        errors: errors.length > 0 ? errors : undefined 
      }
    });
  } catch (error) {
    console.error('Error assigning multiple teachers:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

module.exports = {
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
};
