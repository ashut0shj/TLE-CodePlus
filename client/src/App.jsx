import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import StudentTable from './components/StudentTable.jsx';
import StudentProfile from './components/StudentProfile.jsx';
import InactivityManager from './components/InactivityManager.jsx';
import Navbar from './components/Navbar.jsx';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<StudentTable />} />
            <Route path="/student/:id" element={<StudentProfile />} />
            <Route path="/inactivity" element={<InactivityManager />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
