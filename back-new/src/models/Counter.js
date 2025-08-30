const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
    // ⚠️ removed "unique: true" (Mongo already enforces uniqueness on _id)
  },
  sequence_value: {
    type: Number,
    required: true,
    default: 0
  },
  prefix: {
    type: String,
    trim: true,
    maxlength: 10
  },
  suffix: {
    type: String,
    trim: true,
    maxlength: 10
  },
  format: {
    type: String,
    trim: true,
    maxlength: 20,
    default: '000'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Virtual for formatted sequence value
counterSchema.virtual('formattedValue').get(function() {
  if (!this.format) return this.sequence_value.toString();
  
  const value = this.sequence_value.toString();
  const formatLength = this.format.length;
  
  let paddedValue = value.padStart(formatLength, '0');
  
  let result = '';
  if (this.prefix) result += this.prefix;
  result += paddedValue;
  if (this.suffix) result += this.suffix;
  
  return result;
});

// Method to get next sequence value
counterSchema.methods.getNextValue = function() {
  this.sequence_value += 1;
  this.lastUsed = new Date();
  return this.sequence_value;
};

// Method to get formatted next value
counterSchema.methods.getNextFormattedValue = function() {
  const nextValue = this.getNextValue();
  
  if (!this.format) return nextValue.toString();
  
  const formatLength = this.format.length;
  const paddedValue = nextValue.toString().padStart(formatLength, '0');
  
  let result = '';
  if (this.prefix) result += this.prefix;
  result += paddedValue;
  if (this.suffix) result += this.suffix;
  
  return result;
};

// Method to reset counter
counterSchema.methods.reset = function(value = 0) {
  this.sequence_value = value;
  this.lastUsed = new Date();
  return this.sequence_value;
};

// Method to get counter info
counterSchema.methods.getCounterInfo = function() {
  return {
    id: this._id,
    currentValue: this.sequence_value,
    nextValue: this.sequence_value + 1,
    formattedCurrentValue: this.formattedValue,
    nextFormattedValue: this.getNextFormattedValue(),
    prefix: this.prefix,
    suffix: this.suffix,
    format: this.format,
    description: this.description,
    lastUsed: this.lastUsed,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Pre-save middleware to validate data
counterSchema.pre('save', function(next) {
  if (this.sequence_value < 0) {
    return next(new Error('Sequence value cannot be negative'));
  }
  
  if (this.format && !/^[0-9]+$/.test(this.format)) {
    return next(new Error('Format must contain only digits'));
  }
  
  if (this.prefix && this.prefix.length > 10) {
    return next(new Error('Prefix cannot exceed 10 characters'));
  }
  
  if (this.suffix && this.suffix.length > 10) {
    return next(new Error('Suffix cannot exceed 10 characters'));
  }
  
  next();
});

// Static methods
counterSchema.statics.findByName = function(name) {
  return this.findOne({ _id: name, isActive: true });
};

counterSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ _id: 1 });
};

counterSchema.statics.findByPrefix = function(prefix) {
  return this.find({ prefix: prefix, isActive: true });
};

counterSchema.statics.getCounterStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    { $group: {
      _id: null,
      totalCounters: { $sum: 1 },
      totalSequenceValue: { $sum: '$sequence_value' },
      averageSequenceValue: { $avg: '$sequence_value' },
      maxSequenceValue: { $max: '$sequence_value' },
      minSequenceValue: { $min: '$sequence_value' }
    }}
  ]);
};

counterSchema.statics.createCounter = function(name, options = {}) {
  const {
    prefix = '',
    suffix = '',
    format = '000',
    description = '',
    initialValue = 0,
    metadata = {}
  } = options;
  
  return this.create({
    _id: name,
    sequence_value: initialValue,
    prefix,
    suffix,
    format,
    description,
    metadata
  });
};

counterSchema.statics.getOrCreate = function(name, options = {}) {
  return this.findOneAndUpdate(
    { _id: name },
    { $setOnInsert: { ...options, sequence_value: options.initialValue || 0 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

counterSchema.statics.getNextSequence = function(name) {
  return this.findOneAndUpdate(
    { _id: name },
    { $inc: { sequence_value: 1 }, $set: { lastUsed: new Date() } },
    { new: true }
  );
};

counterSchema.statics.bulkReset = function(counters) {
  const operations = counters.map(({ name, value }) => ({
    updateOne: {
      filter: { _id: name },
      update: { $set: { sequence_value: value || 0, lastUsed: new Date() } }
    }
  }));
  
  return this.bulkWrite(operations);
};

counterSchema.statics.deactivate = function(name) {
  return this.findOneAndUpdate(
    { _id: name },
    { $set: { isActive: false, lastUsed: new Date() } },
    { new: true }
  );
};

counterSchema.statics.reactivate = function(name) {
  return this.findOneAndUpdate(
    { _id: name },
    { $set: { isActive: true, lastUsed: new Date() } },
    { new: true }
  );
};

module.exports = mongoose.model('Counter', counterSchema);
