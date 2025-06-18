# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB running locally or MongoDB Atlas connection

## Quick Setup

### 1. Install Dependencies
```bash
# Run the setup script
./setup.sh

# Or manually:
cd server && npm install
cd ../client && npm install
```

### 2. Start MongoDB
```bash
# On Linux/Mac
sudo systemctl start mongod

# On Windows
net start MongoDB

# Or use MongoDB Atlas (cloud)
```

### 3. Start the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Client:**
```bash
cd client
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Testing the Application

### 1. Add a Sample Student
- Click "Add Student" button
- Fill in the form with a valid Codeforces handle
- The system will automatically fetch rating data

### 2. View Student Details
- Click "View Details" on any student
- Explore contest history and problem solving data

### 3. Export Data
- Click "Export CSV" to download student data

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check connection string in server/.env file
- For MongoDB Atlas, use the connection string from your cluster

### Port Already in Use
- Change the port in server/.env file
- Or kill the process using the port: `lsof -ti:5000 | xargs kill`

### Codeforces API Issues
- The system will work without Codeforces API
- Rating data can be manually entered if needed

## Sample Data

To test with sample data, you can add students with these Codeforces handles:
- tourist
- Petr
- Egor
- Um_nik
- Radewoosh

These are real Codeforces users with extensive contest history. 