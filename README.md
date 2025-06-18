# TLE CodePlus - Student Progress Management System

A comprehensive MERN stack application for managing student progress in competitive programming, specifically designed for Codeforces users.

## Features

### Student Table View
- **Complete Student Listing**: View all enrolled students with their basic information
- **Search Functionality**: Search students by name, email, or Codeforces handle
- **CRUD Operations**: Add, edit, and delete students
- **CSV Export**: Download the entire student dataset as CSV
- **Rating Display**: Color-coded ratings based on Codeforces rating system
- **Quick Actions**: View detailed student profiles with one click

### Student Profile View
- **Contest History**: 
  - Filter by last 30, 90, or 365 days
  - Interactive rating progress chart
  - Detailed contest list with rating changes, ranks, and problems solved
- **Problem Solving Data**:
  - Filter by last 7, 30, or 90 days
  - Statistics dashboard (total problems, average rating, problems per day, hardest problem)
  - Bar chart showing problems solved by rating buckets
  - Submission heatmap showing daily activity

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Axios** for external API calls
- **CORS** for cross-origin requests

### Frontend
- **React.js** with React Router
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Calendar Heatmap** for submission tracking
- **React CSV** for data export

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd TLE-CodePlus
```

### 2. Install server dependencies
```bash
cd server
npm install
```

### 3. Install client dependencies
```bash
cd ../client
npm install
```

### 4. Environment Setup

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tle-codeprogress
NODE_ENV=development
```

### 5. Start the application

#### Start the server (from server directory):
```bash
cd server
npm run dev
```

#### Start the client (from client directory):
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/export` - Export students as CSV
- `GET /api/students/:studentId/contests` - Get student contest history
- `GET /api/students/:studentId/problems` - Get student problem solving data

## Database Schema

### Student Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  phoneNumber: String (required),
  codeforcesHandle: String (required, unique),
  currentRating: Number,
  maxRating: Number,
  enrollmentDate: Date,
  isActive: Boolean,
  lastUpdated: Date
}
```

### Contest Model
```javascript
{
  studentId: ObjectId (ref: Student),
  contestId: Number,
  contestName: String,
  contestDate: Date,
  oldRating: Number,
  newRating: Number,
  rank: Number,
  problemsSolved: Number,
  totalProblems: Number,
  ratingChange: Number,
  contestType: String
}
```

### Problem Model
```javascript
{
  studentId: ObjectId (ref: Student),
  problemId: String,
  problemName: String,
  contestId: Number,
  problemIndex: String,
  rating: Number,
  tags: [String],
  solvedDate: Date,
  submissionId: Number,
  verdict: String,
  programmingLanguage: String,
  timeConsumed: Number,
  memoryConsumed: Number,
  points: Number
}
```

## Usage

### Adding a Student
1. Click "Add Student" button on the main page
2. Fill in the required information (name, email, phone, Codeforces handle)
3. The system will automatically fetch the student's current and max rating from Codeforces
4. Click "Add Student" to save

### Viewing Student Details
1. Click "View Details" on any student row
2. Navigate through the contest history and problem solving sections
3. Use the filter dropdowns to adjust the time period for data display

### Exporting Data
1. Click "Export CSV" button to download all student data
2. The CSV file will include all student information in a spreadsheet format

## Codeforces Integration

The system integrates with Codeforces API to:
- Fetch initial rating data when adding students
- Display color-coded ratings based on Codeforces rating system
- Track contest participation and rating changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 