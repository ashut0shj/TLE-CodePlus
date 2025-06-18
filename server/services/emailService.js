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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
          <!-- TLE Header -->
          <div style="text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white;">
            <img src="cid:logo" alt="TLE Logo" style="width: 60px; height: 60px; margin-bottom: 10px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">TLE CodePlus</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Excellence in Competitive Programming</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2563eb; margin-top: 0; font-size: 24px;">Hello ${student.name}! 👋</h2>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; color: #92400e; font-weight: 500;">
                ⚠️ You haven't solved any problems on Codeforces for <strong>${daysSinceLastSubmission} days</strong>.
              </p>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              Don't let your problem-solving skills get rusty! Every day you wait is a day you could be improving. 
              Remember, consistency is the key to success in competitive programming.
            </p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <h3 style="color: #1e40af; margin-top: 0;">Your Current Stats:</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="text-align: center; padding: 10px; background-color: white; border-radius: 6px;">
                  <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${student.currentRating}</div>
                  <div style="font-size: 12px; color: #6b7280;">Current Rating</div>
                </div>
                <div style="text-align: center; padding: 10px; background-color: white; border-radius: 6px;">
                  <div style="font-size: 24px; font-weight: bold; color: #059669;">${student.maxRating}</div>
                  <div style="font-size: 12px; color: #6b7280;">Max Rating</div>
                </div>
              </div>
              <div style="margin-top: 15px; padding: 10px; background-color: #fef2f2; border-radius: 6px; text-align: center;">
                <span style="color: #dc2626; font-weight: 500;">Last Activity: ${new Date(student.lastSubmissionDate).toLocaleDateString()}</span>
              </div>
            </div>
            
            <!-- Motivational Code Section -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin: 20px 0; color: white;">
              <h3 style="margin-top: 0; text-align: center;">💻 Motivational Code</h3>
              <div style="background-color: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; overflow-x: auto;">
                <div style="color: #60a5fa;">// Your journey to excellence</div>
                <div style="color: #fbbf24;">while</div>
                <div style="color: #fbbf24;">(</div>
                <div style="color: #34d399;">!success</div>
                <div style="color: #fbbf24;">)</div>
                <div style="color: #fbbf24;">{</div>
                <div style="margin-left: 20px;">
                  <div style="color: #34d399;">practice</div>
                  <div style="color: #34d399;">();</div>
                  <div style="color: #34d399;">learn</div>
                  <div style="color: #34d399;">();</div>
                  <div style="color: #34d399;">grow</div>
                  <div style="color: #34d399;">();</div>
                </div>
                <div style="color: #fbbf24;">}</div>
                <div style="margin-top: 10px; color: #60a5fa;">// Keep coding, keep growing! 🚀</div>
              </div>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">Ready to get back in the game? Here are some suggestions:</p>
            <ul style="color: #374151; line-height: 1.6;">
              <li>🎯 Solve 2-3 problems from your current rating range</li>
              <li>🏆 Participate in upcoming contests</li>
              <li>📚 Review problems you struggled with before</li>
              <li>👥 Practice with friends or join study groups</li>
              <li>📖 Read editorials and learn new techniques</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://codeforces.com/problemset" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                🚀 Start Solving Now!
              </a>
            </div>
            
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                💡 <strong>Pro Tip:</strong> Set a daily goal of solving at least one problem. 
                Consistency beats intensity every time!
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
              This is reminder #${student.reminderEmailCount + 1}. 
              You can disable these reminders in your student profile if needed.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 20px; padding: 20px; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 10px;">
              <strong>TLE CodePlus</strong> - Excellence in Competitive Programming
            </div>
            <div style="color: #9ca3af; font-size: 11px;">
              Best regards,<br>
              The TLE CodePlus Team
            </div>
          </div>
        </div>
      `,
      attachments: [{
        filename: 'logo.svg',
        path: './public/logo.svg',
        cid: 'logo'
      }]
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