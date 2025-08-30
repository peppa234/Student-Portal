const Counter = require('../models/Counter');

/**
 * Get the next sequence value for a given counter name
 * @param {string} name - The name of the counter
 * @returns {Promise<string>} - The next formatted sequence value
 */
const getNextSequence = async (name) => {
  try {
    // Find and increment the counter atomically
    const counter = await Counter.findOneAndUpdate(
      { _id: name },
      { 
        $inc: { sequence_value: 1 },
        $set: { lastUsed: new Date() }
      },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true 
      }
    );

    if (!counter) {
      throw new Error(`Failed to get or create counter: ${name}`);
    }

    // Return the formatted value
    return counter.formattedValue;
  } catch (error) {
    console.error(`Error getting next sequence for ${name}:`, error);
    throw new Error(`Failed to get next sequence for ${name}: ${error.message}`);
  }
};

/**
 * Get the next sequence value without incrementing
 * @param {string} name - The name of the counter
 * @returns {Promise<string>} - The next formatted sequence value
 */
const peekNextSequence = async (name) => {
  try {
    const counter = await Counter.findOne({ _id: name });
    
    if (!counter) {
      // Create the counter if it doesn't exist
      const newCounter = await Counter.create({
        _id: name,
        sequence_value: 0,
        prefix: getDefaultPrefix(name),
        format: getDefaultFormat(name),
        description: getDefaultDescription(name)
      });
      return newCounter.formattedValue;
    }

    // Return the next value without incrementing
    const nextValue = counter.sequence_value + 1;
    const formatLength = counter.format ? counter.format.length : 3;
    const paddedValue = nextValue.toString().padStart(formatLength, '0');
    
    let result = '';
    if (counter.prefix) result += counter.prefix;
    result += paddedValue;
    if (counter.suffix) result += counter.suffix;
    
    return result;
  } catch (error) {
    console.error(`Error peeking next sequence for ${name}:`, error);
    throw new Error(`Failed to peek next sequence for ${name}: ${error.message}`);
  }
};

/**
 * Reset a counter to a specific value
 * @param {string} name - The name of the counter
 * @param {number} value - The value to reset to (default: 0)
 * @returns {Promise<number>} - The new sequence value
 */
const resetSequence = async (name, value = 0) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: name },
      { 
        $set: { 
          sequence_value: value,
          lastUsed: new Date()
        }
      },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true 
      }
    );

    if (!counter) {
      throw new Error(`Failed to reset counter: ${name}`);
    }

    return counter.sequence_value;
  } catch (error) {
    console.error(`Error resetting sequence for ${name}:`, error);
    throw new Error(`Failed to reset sequence for ${name}: ${error.message}`);
  }
};

/**
 * Get the current sequence value without incrementing
 * @param {string} name - The name of the counter
 * @returns {Promise<string>} - The current formatted sequence value
 */
const getCurrentSequence = async (name) => {
  try {
    const counter = await Counter.findOne({ _id: name });
    
    if (!counter) {
      return null;
    }

    return counter.formattedValue;
  } catch (error) {
    console.error(`Error getting current sequence for ${name}:`, error);
    throw new Error(`Failed to get current sequence for ${name}: ${error.message}`);
  }
};

/**
 * Get default prefix based on counter name
 * @param {string} name - The name of the counter
 * @returns {string} - The default prefix
 */
const getDefaultPrefix = (name) => {
  const prefixes = {
    'studentId': 'ST',
    'teacherId': 'T',
    'classCode': 'CLASS',
    'subjectCode': 'SUB',
    'gradeId': 'GRD',
    'attendanceId': 'ATT'
  };
  
  return prefixes[name] || '';
};

/**
 * Get default format based on counter name
 * @param {string} name - The name of the counter
 * @returns {string} - The default format
 */
const getDefaultFormat = (name) => {
  const formats = {
    'studentId': '000',
    'teacherId': '000',
    'classCode': '000',
    'subjectCode': '000',
    'gradeId': '000',
    'attendanceId': '000'
  };
  
  return formats[name] || '000';
};

/**
 * Get default description based on counter name
 * @param {string} name - The name of the counter
 * @returns {string} - The default description
 */
const getDefaultDescription = (name) => {
  const descriptions = {
    'studentId': 'Auto-incrementing student ID counter',
    'teacherId': 'Auto-incrementing teacher ID counter',
    'classCode': 'Auto-incrementing class code counter',
    'subjectCode': 'Auto-incrementing subject code counter',
    'gradeId': 'Auto-incrementing grade ID counter',
    'attendanceId': 'Auto-incrementing attendance ID counter'
  };
  
  return descriptions[name] || `Auto-incrementing counter for ${name}`;
};

/**
 * Initialize default counters if they don't exist
 * @returns {Promise<void>}
 */
const initializeDefaultCounters = async () => {
  try {
    const defaultCounters = [
      'studentId',
      'teacherId',
      'classCode',
      'subjectCode',
      'gradeId',
      'attendanceId'
    ];

    for (const counterName of defaultCounters) {
      await Counter.getOrCreate(counterName, {
        prefix: getDefaultPrefix(counterName),
        format: getDefaultFormat(counterName),
        description: getDefaultDescription(counterName),
        initialValue: 0
      });
    }

    console.log('✅ Default counters initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing default counters:', error);
    throw error;
  }
};

/**
 * Get all counters information
 * @returns {Promise<Array>} - Array of counter information
 */
const getAllCounters = async () => {
  try {
    const counters = await Counter.find({ isActive: true }).sort({ _id: 1 });
    return counters.map(counter => counter.getCounterInfo());
  } catch (error) {
    console.error('Error getting all counters:', error);
    throw new Error(`Failed to get counters: ${error.message}`);
  }
};

/**
 * Get counter statistics
 * @returns {Promise<Object>} - Counter statistics
 */
const getCounterStats = async () => {
  try {
    const stats = await Counter.getCounterStats();
    return stats[0] || {
      totalCounters: 0,
      totalSequenceValue: 0,
      averageSequenceValue: 0,
      maxSequenceValue: 0,
      minSequenceValue: 0
    };
  } catch (error) {
    console.error('Error getting counter stats:', error);
    throw new Error(`Failed to get counter stats: ${error.message}`);
  }
};

module.exports = {
  getNextSequence,
  peekNextSequence,
  resetSequence,
  getCurrentSequence,
  initializeDefaultCounters,
  getAllCounters,
  getCounterStats
};
