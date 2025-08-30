const Student = require("../models/Student");
const Classes = require('../models/Classes');
const { getNextSequence } = require('../utils/getNextSequence');
const { sanitizeSearch } = require('../middleware/validators');

const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, classId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    let query = {};
    
    // Search functionality with sanitization
    if (search) {
      const sanitizedSearch = sanitizeSearch(search);
      query.$or = [
        { firstName: { $regex: sanitizedSearch, $options: 'i' } },
        { lastName: { $regex: sanitizedSearch, $options: 'i' } },
        { studentId: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by class
    if (classId) {
      query.currentClass = classId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const students = await Student.find(query)
      .populate('currentClass', 'className grade section')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Student.countDocuments(query);

    res.formatSuccess({
      count: students.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: students
    }, 'Students retrieved successfully');
  } catch (error) {
    console.error('Error getting students:', error);
    res.formatError('Server Error', 500, error.message);
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    let student;

    // Check if id is a valid MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // Search by MongoDB _id
      student = await Student.findById(id)
        .populate('currentClass', 'className grade section room building')
        .populate({
          path: 'currentClass',
          populate: {
            path: 'subjects.subject',
            select: 'subjectName subjectCode'
          }
        });
    } else {
      // Search by custom studentId (like ST001)
      student = await Student.findOne({ studentId: id })
        .populate('currentClass', 'className grade section room building')
        .populate({
          path: 'currentClass',
          populate: {
            path: 'subjects.subject',
            select: 'subjectName subjectCode'
          }
        });
    }

    if (!student) {
      return res.formatError('Student not found', 404, {
        searchedBy: id.match(/^[0-9a-fA-F]{24}$/) ? 'MongoDB ObjectId' : 'Student ID'
      });
    }

    res.formatSuccess(student, 'Student retrieved successfully');
  } catch (error) {
    console.error('Error getting student:', error);
    res.formatError('Server Error', 500, error.message);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private
const createStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      currentClass,
      graduationYear,
      academicStatus,
      guardians,
      medicalConditions,
      allergies,
      emergencyContact,
      profilePicture,
      notes
    } = req.body;

    // Generate auto-incrementing student ID
    const studentId = await getNextSequence('studentId');

    // Check if student already exists (only check email since ID is auto-generated)
    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      return res.formatError('Student with this email already exists', 400);
    }

    // Validate class exists if provided
    if (currentClass && currentClass.trim() !== '') {
      const classExists = await Classes.findById(currentClass);
      if (!classExists) {
        return res.formatError('Class not found', 400);
      }
    }

    // Create student
    const student = new Student({
      studentId,
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      currentClass: currentClass && currentClass.trim() !== '' ? currentClass : undefined,
      graduationYear,
      academicStatus,
      guardians,
      medicalConditions,
      allergies,
      emergencyContact,
      profilePicture,
      notes
    });

    const savedStudent = await student.save();

    // Populate class information
    await savedStudent.populate('currentClass', 'className grade section');

    res.formatSuccess(savedStudent, 'Student created successfully', 201);
  } catch (error) {
    console.error('Error creating student:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.formatError('Validation Error', 400, messages);
    }

    res.formatError('Server Error', 500, error.message);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      currentClass,
      graduationYear,
      academicStatus,
      guardians,
      medicalConditions,
      allergies,
      emergencyContact,
      profilePicture,
      notes
    } = req.body;

    // Check if student exists
    let student;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    } else {
      student = await Student.findOne({ studentId: id });
    }
    
    if (!student) {
      return res.formatError('Student not found', 404, {
        searchedBy: id.match(/^[0-9a-fA-F]{24}$/) ? 'MongoDB ObjectId' : 'Student ID'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== student.email) {
      const emailExists = await Student.findOne({ email, _id: { $ne: student._id } });
      if (emailExists) {
        return res.formatError('Email already exists', 400);
      }
    }

    // Validate class exists if being changed
    if (currentClass && currentClass !== (student.currentClass ? student.currentClass.toString() : '')) {
      const classExists = await Classes.findById(currentClass);
      if (!classExists) {
        return res.formatError('Class not found', 400);
      }
    }

    // Update student
    student = await Student.findByIdAndUpdate(
      student._id,
      {
        firstName,
        lastName,
        middleName,
        dateOfBirth,
        gender,
        email,
        phone,
        address,
        currentClass,
        graduationYear,
        academicStatus,
        guardians,
        medicalConditions,
        allergies,
        emergencyContact,
        profilePicture,
        notes
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('currentClass', 'className grade section');

    res.formatSuccess(student, 'Student updated successfully');
  } catch (error) {
    console.error('Error updating student:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.formatError('Validation Error', 400, messages);
    }

    res.formatError('Server Error', 500, error.message);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student exists
    let student;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    } else {
      student = await Student.findOne({ studentId: id });
    }
    
    if (!student) {
      return res.formatError('Student not found', 404, {
        searchedBy: id.match(/^[0-9a-fA-F]{24}$/) ? 'MongoDB ObjectId' : 'Student ID'
      });
    }

    // Check if student has existing records
    // Note: Grades functionality has been removed

    // Remove student from class if enrolled
    if (student.currentClass) {
      const classDoc = await Classes.findById(student.currentClass);
      if (classDoc) {
        classDoc.removeStudent(student._id);
        await classDoc.save();
      }
    }

    await Student.findByIdAndDelete(student._id);

    res.formatSuccess(null, 'Student deleted successfully');
  } catch (error) {
    console.error('Error deleting student:', error);
    res.formatError('Server Error', 500, error.message);
  }
};

// @desc    Get student academic performance
// @route   GET /api/students/:id/academic-performance
// @access  Private
const getStudentAcademicPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get student first to find the correct ID
    let student;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    } else {
      student = await Student.findOne({ studentId: id });
    }
    
    if (!student) {
      return res.formatError('Student not found', 404, {
        searchedBy: id.match(/^[0-9a-fA-F]{24}$/) ? 'MongoDB ObjectId' : 'Student ID'
      });
    }

    // Note: Grades functionality has been removed
    res.formatSuccess({
      message: 'Grades functionality has been removed from the system',
      statistics: {
        totalSubjects: 0,
        passedSubjects: 0,
        failedSubjects: 0,
        passRate: 0,
        averageGPA: 0
      }
    }, 'Academic performance retrieved successfully');
  } catch (error) {
    console.error('Error getting academic performance:', error);
    res.formatError('Server Error', 500, error.message);
  }
};

// @desc    Transfer student to different class
// @route   PUT /api/students/:id/transfer-class
// @access  Private
const transferStudentToClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { newClassId, reason } = req.body;

    if (!newClassId) {
      return res.formatError('New class ID is required', 400);
    }

    // Check if new class exists
    const newClass = await Classes.findById(newClassId);
    if (!newClass) {
      return res.formatError('New class not found', 404);
    }

    // Check if new class has capacity
    if (newClass.currentEnrollment >= newClass.capacity) {
      return res.formatError('New class is at full capacity', 400);
    }

    // Get student first to find the correct ID
    let student;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    } else {
      student = await Student.findOne({ studentId: id });
    }
    
    if (!student) {
      return res.formatError('Student not found', 404, {
        searchedBy: id.match(/^[0-9a-fA-F]{24}$/) ? 'MongoDB ObjectId' : 'Student ID'
      });
    }

    const oldClassId = student.currentClass;

    // Remove from old class
    if (oldClassId) {
      const oldClass = await Classes.findById(oldClassId);
      if (oldClass) {
        oldClass.removeStudent(student._id);
        await oldClass.save();
      }
    }

    // Add to new class
    newClass.addStudent(student._id);
    await newClass.save();

    // Update student
    student.currentClass = newClassId;
    student.notes = student.notes ? `${student.notes}\n${new Date().toISOString()}: Transferred to ${newClass.className} - ${reason || 'No reason provided'}` : `${new Date().toISOString()}: Transferred to ${newClass.className} - ${reason || 'No reason provided'}`;
    
    await student.save();

    res.formatSuccess({
      student: await student.populate('currentClass', 'className grade section'),
      oldClass: oldClassId,
      newClass: newClassId
    }, 'Student transferred successfully');
  } catch (error) {
    console.error('Error transferring student:', error);
    res.formatError('Server Error', 500, error.message);
  }
};

// @desc    Get students by class
// @route   GET /api/students/class/:classId
// @access  Private
const getStudentsByClass = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const classId = req.params.classId;

    // Check if class exists
    const classExists = await Classes.findById(classId);
    if (!classExists) {
      return res.formatError('Class not found', 404);
    }

    // Build query
    let query = { currentClass: classId };
    if (status) {
      query.status = status;
    }

    const students = await Student.find(query)
      .select('studentId firstName lastName middleName email status enrollmentDate')
      .sort({ lastName: 1, firstName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    res.formatSuccess({
      count: students.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: students
    }, 'Students by class retrieved successfully');
  } catch (error) {
    console.error('Error getting students by class:', error);
    res.formatError('Server Error', 500, error.message);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAcademicPerformance,
  transferStudentToClass,
  getStudentsByClass
};
