const Classes = require('../models/Classes');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const { getNextSequence } = require('../utils/getNextSequence');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public (can be made private later)
const getAllClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, grade, academicYear, semester, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { className: { $regex: search, $options: 'i' } },
        { classCode: { $regex: search, $options: 'i' } },
        { grade: { $regex: search, $options: 'i' } },
        { section: { $regex: search, $options: 'i' } }
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

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const classes = await Classes.find(query)
      .populate('classTeacher', 'firstName lastName email')
      .populate('students', 'studentId firstName lastName')
      .populate('subjects.subject', 'subjectName subjectCode')
      .populate('subjects.teacher', 'firstName lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Classes.countDocuments(query);

    res.status(200).json({
      success: true,
      count: classes.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: classes
    });
  } catch (error) {
    console.error('Error getting classes:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single class by ID
// @route   GET /api/classes/:id
// @access  Public
const getClassById = async (req, res) => {
  try {
    const classDoc = await Classes.findById(req.params.id)
      .populate('classTeacher', 'firstName lastName email phone department')
      .populate('students', 'studentId firstName lastName email academicStatus')
      .populate('subjects.subject', 'subjectName subjectCode description')
      .populate('subjects.teacher', 'firstName lastName email');

    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      data: classDoc
    });
  } catch (error) {
    console.error('Error getting class:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new class
// @route   POST /api/classes
// @access  Private
const createClass = async (req, res) => {
  try {
    const {
      className,
      academicYear,
      semester,
      grade,
      section,
      capacity,
      classSchedule,
      room,
      building,
      floor,
      classTeacher,
      subjects,
      description,
      requirements,
      notes
    } = req.body;

    // Generate auto-incrementing class code
    const classCode = await getNextSequence('classCode');

    // Check if class already exists (only check combination since code is auto-generated)
    const existingClass = await Classes.findOne({
      className, 
      grade, 
      section, 
      academicYear 
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Class with this combination of name, grade, section, and academic year already exists'
      });
    }

    // Validate class teacher exists
    if (classTeacher) {
      const teacherExists = await Teacher.findById(classTeacher);
      if (!teacherExists) {
        return res.status(400).json({
          success: false,
          message: 'Class teacher not found'
        });
      }
    }

    // Validate subjects exist if provided
    if (subjects && subjects.length > 0) {
      for (const subjectData of subjects) {
        const subjectExists = await Subject.findById(subjectData.subject);
        if (!subjectExists) {
          return res.status(400).json({
            success: false,
            message: `Subject with ID ${subjectData.subject} not found`
          });
        }

        const teacherExists = await Teacher.findById(subjectData.teacher);
        if (!teacherExists) {
          return res.status(400).json({
            success: false,
            message: `Teacher with ID ${subjectData.teacher} not found`
          });
        }
      }
    }

    // Create class
    const newClass = new Classes({
      className,
      classCode,
      academicYear,
      semester,
      grade,
      section,
      capacity,
      classSchedule,
      room,
      building,
      floor,
      classTeacher,
      subjects,
      description,
      requirements,
      notes
    });

    const savedClass = await newClass.save();

    // Populate basic information
    await savedClass.populate('classTeacher', 'firstName lastName email');
    await savedClass.populate('subjects.subject', 'subjectName subjectCode');
    await savedClass.populate('subjects.teacher', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: savedClass
    });
  } catch (error) {
    console.error('Error creating class:', error);
    
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

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private
const updateClass = async (req, res) => {
  try {
    const {
      className,
      classCode,
      academicYear,
      semester,
      grade,
      section,
      capacity,
      classSchedule,
      room,
      building,
      floor,
      classTeacher,
      subjects,
      description,
      requirements,
      notes
    } = req.body;

    // Check if class exists
    let classDoc = await Classes.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if class code is being changed and if it's already taken
    if (classCode && classCode !== classDoc.classCode) {
      const codeExists = await Classes.findOne({ classCode, _id: { $ne: req.params.id } });
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'Class code already exists'
        });
      }
    }

    // Validate class teacher exists if being changed
    if (classTeacher && classTeacher !== classDoc.classTeacher.toString()) {
      const teacherExists = await Teacher.findById(classTeacher);
      if (!teacherExists) {
        return res.status(400).json({
          success: false,
          message: 'Class teacher not found'
        });
      }
    }

    // Validate subjects exist if being changed
    if (subjects) {
      for (const subjectData of subjects) {
        const subjectExists = await Subject.findById(subjectData.subject);
        if (!subjectExists) {
          return res.status(400).json({
            success: false,
            message: `Subject with ID ${subjectData.subject} not found`
          });
        }

        const teacherExists = await Teacher.findById(subjectData.teacher);
        if (!teacherExists) {
          return res.status(400).json({
            success: false,
            message: `Teacher with ID ${subjectData.teacher} not found`
          });
        }
      }
    }

    // Update class
    classDoc = await Classes.findByIdAndUpdate(
      req.params.id,
      {
        className,
        classCode,
        academicYear,
        semester,
        grade,
        section,
        capacity,
        classSchedule,
        room,
        building,
        floor,
        classTeacher,
        subjects,
        description,
        requirements,
        notes
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('classTeacher', 'firstName lastName email')
     .populate('subjects.subject', 'subjectName subjectCode')
     .populate('subjects.teacher', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: classDoc
    });
  } catch (error) {
    console.error('Error updating class:', error);
    
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

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private
const deleteClass = async (req, res) => {
  try {
    const classDoc = await Classes.findById(req.params.id);
    
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if class has students
    const hasStudents = classDoc.students.length > 0;

    if (hasStudents) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete class with enrolled students. Consider deactivating instead.'
      });
    }

    // Remove class from subjects
    if (classDoc.subjects.length > 0) {
      for (const subjectData of classDoc.subjects) {
        const subject = await Subject.findById(subjectData.subject);
        if (subject) {
          subject.removeClass(req.params.id);
          await subject.save();
        }
      }
    }

    await Classes.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Add student to class
// @route   PUT /api/classes/:id/add-student
// @access  Private
const addStudentToClass = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Check if class exists
    const classDoc = await Classes.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if class has capacity
    if (classDoc.currentEnrollment >= classDoc.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Class is at full capacity'
      });
    }

    // Check if student is already in the class
    if (classDoc.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this class'
      });
    }

    // Add student to class
    const success = classDoc.addStudent(studentId);
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to add student to class'
      });
    }

    await classDoc.save();

    // Update student's current class
    student.currentClass = req.params.id;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student added to class successfully',
      data: {
        class: await classDoc.populate('students', 'studentId firstName lastName'),
        student: await student.populate('currentClass', 'className grade section')
      }
    });
  } catch (error) {
    console.error('Error adding student to class:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Remove student from class
// @route   PUT /api/classes/:id/remove-student
// @access  Private
const removeStudentFromClass = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Check if class exists
    const classDoc = await Classes.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if student is enrolled in the class
    if (!classDoc.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this class'
      });
    }

    // Remove student from class
    const studentIndex = classDoc.students.findIndex(id => id.toString() === studentId.toString());
    if (studentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this class'
      });
    }
    
    classDoc.students.splice(studentIndex, 1);
    classDoc.currentEnrollment = classDoc.students.length;

    await classDoc.save();

    // Update student's current class
    student.currentClass = null;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student removed from class successfully',
      data: {
        class: await classDoc.populate('students', 'studentId firstName lastName'),
        student: await student.populate('currentClass', 'className grade section')
      }
    });
  } catch (error) {
    console.error('Error removing student from class:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};



// @desc    Get class academic performance
// @route   GET /api/classes/:id/academic-performance
// @access  Private
const getClassAcademicPerformance = async (req, res) => {
  try {
    // Note: Grades functionality has been removed
    res.status(200).json({
      success: true,
      data: {
        message: 'Grades functionality has been removed from the system',
        studentStats: [],
        classStatistics: {
          totalStudents: 0,
          totalSubjects: 0,
          passedStudents: 0,
          failedStudents: 0,
          passRate: 0,
          classAverageGPA: 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting class academic performance:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get classes by teacher
// @route   GET /api/classes/teacher/:teacherId
// @access  Private
const getClassesByTeacher = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, academicYear } = req.query;
    const teacherId = req.params.teacherId;

    // Check if teacher exists
    const teacherExists = await Teacher.findById(teacherId);
    if (!teacherExists) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Build query
    let query = { classTeacher: teacherId };
    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;

    const classes = await Classes.find(query)
      .populate('students', 'studentId firstName lastName')
      .populate('subjects.subject', 'subjectName subjectCode')
      .sort({ academicYear: -1, grade: 1, section: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Classes.countDocuments(query);

    res.status(200).json({
      success: true,
      count: classes.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: classes
    });
  } catch (error) {
    console.error('Error getting classes by teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get classes by grade
// @route   GET /api/classes/grade/:grade
// @access  Private
const getClassesByGrade = async (req, res) => {
  try {
    const { page = 1, limit = 20, academicYear, semester, status } = req.query;
    const grade = req.params.grade;

    // Build query
    let query = { grade: { $regex: grade, $options: 'i' } };
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    if (status) query.status = status;

    const classes = await Classes.find(query)
      .populate('classTeacher', 'firstName lastName email')
      .populate('students', 'studentId firstName lastName')
      .sort({ academicYear: -1, section: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Classes.countDocuments(query);

    res.status(200).json({
      success: true,
      count: classes.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: classes
    });
  } catch (error) {
    console.error('Error getting classes by grade:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
  getClassAcademicPerformance,
  getClassesByTeacher,
  getClassesByGrade
};
