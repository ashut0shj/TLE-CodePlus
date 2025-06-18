const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentContestHistory,
  getStudentProblemData,
  exportStudentsCSV,
  refreshStudentData
} = require('../controllers/studentController');

// Get all students
router.get('/', getAllStudents);

// Export students as CSV
router.get('/export', exportStudentsCSV);

// Get single student
router.get('/:id', getStudentById);

// Create new student
router.post('/', createStudent);

// Update student
router.put('/:id', updateStudent);

// Delete student
router.delete('/:id', deleteStudent);

// Get student contest history
router.get('/:studentId/contests', getStudentContestHistory);

// Get student problem solving data
router.get('/:studentId/problems', getStudentProblemData);

// Refresh Codeforces data for a student
router.post('/:id/refresh', refreshStudentData);

module.exports = router; 