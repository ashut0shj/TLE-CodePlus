/**
 * StudentTable - styled with new palette and structure
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import StudentModal from './StudentModal.jsx';

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inactivityStats, setInactivityStats] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchStudents();
    fetchInactivityStats();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/students`);
      setStudents(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInactivityStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/stats/inactivity`);
      setInactivityStats(response.data);
    } catch (err) {
      console.error('Error fetching inactivity stats:', err);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${API_BASE_URL}/students/${id}`);
        fetchStudents();
      } catch (err) {
        setError('Failed to delete student');
        console.error('Error deleting student:', err);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingStudent(null);
  };

  const handleModalSubmit = async (studentData) => {
    try {
      if (editingStudent) {
        await axios.put(`${API_BASE_URL}/students/${editingStudent._id}`, studentData);
      } else {
        await axios.post(`${API_BASE_URL}/students`, studentData);
      }
      fetchStudents();
      handleModalClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student');
      console.error('Error saving student:', err);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.codeforcesHandle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRatingColor = (rating) => {
    if (rating >= 2400) return 'text-red-500 font-mono font-bold';
    if (rating >= 2100) return 'text-amber-500 font-mono font-bold';
    if (rating >= 1900) return 'text-purple-600 font-mono font-bold';
    if (rating >= 1600) return 'text-blue-600 font-mono font-bold';
    if (rating >= 1400) return 'text-cyan-600 font-mono font-bold';
    if (rating >= 1200) return 'text-green-500 font-mono font-bold';
    return 'text-slate-600 font-mono';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Students</h1>
          <p className="text-base text-slate-600 mt-1">Manage and track student progress in competitive programming</p>
        </div>
        <div className="flex gap-2">
          <CSVLink
            data={students}
            filename="students.csv"
            className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            Export CSV
          </CSVLink>
          <button
            onClick={handleAddStudent}
            className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            Add Student
          </button>
        </div>
      </div>

      {/* Inactivity Stats */}
      {inactivityStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{inactivityStats.totalStudents}</div>
            <div className="text-sm text-slate-600">Total Students</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{inactivityStats.inactive7Days}</div>
            <div className="text-sm text-slate-600">Inactive (7+ days)</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{inactivityStats.remindersDisabled}</div>
            <div className="text-sm text-slate-600">Reminders Disabled</div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 flex flex-col sm:flex-row gap-2 items-center">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-gray-50"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full text-base">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Codeforces Handle</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Current Rating</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Max Rating</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, idx) => (
              <tr key={student._id} className={idx % 2 === 0 ? 'even:bg-gray-50 hover:bg-blue-50 transition-all duration-200' : 'hover:bg-blue-50 transition-all duration-200'}>
                <td className="px-6 py-4 whitespace-nowrap text-slate-800 font-semibold text-base">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-700">{student.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-700">{student.phoneNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-mono">{student.codeforcesHandle}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={getRatingColor(student.currentRating)}>{student.currentRating}</span></td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={getRatingColor(student.maxRating)}>{student.maxRating}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    to={`/student/${student._id}`}
                    className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleEditStudent(student)}
                    className="inline-block px-3 py-1 rounded-full bg-gray-100 text-slate-700 font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student._id)}
                    className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-500 font-semibold hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-lg">{searchTerm ? 'No students found matching your search.' : 'No students found.'}</div>
        )}
      </div>

      {/* Student Modal */}
      {showModal && (
        <StudentModal
          student={editingStudent}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default StudentTable; 