# Inactivity Detection & Email Reminders Setup

## Features Implemented

### 1. Real-time CF Data Fetching
- When a student's Codeforces handle is updated in the main table, the system automatically fetches new CF data in real-time
- Updates ratings, contest history, and problem submissions immediately
- No need to wait for cron jobs to run

### 2. Inactivity Detection
- Automatically identifies students who haven't made submissions in the last 7 days
- Sends personalized email reminders to encourage problem solving
- Tracks reminder count and last reminder sent date
- Provides option to disable email reminders for individual students

### 3. Email Reminder System
- Personalized HTML emails with student stats and motivation
- Rate limiting (one reminder per week per student)
- Professional email template with call-to-action buttons
- Tracks email delivery and counts

## Setup Instructions

### 1. Email Configuration
Add the following environment variables to your `server/.env` file:

```env
# Email Configuration (for inactivity reminders)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**For Gmail Setup:**
1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password for this application
4. Use that App Password in `EMAIL_PASSWORD`

### 2. Database Schema Updates
The Student model has been updated with new fields:
- `lastSubmissionDate`: Tracks when the student last made a submission
- `reminderEmailCount`: Number of reminder emails sent
- `lastReminderSent`: Date of last reminder email
- `emailRemindersDisabled`: Boolean to disable reminders for specific students

### 3. Cron Job Configuration
The inactivity check runs automatically at 9:00 AM daily. You can modify the schedule in `server/cron/inactivityCron.js`:

```javascript
// Current: Daily at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  // Inactivity check logic
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Adjust timezone as needed
});
```

## New API Endpoints

### Inactivity Management
- `GET /api/students/stats/inactivity` - Get inactivity statistics
- `GET /api/students/stats/reminders` - Get top reminder students
- `POST /api/students/inactivity/check` - Manually trigger inactivity check
- `PATCH /api/students/:id/reminders` - Toggle email reminders for a student

### Enhanced Student Updates
- `PUT /api/students/:id` - Now includes real-time CF data fetching when handle changes

## Frontend Features

### 1. Student Table Enhancements
- Activity status column showing days since last submission
- Email reminder toggle buttons
- Reminder count display
- Inactivity statistics dashboard

### 2. Student Profile Enhancements
- Activity status and last submission date
- Reminder count and settings
- Toggle email reminders functionality
- Last reminder sent information

### 3. Inactivity Manager Page
- Comprehensive inactivity statistics
- Top reminder students list
- Manual inactivity check trigger
- Information about how the system works

## How It Works

### 1. Real-time Updates
When a student's Codeforces handle is updated:
1. System detects the handle change
2. Fetches new user info from CF API
3. Updates ratings immediately
4. Fetches and updates contest history
5. Fetches and updates problem submissions
6. Updates last submission date for inactivity tracking

### 2. Inactivity Detection
Daily at 9:00 AM:
1. System checks for students inactive for 7+ days
2. Filters out students with disabled reminders
3. Checks if reminder was sent recently (within 7 days)
4. Sends personalized email reminders
5. Updates reminder count and last sent date

### 3. Email Reminders
Each reminder email includes:
- Personalized greeting with student name
- Current rating and max rating
- Last activity date
- Motivational content and suggestions
- Direct link to Codeforces problemset
- Reminder count and opt-out information

## Testing

### Manual Testing
1. Update a student's Codeforces handle - verify real-time data fetch
2. Use the "Run Inactivity Check" button to test manually
3. Toggle email reminders for students
4. Check inactivity statistics and top reminder lists

### Email Testing
1. Configure email settings in `.env`
2. Create a test student with a valid email
3. Manually trigger inactivity check
4. Verify email delivery and content

## Monitoring

### Logs to Watch
- Inactivity check logs in server console
- Email delivery confirmations
- CF API fetch errors
- Database update confirmations

### Key Metrics
- Number of inactive students
- Email reminder success rate
- Students with disabled reminders
- Most frequent reminder recipients

## Troubleshooting

### Common Issues
1. **Email not sending**: Check EMAIL_USER and EMAIL_PASSWORD in .env
2. **CF data not updating**: Verify Codeforces handle is valid
3. **Cron not running**: Check server timezone and cron schedule
4. **Database errors**: Ensure MongoDB is running and accessible

### Debug Commands
```bash
# Check server logs
cd server && npm start

# Test email manually
curl -X POST http://localhost:5000/api/students/inactivity/check

# Check inactivity stats
curl http://localhost:5000/api/students/stats/inactivity
``` 