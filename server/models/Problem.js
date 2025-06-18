const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  problemId: {
    type: String,
    required: true
  },
  problemName: {
    type: String,
    required: true
  },
  contestId: {
    type: Number
  },
  problemIndex: {
    type: String
  },
  rating: {
    type: Number
  },
  tags: [{
    type: String
  }],
  solvedDate: {
    type: Date,
    required: true
  },
  submissionId: {
    type: Number,
    required: true
  },
  verdict: {
    type: String,
    required: true
  },
  programmingLanguage: {
    type: String
  },
  timeConsumed: {
    type: Number
  },
  memoryConsumed: {
    type: Number
  },
  points: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
problemSchema.index({ studentId: 1, solvedDate: -1 });
problemSchema.index({ problemId: 1, studentId: 1 }, { unique: true });
problemSchema.index({ rating: 1 });

module.exports = mongoose.model('Problem', problemSchema); 