const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  codeforcesHandle: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  currentRating: {
    type: Number,
    default: 0
  },
  maxRating: {
    type: Number,
    default: 0
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // Inactivity tracking fields
  lastSubmissionDate: {
    type: Date,
    default: Date.now
  },
  reminderEmailCount: {
    type: Number,
    default: 0
  },
  lastReminderSent: {
    type: Date
  },
  emailRemindersDisabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
studentSchema.index({ codeforcesHandle: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ lastSubmissionDate: 1 }); // For inactivity queries

module.exports = mongoose.model('Student', studentSchema); 