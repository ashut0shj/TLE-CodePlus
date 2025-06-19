const cron = require('node-cron');
const { checkInactivityAndSendReminders } = require('../services/inactivityService');

const scheduleInactivityCheck = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('Running scheduled inactivity check...');
    try {
      const results = await checkInactivityAndSendReminders();
      console.log(`Scheduled inactivity check completed. Processed ${results.length} students.`);
    } catch (error) {
      console.error('Error in scheduled inactivity check:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Adjust timezone as needed
  });
  
  console.log('Inactivity check scheduled to run daily at 2:00 AM');
};

// Manual trigger function for testing
const triggerInactivityCheck = async () => {
  console.log('Manually triggering inactivity check...');
  try {
    const results = await checkInactivityAndSendReminders();
    console.log(`Manual inactivity check completed. Processed ${results.length} students.`);
    return results;
  } catch (error) {
    console.error('Error in manual inactivity check:', error);
    throw error;
  }
};

module.exports = {
  scheduleInactivityCheck,
  triggerInactivityCheck
}; 