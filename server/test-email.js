const { sendInactivityReminder } = require('./services/emailService');

// Test email service
const testEmail = async () => {
  try {
    const testStudent = {
      name: 'Test Student',
      email: 'test@example.com',
      codeforcesHandle: 'test_handle',
      currentRating: 1500,
      lastSubmissionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
    };

    console.log('Testing email service...');
    await sendInactivityReminder(testStudent);
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
};

testEmail(); 