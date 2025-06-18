const nodemailer = require('nodemailer');

// Create transporter (you'll need to configure this with your email provider)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // or your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send inactivity reminder email
const sendInactivityReminder = async (student) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: 'Keep Up Your Problem Solving Streak! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Hello ${student.name}!</h2>
          
          <p>We noticed you haven't made any submissions on Codeforces in the last 7 days. 
          Don't let your problem-solving skills get rusty!</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Your Current Stats:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;">📊 Current Rating: <strong>${student.currentRating}</strong></li>
              <li style="margin: 10px 0;">🏆 Max Rating: <strong>${student.maxRating}</strong></li>
              <li style="margin: 10px 0;">📅 Last Activity: <strong>${new Date(student.lastSubmissionDate).toLocaleDateString()}</strong></li>
            </ul>
          </div>
          
          <p>Ready to get back in the game? Here are some suggestions:</p>
          <ul>
            <li>Solve 2-3 problems from your current rating range</li>
            <li>Participate in upcoming contests</li>
            <li>Review problems you struggled with before</li>
            <li>Practice with friends or join study groups</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://codeforces.com/problemset" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Solving Now!
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            This is reminder #${student.reminderEmailCount + 1}. 
            You can disable these reminders in your student profile if needed.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #64748b; font-size: 12px;">
            Best regards,<br>
            TLE CodePlus Team
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Inactivity reminder sent to ${student.email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending inactivity reminder email:', error);
    throw error;
  }
};

// Send test email
const sendTestEmail = async (to) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Test Email - TLE CodePlus',
      text: 'This is a test email from TLE CodePlus system.'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Test email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
};

module.exports = {
  sendInactivityReminder,
  sendTestEmail
}; 