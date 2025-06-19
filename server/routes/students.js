const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentContestHistory,
  getProblemData,
  exportStudentsCSV,
  refreshStudentData,
  toggleEmailReminders,
  getInactivityStatistics,
  getTopReminderStudentsList,
  triggerInactivityCheckManual,
  sendManualReminder,
  getSubmissionHeatmap
} = require('../controllers/studentController');


router.get('/', getAllStudents);


router.get('/export', exportStudentsCSV);


router.get('/stats/inactivity', getInactivityStatistics);


router.get('/stats/reminders', getTopReminderStudentsList);


router.post('/inactivity/check', triggerInactivityCheckManual);


router.get('/:id', getStudentById);


router.post('/', createStudent);


router.put('/:id', updateStudent);


router.delete('/:id', deleteStudent);


router.patch('/:id/reminders', toggleEmailReminders);


router.get('/:studentId/contests', getStudentContestHistory);


router.get('/:id/problems', getProblemData);


router.post('/:id/refresh', refreshStudentData);


router.post('/trigger-inactivity-check', triggerInactivityCheckManual);


router.post('/:id/send-reminder', sendManualReminder);


router.get('/:id/heatmap', getSubmissionHeatmap);

module.exports = router; 