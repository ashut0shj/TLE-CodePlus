const nodemailer = require('nodemailer');

// Create transporter (you'll need to configure this with your email provider)
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email credentials not configured. Emails will be logged instead of sent.');
    return null;
  }

  return nodemailer.createTransport({
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
    
    if (!transporter) {
      // Log the email instead of sending it
      console.log('=== EMAIL WOULD BE SENT ===');
      console.log('To:', student.email);
      console.log('Subject: Keep Up Your Problem Solving Streak! 🚀');
      console.log('Content: Inactivity reminder for', student.name);
      console.log('=== END EMAIL LOG ===');
      return { messageId: 'logged-instead-of-sent' };
    }

    // Calculate days since last submission
    const daysSinceLastSubmission = Math.floor((new Date() - new Date(student.lastSubmissionDate)) / (1000 * 60 * 60 * 24));
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: 'Keep Up Your Problem Solving Streak! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white;">
            <h1 style="margin: 0; font-size: 24px;">TLE CodePlus</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Excellence in Competitive Programming</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2563eb; margin-top: 0;">Hello ${student.name}! 👋</h2>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; color: #92400e;">
                ⚠️ You haven't solved problems for <strong>${daysSinceLastSubmission} days</strong>.
              </p>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              Don't let your skills get rusty! Consistency is key to success in competitive programming.
            </p>
            
            <!-- Stats -->
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Your Stats:</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="text-align: center; padding: 15px; background-color: white; border-radius: 6px;">
                  <div style="font-size: 20px; font-weight: bold; color: #2563eb;">${student.currentRating}</div>
                  <div style="font-size: 12px; color: #6b7280;">Current Rating</div>
                </div>
                <div style="text-align: center; padding: 15px; background-color: white; border-radius: 6px;">
                  <div style="font-size: 20px; font-weight: bold; color: #059669;">${student.maxRating}</div>
                  <div style="font-size: 12px; color: #6b7280;">Max Rating</div>
                </div>
              </div>
            </div>
            
            <!-- Simple Motivational Code -->
            <div style="background-color: #1f2937; padding: 20px; border-radius: 8px; margin: 20px 0; color: white; font-family: 'Courier New', monospace;">
              <div style="text-align: center; margin-bottom: 10px; color: #60a5fa; font-weight: bold;">💻 Daily Motivation</div>
              <div style="font-size: 14px;">
                <span style="color: #fbbf24;">while</span>(<span style="color: #34d399;">!success</span>) {<br>
                &nbsp;&nbsp;<span style="color: #f87171;">practice</span>();<br>
                }<br>
                <span style="color: #9ca3af;">// Keep coding! 🚀</span>
              </div>
            </div>
            
            <p style="color: #374151;">Ready to get back? Here's what you can do:</p>
            <ul style="color: #374151; line-height: 1.8;">
              <li>🎯 Solve 2-3 problems today</li>
              <li>🏆 Join the next contest</li>
              <li>📚 Review previous solutions</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://codeforces.com/problemset" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                🚀 Start Solving Now!
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
              Reminder #${student.reminderEmailCount + 1} • Last activity: ${new Date(student.lastSubmissionDate).toLocaleDateString()}
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <strong>TLE CodePlus Team</strong>
          </div>
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
    
    if (!transporter) {
      console.log('=== TEST EMAIL WOULD BE SENT ===');
      console.log('To:', to);
      console.log('Subject: Test Email - TLE CodePlus');
      console.log('Content: This is a test email from TLE CodePlus system.');
      console.log('=== END TEST EMAIL LOG ===');
      return { messageId: 'logged-instead-of-sent' };
    }
    
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