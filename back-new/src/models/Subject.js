// models/Subjects.js
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    unique: true,
    trim: true,
    maxlength: 20
    // Will be auto-generated
  },
  subjectName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  shortName: {
    type: String,
    trim: true,
    maxlength: 10
  },
  grade: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10
  },
  academicYear: {
    type: String,
    required: true,
    trim: true,
    match: /^\d{4}-\d{4}$/
  },
  semester: {
    type: String,
    required: true,
    enum: ['First', 'Second', 'Summer'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  objectives: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  learningOutcomes: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  curriculum: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  assessment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher' // ✅ main teacher assigned
  }],
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classes'
  }],
  textbooks: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  materials: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  onlineResources: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  department: {
    type: String,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    enum: ['Core', 'Elective', 'Advanced', 'Remedial'],
    default: 'Core'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  credits: {
    type: Number,
    default: 1,
    min: 0.5,
    max: 6
  },
  hoursPerWeek: {
    type: Number,
    default: 3,
    min: 1,
    max: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
