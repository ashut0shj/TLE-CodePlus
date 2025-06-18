const Student = require('../models/Student');
const Problem = require('../models/Problem');
const { sendInactivityReminder } = require('./emailService');

// Check for inactive students and send reminder emails
const checkInactivityAndSendReminders = async () => {
  try {
    console.log('Checking for inactive students...');
    
    // Find students who haven't made submissions in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const inactiveStudents = await Student.find({
      isActive: true,
      emailRemindersDisabled: false,
      lastSubmissionDate: { $lt: sevenDaysAgo }
    });

    console.log(`Found ${inactiveStudents.length} inactive students`);

    const results = [];
    
    for (const student of inactiveStudents) {
      try {
        // Check if we already sent a reminder recently (within 7 days)
        const lastReminderThreshold = new Date();
        lastReminderThreshold.setDate(lastReminderThreshold.getDate() - 7);
        
        if (student.lastReminderSent && student.lastReminderSent > lastReminderThreshold) {
          console.log(`Skipping ${student.name} - reminder sent recently`);
          continue;
        }

        // Send reminder email
        await sendInactivityReminder(student);
        
        // Update student record
        await Student.findByIdAndUpdate(student._id, {
          reminderEmailCount: student.reminderEmailCount + 1,
          lastReminderSent: new Date()
        });

        results.push({
          studentId: student._id,
          name: student.name,
          email: student.email,
          status: 'reminder_sent',
          reminderCount: student.reminderEmailCount + 1
        });

        console.log(`Reminder sent to ${student.name} (${student.email})`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing student ${student.name}:`, error);
        results.push({
          studentId: student._id,
          name: student.name,
          email: student.email,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log(`Inactivity check completed. Processed ${results.length} students.`);
    return results;
    
  } catch (error) {
    console.error('Error in inactivity check:', error);
    throw error;
  }
};

// Update last submission date for a student based on their latest problem submission
const updateLastSubmissionDate = async (studentId) => {
  try {
    const latestProblem = await Problem.findOne({ studentId })
      .sort({ solvedDate: -1 })
      .select('solvedDate');

    if (latestProblem) {
      await Student.findByIdAndUpdate(studentId, {
        lastSubmissionDate: latestProblem.solvedDate
      });
      console.log(`Updated last submission date for student ${studentId}`);
    }
  } catch (error) {
    console.error('Error updating last submission date:', error);
  }
};

// Get inactivity statistics
const getInactivityStats = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = await Student.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          inactive7Days: {
            $sum: {
              $cond: [
                { $lt: ['$lastSubmissionDate', sevenDaysAgo] },
                1,
                0
              ]
            }
          },
          remindersDisabled: {
            $sum: {
              $cond: ['$emailRemindersDisabled', 1, 0]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalStudents: 0,
      inactive7Days: 0,
      remindersDisabled: 0
    };
  } catch (error) {
    console.error('Error getting inactivity stats:', error);
    throw error;
  }
};

// Get students with most reminder emails sent
const getTopReminderStudents = async (limit = 10) => {
  try {
    return await Student.find({ isActive: true, reminderEmailCount: { $gt: 0 } })
      .select('name email reminderEmailCount lastReminderSent lastSubmissionDate')
      .sort({ reminderEmailCount: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Error getting top reminder students:', error);
    throw error;
  }
};

module.exports = {
  checkInactivityAndSendReminders,
  updateLastSubmissionDate,
  getInactivityStats,
  getTopReminderStudents
}; 