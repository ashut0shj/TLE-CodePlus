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
  refreshStudentData,
  toggleEmailReminders,
  getInactivityStatistics,
  getTopReminderStudentsList,
  triggerInactivityCheckManual,
  sendManualReminder,
  getSubmissionHeatmap
} = require('../controllers/studentController');

// Get all students
router.get('/', getAllStudents);

// Export students as CSV
router.get('/export', exportStudentsCSV);

// Get inactivity statistics
router.get('/stats/inactivity', getInactivityStatistics);

// Get top reminder students
router.get('/stats/reminders', getTopReminderStudentsList);

// Manually trigger inactivity check
router.post('/inactivity/check', triggerInactivityCheckManual);

// Get single student
router.get('/:id', getStudentById);

// Create new student
router.post('/', createStudent);

// Update student
router.put('/:id', updateStudent);

// Delete student
router.delete('/:id', deleteStudent);

// Toggle email reminders for a student
router.patch('/:id/reminders', toggleEmailReminders);

// Get student contest history
router.get('/:studentId/contests', getStudentContestHistory);

// Get student problem solving data
router.get('/:id/problems', getProblemData);

// Refresh Codeforces data for a student
router.post('/:id/refresh', refreshStudentData);

// Trigger inactivity check manually
router.post('/trigger-inactivity-check', triggerInactivityCheckManual);

// Send manual reminder to specific student
router.post('/:id/send-reminder', sendManualReminder);

// Get submission heatmap data for a student
router.get('/:id/heatmap', getSubmissionHeatmap);

module.exports = router; 