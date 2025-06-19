const Student = require('../models/Student');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const axios = require('axios');
const { updateLastSubmissionDate } = require('../services/inactivityService');
const { getInactivityStats, getTopReminderStudents } = require('../services/inactivityService');
const { triggerInactivityCheck } = require('../cron/inactivityCron');
const mongoose = require('mongoose');

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

// Get problem solving data for a student
const getProblemData = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 90 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get problems within the date range
    const problems = await Problem.find({
      studentId: id,
      solvedDate: { $gte: startDate }
    }).sort({ solvedDate: -1 });

    if (problems.length === 0) {
      return res.json({
        problems: [],
        statistics: {
          totalProblems: 0,
          averageRating: 0,
          averageProblemsPerDay: 0,
          mostDifficultProblem: null,
          ratingBuckets: {}
        }
      });
    }

    // Calculate statistics
    const totalProblems = problems.length;
    const problemsWithRating = problems.filter(p => p.rating);
    const averageRating = problemsWithRating.length > 0 
      ? Math.round(problemsWithRating.reduce((sum, p) => sum + p.rating, 0) / problemsWithRating.length)
      : 0;
    
    const daysDiff = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
    const averageProblemsPerDay = daysDiff > 0 ? (totalProblems / daysDiff).toFixed(2) : 0;
    
    // Find most difficult problem
    const mostDifficultProblem = problemsWithRating.length > 0 
      ? problemsWithRating.reduce((max, p) => p.rating > max.rating ? p : max)
      : null;

    // Create rating buckets
    const ratingBuckets = {};
    problemsWithRating.forEach(problem => {
      const bucket = Math.floor(problem.rating / 100) * 100;
      const bucketKey = `${bucket}-${bucket + 99}`;
      ratingBuckets[bucketKey] = (ratingBuckets[bucketKey] || 0) + 1;
    });

    // Sort rating buckets by rating and add descriptive labels
    const sortedRatingBuckets = {};
    Object.keys(ratingBuckets)
      .sort((a, b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]))
      .forEach(key => {
        const [start, end] = key.split('-');
        const startRating = parseInt(start);
        let label = key;
        
        // Add descriptive labels for common rating ranges
        if (startRating >= 800 && startRating <= 1199) {
          label = `${key} (Newbie)`;
        } else if (startRating >= 1200 && startRating <= 1399) {
          label = `${key} (Pupil)`;
        } else if (startRating >= 1400 && startRating <= 1599) {
          label = `${key} (Specialist)`;
        } else if (startRating >= 1600 && startRating <= 1899) {
          label = `${key} (Expert)`;
        } else if (startRating >= 1900 && startRating <= 2099) {
          label = `${key} (Candidate Master)`;
        } else if (startRating >= 2100 && startRating <= 2299) {
          label = `${key} (Master)`;
        } else if (startRating >= 2300 && startRating <= 2399) {
          label = `${key} (International Master)`;
        } else if (startRating >= 2400) {
          label = `${key} (Grandmaster)`;
        }
        
        sortedRatingBuckets[label] = ratingBuckets[key];
      });

    res.json({
      problems,
      statistics: {
        totalProblems,
        averageRating,
        averageProblemsPerDay: parseFloat(averageProblemsPerDay),
        mostDifficultProblem,
        ratingBuckets: sortedRatingBuckets
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

// Refresh Codeforces data for a student
const refreshStudentData = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log(`Refreshing Codeforces data for student: ${student.name} (${student.codeforcesHandle})`);

    // Fetch user info from Codeforces API
    const userResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${student.codeforcesHandle}`);
    
    if (userResponse.data.status !== 'OK') {
      return res.status(400).json({ message: 'Failed to fetch user data from Codeforces' });
    }

    const userData = userResponse.data.result[0];
    
    // Update student data
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        currentRating: userData.rating || 0,
        maxRating: userData.maxRating || 0,
        lastUpdated: new Date(),
        lastDataSync: new Date() // Update data freshness tracking
      },
      { new: true }
    );

    // Fetch and store contest history
    await fetchAndStoreContestHistory(student.codeforcesHandle, id);
    
    // Fetch and store problem submissions
    await fetchAndStoreProblemSubmissions(student.codeforcesHandle, id);

    res.json({
      message: 'Codeforces data refreshed successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Error refreshing student data:', error);
    res.status(500).json({ message: 'Error refreshing student data', error: error.message });
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

// Get submission heatmap data for a student
const getSubmissionHeatmap = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 365 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const heatmapData = await Problem.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(id),
          solvedDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$solvedDate" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Convert to the format expected by react-calendar-heatmap
    const formattedData = heatmapData.map(item => ({
      date: item._id,
      count: item.count
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching submission heatmap:', error);
    res.status(500).json({ message: 'Error fetching submission heatmap data' });
  }
};

// Helper function to fetch and store contest history
const fetchAndStoreContestHistory = async (handle, studentId) => {
  try {
    const contestRes = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
    if (contestRes.data.status !== 'OK') {
      throw new Error('Failed to fetch contest data from Codeforces');
    }
    
    // Remove old contests for this student
    await Contest.deleteMany({ studentId: studentId });
    
    // Insert new contests
    const contests = contestRes.data.result.map(c => ({
      studentId: studentId,
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
    return contests;
  } catch (error) {
    console.error('Error fetching contest history:', error);
    throw error;
  }
};

// Helper function to fetch and store problem submissions
const fetchAndStoreProblemSubmissions = async (handle, studentId) => {
  try {
    const subRes = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`);
    if (subRes.data.status !== 'OK') {
      throw new Error('Failed to fetch submissions from Codeforces');
    }
    
    // Remove old problems for this student
    await Problem.deleteMany({ studentId: studentId });
    
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
      studentId: studentId,
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
    
    // Update problemsSolved in contests
    const contests = await Contest.find({ studentId: studentId });
    for (const contest of contests) {
      const contestProblems = problems.filter(p => p.contestId === contest.contestId);
      await Contest.updateOne(
        { studentId: studentId, contestId: contest.contestId },
        { $set: { problemsSolved: contestProblems.length } }
      );
    }
    
    return problems;
  } catch (error) {
    console.error('Error fetching problem submissions:', error);
    throw error;
  }
};

module.exports = {
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
}; 