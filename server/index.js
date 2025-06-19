const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { scheduleInactivityCheck } = require('./cron/inactivityCron');

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tle-codeprogress')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

scheduleInactivityCheck();

app.use('/api/students', require('./routes/students'));
app.use('/api/contests', require('./routes/contests'));
app.use('/api/problems', require('./routes/problems'));

app.get('/', (req, res) => {
  res.json({ message: 'TLE CodePlus API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
