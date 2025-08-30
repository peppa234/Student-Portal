const Teacher = require('../models/Teacher');
const Classes = require('../models/Classes');
const { getNextSequence } = require('../utils/getNextSequence');

// Get all teachers with pagination and search
const getAllTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', sortBy = 'firstName', sortOrder = 'asc' } = req.query;

    // Build search query
    let query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { teacherId: { $regex: search, $options: 'i' } }
      ];
    }
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const teachers = await Teacher.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Teacher.countDocuments(query);

    res.json({
      success: true,
      count: teachers.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: teachers
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// Get teacher by ID
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    let teacher;

    // Check if id is a valid MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // Search by MongoDB _id
      teacher = await Teacher.findById(id);
    } else {
      // Search by custom teacherId (like T001)
      teacher = await Teacher.findOne({ teacherId: id });
    }

    if (!teacher) {
      return res.status(404).json({ 
        message: 'Teacher not found',
        searchedBy: id.match(/^[0-9a-fA-F]{24}$/) ? 'MongoDB ObjectId' : 'Teacher ID'
      });
    }
    res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// Create new teacher
const createTeacher = async (req, res) => {
  try {
    const { firstName, lastName, email, department, qualifications, phone, address, dateOfBirth, hireDate, gender, employeeNumber, position, yearsOfExperience, workSchedule, subjects, classes, status } = req.body;

    // Check if email already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ 
        success: false,
        message: 'Teacher with this email already exists' 
      });
    }

    // Generate teacher ID
    const teacherId = await getNextSequence('teacherId');
    
    // Generate employee number if not provided
    let finalEmployeeNumber = employeeNumber;
    if (!employeeNumber || employeeNumber.trim() === '') {
      finalEmployeeNumber = await getNextSequence('employeeNumber');
    }

    const teacher = new Teacher({
      teacherId,
      firstName,
      lastName,
      email,
      department,
      qualifications,
      phone,
      address,
      dateOfBirth,
      hireDate: hireDate || new Date(),
      gender,
      employeeNumber: finalEmployeeNumber,
      position,
      yearsOfExperience,
      workSchedule,
      subjects,
      classes,
      status
    });

    const savedTeacher = await teacher.save();
    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: savedTeacher
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// Update teacher
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, department, qualifications, phone, address, dateOfBirth, hireDate, status, gender, employeeNumber, position, yearsOfExperience, workSchedule, subjects, classes } = req.body;

    // Get teacher first to find the correct ID
    let teacher;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      teacher = await Teacher.findById(id);
    } else {
      teacher = await Teacher.findOne({ teacherId: id });
    }
    
    if (!teacher) {
      return res.status(404).json({ 
        message: 'Teacher not found',
        searchedBy: id.match(/^[0-9a-fA-F]{24}$/) ? 'MongoDB ObjectId' : 'Teacher ID'
      });
    }

    // Check if email exists with another teacher
    if (email) {
      const existingTeacher = await Teacher.findOne({ email, _id: { $ne: teacher._id } });
      if (existingTeacher) {
        return res.status(400).json({ 
          success: false,
          message: 'Teacher with this email already exists' 
        });
      }
    }

    // Generate new employee number if not provided and current one is empty
    let finalEmployeeNumber = employeeNumber;
    if ((!employeeNumber || employeeNumber.trim() === '') && (!teacher.employeeNumber || teacher.employeeNumber.trim() === '')) {
      finalEmployeeNumber = await getNextSequence('employeeNumber');
    } else if (!employeeNumber || employeeNumber.trim() === '') {
      finalEmployeeNumber = teacher.employeeNumber; // Keep existing
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacher._id,
      {
        firstName,
        lastName,
        email,
        department,
        qualifications,
        phone,
        address,
        dateOfBirth,
        hireDate,
        status,
        gender,
        employeeNumber: finalEmployeeNumber,
        position,
        yearsOfExperience,
        workSchedule,
        subjects,
        classes
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Teacher updated successfully',
      data: updatedTeacher
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// Delete teacher
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get teacher first to find the correct ID
    let teacher;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      teacher = await Teacher.findById(id);
    } else {
      teacher = await Teacher.findOne({ teacherId: id });
    }
    
    if (!teacher) {
      return res.status(404).json({ 
        message: 'Teacher not found',
        searchedBy: id.match(/^[0-9a-fA-F]{24}$/) ? 'MongoDB ObjectId' : 'Teacher ID'
      });
    }

    // Check if teacher is assigned to any classes
    const assignedClasses = await Classes.find({ assignedTeacher: teacher._id });
    if (assignedClasses.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete teacher. They are assigned to classes.',
        data: {
          assignedClasses: assignedClasses.map(c => ({ classCode: c.classCode, className: c.className }))
        }
      });
    }

    const deletedTeacher = await Teacher.findByIdAndDelete(teacher._id);

    res.json({
      success: true,
      message: 'Teacher deleted successfully',
      data: deletedTeacher
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// Get teacher statistics
const getTeacherStats = async (req, res) => {
  try {
    const totalTeachers = await Teacher.countDocuments();
    const activeTeachers = await Teacher.countDocuments({ status: 'active' });
    const inactiveTeachers = await Teacher.countDocuments({ status: 'inactive' });

    // Department distribution
    const departmentStats = await Teacher.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentHires = await Teacher.countDocuments({ hireDate: { $gte: thirtyDaysAgo } });

    res.json({
      success: true,
      data: {
        totalTeachers,
        activeTeachers,
        inactiveTeachers,
        departmentStats,
        recentHires
      }
    });
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// Get teachers by department
const getTeachersByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const teachers = await Teacher.find({ 
      department: { $regex: department, $options: 'i' },
      status: 'active'
    }).select('teacherId firstName lastName email qualifications department');

    res.json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    console.error('Error fetching teachers by department:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherStats,
  getTeachersByDepartment
};
