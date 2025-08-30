const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true, unique: true }, // Teacher unique ID
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },

    email: { type: String, required: true, unique: true },
    phone: { type: String },

    department: { type: String, required: true },

    qualifications: { type: [String], default: [] }, // array, not string
    certifications: { type: [String], default: [] },

    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Classes" }],

    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave", "Retired"],
      default: "Active",
    },

    // Extra fields you already have in DB
    employeeNumber: { type: String }, // Optional, will be auto-generated
    position: { type: String },
    yearsOfExperience: { type: Number, default: 0 },

    // Work schedule object
    workSchedule: {
      days: [{ type: String }], // e.g., ["Monday", "Wednesday"]
      startTime: { type: String }, // e.g., "08:00"
      endTime: { type: String },   // e.g., "16:00"
    },
  },
  { timestamps: true }
);

// Virtuals (optional, kept for convenience)
TeacherSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

TeacherSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

module.exports = mongoose.model("Teacher", TeacherSchema);
