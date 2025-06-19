const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  contestId: {
    type: Number,
    required: true
  },
  contestName: {
    type: String,
    required: true
  },
  contestDate: {
    type: Date,
    required: true
  },
  oldRating: {
    type: Number,
    required: true
  },
  newRating: {
    type: Number,
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  problemsSolved: {
    type: Number,
    default: 0
  },
  totalProblems: {
    type: Number,
    default: 0
  },
  ratingChange: {
    type: Number,
    required: true
  },
  contestType: {
    type: String,
    enum: ['CF', 'IOI', 'ICPC'],
    default: 'CF'
  }
}, {
  timestamps: true
});


contestSchema.index({ studentId: 1, contestDate: -1 });
contestSchema.index({ contestId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Contest', contestSchema); 