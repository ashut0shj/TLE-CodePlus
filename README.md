# TLE CodePlus - Student Progress Management System

## 🚀 Live Demo

- **Frontend:** [https://tle-code-plus.vercel.app/](https://tle-code-plus.vercel.app/)
- **Backend API:** [https://tle-codeplus.onrender.com/](https://tle-codeplus.onrender.com/)

A modern MERN stack application for managing and tracking student progress in competitive programming, with deep Codeforces integration, beautiful UI, and full dark mode support.

---

## 🚀 Features at a Glance

- **Student Table**: Search, sort, add, edit, delete, and export students. Color-coded ratings, inactivity highlighting, and mobile-friendly design.
- **Student Profile**: Contest history, rating charts, problem stats, activity heatmap, and reminders—all in a responsive, dark-mode-ready interface.
- **Codeforces Sync**: Automatic and manual data refresh, contest and problem tracking, and inactivity detection.
- **Dark Mode**: Toggle dark/light mode globally. All UI elements, charts, and heatmaps adapt instantly.
- **Modern UI**: Minimal gradients, glowing branding, solid action buttons, and smooth transitions.

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, Axios  
**Frontend:** React.js, React Router, Tailwind CSS, Recharts, React Calendar Heatmap, React CSV

---

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd TLE-CodePlus
```

### 2. Install Dependencies in both cliet and server
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tle-codeprogress
NODE_ENV=development
```

### 4. Start the Application
- Start the server:
  ```bash
  cd server && npm run dev
  ```
- Start the client:
  ```bash
  cd client && npm start
  ```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🖥️ Main Features

### Student Table
- View, search, sort, and manage all students
- Add/edit/delete with instant UI updates
- Export all data as CSV
- Color-coded ratings and inactivity highlighting
- Click on a student name or "View" to open their profile

### Student Profile
- **Contest History**: Interactive rating chart, filter by time, detailed contest list
- **Problem Solving**: Stats dashboard, rating buckets bar chart, hardest problem, filter by time
- **Activity Heatmap**: Visualize daily problem-solving activity (dark mode supported)
- **Reminders**: Send and track email reminders for inactivity
- **Manual/Auto Data Refresh**: Sync with Codeforces at any time

### Codeforces Integration
- Fetches and updates ratings, contests, and problems from Codeforces API
- Tracks inactivity and highlights students accordingly

### UI/UX
- **Dark Mode**: Toggle in navbar, all components adapt
- **Mobile Responsive**: Works on all screen sizes
- **Modern Look**: Minimal gradients, glowing logo, solid buttons, smooth transitions

---

## 🗄️ Database Models (Simplified)

### Student
```js
{
  name, email, phoneNumber, codeforcesHandle, currentRating, maxRating,
  enrollmentDate, isActive, lastUpdated, lastSubmissionDate, lastDataSync
}
```
### Contest
```js
{
  studentId, contestId, contestName, contestDate, oldRating, newRating,
  rank, problemsSolved, totalProblems, ratingChange, contestType
}
```
### Problem
```js
{
  studentId, problemId, problemName, contestId, problemIndex, rating, tags,
  solvedDate, submissionId, verdict, programmingLanguage, timeConsumed, memoryConsumed, points
}
```

---

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License
MIT License

---

## 💬 Support
For questions or support, open an issue in the repository.

---

**Enjoy using TLE CodePlus!** 
