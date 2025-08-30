const mongoose = require('mongoose');
const Counter = require('../models/Counter');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Classes = require('../models/Classes');
const Subject = require('../models/Subject');

/**
 * Migration script to populate counters with current max IDs
 * This ensure that new auto-generated IDs don't conflict with existing ones
 */
const populateCounters = async () => {
  try {
    console.log('🚀 Starting counter population migration...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_portal';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get max student ID
    const maxStudent = await Student.findOne({}, {}, { sort: { 'studentId': -1 } });
    if (maxStudent && maxStudent.studentId) {
      const studentNumber = parseInt(maxStudent.studentId.replace('STU', ''));
      await Counter.findByIdAndUpdate('studentId', { sequence_value: studentNumber }, { upsert: true });
      console.log(`✅ Updated studentId counter to: ${studentNumber}`);
    } else {
      await Counter.findByIdAndUpdate('studentId', { sequence_value: 0 }, { upsert: true });
      console.log('✅ Initialized studentId counter to: 0');
    }

    // Get max teacher ID
    const maxTeacher = await Teacher.findOne({}, {}, { sort: { 'teacherId': -1 } });
    if (maxTeacher && maxTeacher.teacherId) {
      const teacherNumber = parseInt(maxTeacher.teacherId.replace('TCH', ''));
      await Counter.findByIdAndUpdate('teacherId', { sequence_value: teacherNumber }, { upsert: true });
      console.log(`✅ Updated teacherId counter to: ${teacherNumber}`);
    } else {
      await Counter.findByIdAndUpdate('teacherId', { sequence_value: 0 }, { upsert: true });
      console.log('✅ Initialized teacherId counter to: 0');
    }

    // Get max class code
    const maxClass = await Classes.findOne({}, {}, { sort: { 'classCode': -1 } });
    if (maxClass && maxClass.classCode) {
      const classNumber = parseInt(maxClass.classCode.replace('CLS', ''));
      await Counter.findByIdAndUpdate('classCode', { sequence_value: classNumber }, { upsert: true });
      console.log(`✅ Updated classCode counter to: ${classNumber}`);
    } else {
      await Counter.findByIdAndUpdate('classCode', { sequence_value: 0 }, { upsert: true });
      console.log('✅ Initialized classCode counter to: 0');
    }

    // Get max subject code
    const maxSubject = await Subject.findOne({}, {}, { sort: { 'subjectCode': -1 } });
    if (maxSubject && maxSubject.subjectCode) {
      const subjectNumber = parseInt(maxSubject.subjectCode.replace('SUB', ''));
      await Counter.findByIdAndUpdate('subjectCode', { sequence_value: subjectNumber }, { upsert: true });
      console.log(`✅ Updated subjectCode counter to: ${subjectNumber}`);
    } else {
      await Counter.findByIdAndUpdate('subjectCode', { sequence_value: 0 }, { upsert: true });
      console.log('✅ Initialized subjectCode counter to: 0');
    }

    // Get max employee number
    const maxEmployee = await Teacher.findOne({}, {}, { sort: { 'employeeNumber': -1 } });
    if (maxEmployee && maxEmployee.employeeNumber) {
      // Extract number from employee number (assuming format like EMP001, EMP002, etc.)
      const employeeMatch = maxEmployee.employeeNumber.match(/EMP(\d+)/);
      if (employeeMatch) {
        const employeeNumber = parseInt(employeeMatch[1]);
        await Counter.findByIdAndUpdate('employeeNumber', { 
          sequence_value: employeeNumber,
          prefix: 'EMP',
          format: '000',
          description: 'Auto-incrementing employee number counter'
        }, { upsert: true });
        console.log(`✅ Updated employeeNumber counter to: ${employeeNumber}`);
      } else {
        await Counter.findByIdAndUpdate('employeeNumber', { 
          sequence_value: 0,
          prefix: 'EMP',
          format: '000',
          description: 'Auto-incrementing employee number counter'
        }, { upsert: true });
        console.log('✅ Initialized employeeNumber counter to: 0');
      }
    } else {
      await Counter.findByIdAndUpdate('employeeNumber', { 
        sequence_value: 0,
        prefix: 'EMP',
        format: '000',
        description: 'Auto-incrementing employee number counter'
      }, { upsert: true });
      console.log('✅ Initialized employeeNumber counter to: 0');
    }

    console.log('🎉 Counter population migration completed successfully!');
    
    // Display final counter values
    const counters = await Counter.find({});
    console.log('\n📊 Final Counter Values:');
    counters.forEach(counter => {
      console.log(`  ${counter._id}: ${counter.sequence_value}`);
    });

  } catch (error) {
    console.error('❌ Error during counter population migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run migration if called directly
if (require.main === module) {
  populateCounters();
}

module.exports = { populateCounters };
