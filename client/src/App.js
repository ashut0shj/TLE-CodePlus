import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import StudentTable from './components/StudentTable';
import StudentProfile from './components/StudentProfile';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<StudentTable />} />
            <Route path="/student/:id" element={<StudentProfile />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
