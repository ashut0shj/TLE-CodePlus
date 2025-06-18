const Student = require('../models/Student');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const axios = require('axios');
const { updateLastSubmissionDate } = require('../services/inactivityService');
const { getInactivityStats, getTopReminderStudents } = require('../services/inactivityService');
const { triggerInactivityCheck } = require('../cron/inactivityCron');

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })
      .select('name email phoneNumber codeforcesHandle currentRating maxRating enrollmentDate')
      .sort({ name: 1 });
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
};

// Get single student by ID
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Error fetching student' });
  }
};

// Create new student
const createStudent = async (req, res) => {
  try {
    const { name, email, phoneNumber, codeforcesHandle } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { codeforcesHandle }]
    });

    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this email or Codeforces handle already exists' 
      });
    }

    // Fetch initial rating from Codeforces API
    let currentRating = 0;
    let maxRating = 0;

    try {
      const response = await axios.get(
        `https://codeforces.com/api/user.info?handles=${codeforcesHandle}`
      );
      
      if (response.data.status === 'OK' && response.data.result.length > 0) {
        const userInfo = response.data.result[0];
        currentRating = userInfo.rating || 0;
        maxRating = userInfo.maxRating || 0;
      }
    } catch (cfError) {
      console.warn('Could not fetch Codeforces data:', cfError.message);
    }

    const student = new Student({
      name,
      email,
      phoneNumber,
      codeforcesHandle,
      currentRating,
      maxRating
    });

    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Error creating student' });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { name, email, phoneNumber, codeforcesHandle } = req.body;
    
    // Check if email or handle already exists for other students
    const existingStudent = await Student.findOne({
      $or: [{ email }, { codeforcesHandle }],
      _id: { $ne: req.params.id }
    });

    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this email or Codeforces handle already exists' 
      });
    }

    // Get current student to check if handle changed
    const currentStudent = await Student.findById(req.params.id);
    if (!currentStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const handleChanged = currentStudent.codeforcesHandle !== codeforcesHandle;

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, phoneNumber, codeforcesHandle, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );

    // If handle changed, fetch new CF data in real-time
    if (handleChanged) {
      try {
        console.log(`Handle changed for ${updatedStudent.name}, fetching new CF data...`);
        
        // Fetch user info to update ratings
        const userInfoRes = await axios.get(
          `https://codeforces.com/api/user.info?handles=${codeforcesHandle}`
        );
        
        if (userInfoRes.data.status === 'OK' && userInfoRes.data.result.length > 0) {
          const userInfo = userInfoRes.data.result[0];
          await Student.findByIdAndUpdate(updatedStudent._id, {
            currentRating: userInfo.rating || 0,
            maxRating: userInfo.maxRating || 0
          });
        }

        // Fetch contest history
        const contestRes = await axios.get(`https://codeforces.com/api/user.rating?handle=${codeforcesHandle}`);
        if (contestRes.data.status === 'OK') {
          // Remove old contests for this student
          await Contest.deleteMany({ studentId: updatedStudent._id });
          
          // Insert new contests
          const contests = contestRes.data.result.map(c => ({
            studentId: updatedStudent._id,
            contestId: c.contestId,
            contestName: c.contestName,
            contestDate: new Date(c.ratingUpdateTimeSeconds * 1000),
            oldRating: c.oldRating,
            newRating: c.newRating,
            rank: c.rank,
            ratingChange: c.newRating - c.oldRating,
            problemsSolved: 0,
            totalProblems: 0,
            contestType: 'CF'
          }));
          
          if (contests.length > 0) {
            await Contest.insertMany(contests);
          }
        }

        // Fetch problem submissions
        const subRes = await axios.get(`https://codeforces.com/api/user.status?handle=${codeforcesHandle}&from=1&count=10000`);
        if (subRes.data.status === 'OK') {
          // Remove old problems for this student
          await Problem.deleteMany({ studentId: updatedStudent._id });
          
          // Filter only accepted submissions and unique problems
          const solvedProblemsMap = {};
          subRes.data.result.forEach(sub => {
            if (sub.verdict === 'OK') {
              const key = `${sub.problem.contestId}-${sub.problem.index}`;
              if (!solvedProblemsMap[key] || solvedProblemsMap[key].creationTimeSeconds < sub.creationTimeSeconds) {
                solvedProblemsMap[key] = sub;
              }
            }
          });
          
          const problems = Object.values(solvedProblemsMap).map(sub => ({
            studentId: updatedStudent._id,
            problemId: `${sub.problem.contestId}-${sub.problem.index}`,
            problemName: sub.problem.name,
            contestId: sub.problem.contestId,
            problemIndex: sub.problem.index,
            rating: sub.problem.rating,
            tags: sub.problem.tags,
            solvedDate: new Date(sub.creationTimeSeconds * 1000),
            submissionId: sub.id,
            verdict: sub.verdict,
            programmingLanguage: sub.programmingLanguage,
            timeConsumed: sub.timeConsumedMillis,
            memoryConsumed: sub.memoryConsumedBytes,
            points: sub.problem.points || 0
          }));
          
          if (problems.length > 0) {
            await Problem.insertMany(problems);
            
            // Update last submission date for inactivity tracking
            await updateLastSubmissionDate(updatedStudent._id);
          }
        }

        console.log(`CF data updated successfully for ${updatedStudent.name}`);
        
      } catch (cfError) {
        console.error('Error fetching CF data after handle update:', cfError.message);
        // Don't fail the update, just log the error
      }
    }

    // Get the final updated student
    const finalStudent = await Student.findById(updatedStudent._id);
    res.json(finalStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Error updating student' });
  }
};

// Delete student (soft delete)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Error deleting student' });
  }
};

// Get student contest history
const getStudentContestHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days = 365 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const contests = await Contest.find({
      studentId,
      contestDate: { $gte: startDate }
    })
    .sort({ contestDate: -1 });

    res.json(contests);
  } catch (error) {
    console.error('Error fetching contest history:', error);
    res.status(500).json({ message: 'Error fetching contest history' });
  }
};

// Get student problem solving data
const getStudentProblemData = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days = 90 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const problems = await Problem.find({
      studentId,
      solvedDate: { $gte: startDate },
      verdict: 'OK'
    })
    .sort({ solvedDate: -1 });

    // Calculate statistics
    const totalProblems = problems.length;
    const averageRating = problems.length > 0 
      ? problems.reduce((sum, p) => sum + (p.rating || 0), 0) / problems.length 
      : 0;
    const averageProblemsPerDay = problems.length > 0 
      ? problems.length / parseInt(days) 
      : 0;
    const mostDifficultProblem = problems.length > 0 
      ? problems.reduce((max, p) => (p.rating || 0) > (max.rating || 0) ? p : max)
      : null;

    // Group problems by rating buckets
    const ratingBuckets = {};
    problems.forEach(problem => {
      if (problem.rating) {
        const bucket = Math.floor(problem.rating / 100) * 100;
        const bucketKey = `${bucket}-${bucket + 99}`;
        ratingBuckets[bucketKey] = (ratingBuckets[bucketKey] || 0) + 1;
      }
    });

    res.json({
      problems,
      statistics: {
        totalProblems,
        averageRating: Math.round(averageRating),
        averageProblemsPerDay: Math.round(averageProblemsPerDay * 100) / 100,
        mostDifficultProblem,
        ratingBuckets
      }
    });
  } catch (error) {
    console.error('Error fetching problem data:', error);
    res.status(500).json({ message: 'Error fetching problem data' });
  }
};

// Export students as CSV
const exportStudentsCSV = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })
      .select('name email phoneNumber codeforcesHandle currentRating maxRating enrollmentDate')
      .sort({ name: 1 });

    // Create CSV content
    const csvHeader = 'Name,Email,Phone Number,Codeforces Handle,Current Rating,Max Rating,Enrollment Date\n';
    const csvRows = students.map(student => 
      `"${student.name}","${student.email}","${student.phoneNumber}","${student.codeforcesHandle}",${student.currentRating},${student.maxRating},"${student.enrollmentDate.toISOString().split('T')[0]}"`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ message: 'Error exporting CSV' });
  }
};

const refreshStudentData = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    // Fetch contest history from Codeforces
    const contestRes = await axios.get(`https://codeforces.com/api/user.rating?handle=${student.codeforcesHandle}`);
    if (contestRes.data.status !== 'OK') {
      return res.status(400).json({ message: 'Failed to fetch contest data from Codeforces' });
    }
    // Remove old contests for this student
    await Contest.deleteMany({ studentId: student._id });
    // Insert new contests
    const contests = contestRes.data.result.map(c => ({
      studentId: student._id,
      contestId: c.contestId,
      contestName: c.contestName,
      contestDate: new Date(c.ratingUpdateTimeSeconds * 1000),
      oldRating: c.oldRating,
      newRating: c.newRating,
      rank: c.rank,
      ratingChange: c.newRating - c.oldRating,
      problemsSolved: 0, // Will update below
      totalProblems: 0, // Will update below
      contestType: 'CF'
    }));
    await Contest.insertMany(contests);
    // Fetch problem submissions from Codeforces
    const subRes = await axios.get(`https://codeforces.com/api/user.status?handle=${student.codeforcesHandle}&from=1&count=10000`);
    if (subRes.data.status !== 'OK') {
      return res.status(400).json({ message: 'Failed to fetch submissions from Codeforces' });
    }
    // Remove old problems for this student
    await Problem.deleteMany({ studentId: student._id });
    // Filter only accepted submissions and unique problems
    const solvedProblemsMap = {};
    subRes.data.result.forEach(sub => {
      if (sub.verdict === 'OK') {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!solvedProblemsMap[key] || solvedProblemsMap[key].creationTimeSeconds < sub.creationTimeSeconds) {
          solvedProblemsMap[key] = sub;
        }
      }
    });
    const problems = Object.values(solvedProblemsMap).map(sub => ({
      studentId: student._id,
      problemId: `${sub.problem.contestId}-${sub.problem.index}`,
      problemName: sub.problem.name,
      contestId: sub.problem.contestId,
      problemIndex: sub.problem.index,
      rating: sub.problem.rating,
      tags: sub.problem.tags,
      solvedDate: new Date(sub.creationTimeSeconds * 1000),
      submissionId: sub.id,
      verdict: sub.verdict,
      programmingLanguage: sub.programmingLanguage,
      timeConsumed: sub.timeConsumedMillis,
      memoryConsumed: sub.memoryConsumedBytes,
      points: sub.problem.points || 0
    }));
    await Problem.insertMany(problems);
    // Update problemsSolved and totalProblems in contests
    for (const contest of contests) {
      const contestProblems = problems.filter(p => p.contestId === contest.contestId);
      contest.problemsSolved = contestProblems.length;
      // totalProblems is not available from API directly, so leave as 0 or update if you have a source
      await Contest.updateOne({ studentId: student._id, contestId: contest.contestId }, {
        $set: { problemsSolved: contestProblems.length }
      });
    }
    res.json({ message: 'Codeforces data refreshed successfully' });
  } catch (error) {
    console.error('Error refreshing Codeforces data:', error);
    res.status(500).json({ message: 'Error refreshing Codeforces data', error: error.message });
  }
};

// Toggle email reminders for a student
const toggleEmailReminders = async (req, res) => {
  try {
    const { emailRemindersDisabled } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { emailRemindersDisabled },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: `Email reminders ${emailRemindersDisabled ? 'disabled' : 'enabled'} for ${student.name}`,
      student
    });
  } catch (error) {
    console.error('Error toggling email reminders:', error);
    res.status(500).json({ message: 'Error toggling email reminders' });
  }
};

// Get inactivity statistics
const getInactivityStatistics = async (req, res) => {
  try {
    const stats = await getInactivityStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching inactivity stats:', error);
    res.status(500).json({ message: 'Error fetching inactivity stats' });
  }
};

// Get top reminder students
const getTopReminderStudentsList = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const students = await getTopReminderStudents(parseInt(limit));
    res.json(students);
  } catch (error) {
    console.error('Error fetching top reminder students:', error);
    res.status(500).json({ message: 'Error fetching top reminder students' });
  }
};

// Manually trigger inactivity check
const triggerInactivityCheckManual = async (req, res) => {
  try {
    const results = await triggerInactivityCheck();
    res.json({
      message: 'Inactivity check triggered successfully',
      results
    });
  } catch (error) {
    console.error('Error triggering inactivity check:', error);
    res.status(500).json({ message: 'Error triggering inactivity check' });
  }
};

// Send manual reminder to specific student
const sendManualReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.emailRemindersDisabled) {
      return res.status(400).json({ message: 'Email reminders are disabled for this student' });
    }

    // Import the email service
    const { sendInactivityReminder } = require('../services/emailService');
    
    // Send the reminder email
    await sendInactivityReminder(student);
    
    // Update student record
    await Student.findByIdAndUpdate(student._id, {
      reminderEmailCount: student.reminderEmailCount + 1,
      lastReminderSent: new Date()
    });

    res.json({
      message: `Reminder sent successfully to ${student.name}`,
      studentId: student._id,
      reminderCount: student.reminderEmailCount + 1
    });
  } catch (error) {
    console.error('Error sending manual reminder:', error);
    res.status(500).json({ message: 'Error sending manual reminder', error: error.message });
  }
};

module.exports = {
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
  sendManualReminder
}; 