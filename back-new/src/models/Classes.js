const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  classCode: {
    type: String,
    unique: true,
    trim: true
    // Will be auto-generated
  },
  className: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  grade: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10
  },
  section: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10
  },
  academicYear: {
    type: String,
    required: true,
    trim: true,
    match: /^\d{4}-\d{4}$/   // enforce YYYY-YYYY format
  },
  semester: {
    type: String,
    required: true,
    enum: ['First', 'Second', 'Summer'], // matches your data
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  currentEnrollment: {
    type: Number,
    default: 0,
    min: 0
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  classSchedule: {
    room: { type: String, trim: true, maxlength: 50 },
    building: { type: String, trim: true, maxlength: 100 },
    floor: { type: String, trim: true, maxlength: 50 },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  averageGrade: {
    type: Number,
    default: 0,
    min: 0
  },
  attendanceRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  requirements: [{
    type: String,
    trim: true,
    maxlength: 200
  }]
}, {
  timestamps: true
});

// Instance methods
classSchema.methods.addStudent = function(studentId) {
  if (!this.students.includes(studentId)) {
    this.students.push(studentId);
    this.currentEnrollment = this.students.length;
  }
  return this;
};

classSchema.methods.removeStudent = function(studentId) {
  this.students = this.students.filter(id => id.toString() !== studentId.toString());
  this.currentEnrollment = this.students.length;
  return this;
};

classSchema.methods.hasStudent = function(studentId) {
  return this.students.some(id => id.toString() === studentId.toString());
};

// Pre-save middleware to update enrollment count
classSchema.pre('save', function(next) {
  if (this.isModified('students')) {
    this.currentEnrollment = this.students.length;
  }
  next();
});

module.exports = mongoose.model('Classes', classSchema);
