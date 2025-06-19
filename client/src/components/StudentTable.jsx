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
  const [animateHeader, setAnimateHeader] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [animateSearch, setAnimateSearch] = useState(false);
  const [animateTable, setAnimateTable] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchStudents();
    fetchInactivityStats();
    setTimeout(() => setAnimateHeader(true), 100);
    setTimeout(() => setAnimateStats(true), 400);
    setTimeout(() => setAnimateSearch(true), 700);
    setTimeout(() => setAnimateTable(true), 1000);
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

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${API_BASE_URL}/students/${studentId}`);
        fetchStudents();
        fetchInactivityStats();
      } catch (err) {
        setError('Failed to delete student');
        console.error('Error deleting student:', err);
      }
    }
  };

  const handleSubmitStudent = async (formData) => {
    try {
      if (editingStudent) {
        await axios.put(`${API_BASE_URL}/students/${editingStudent._id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/students`, formData);
      }
      setShowModal(false);
      fetchStudents();
      fetchInactivityStats();
    } catch (err) {
      setError(editingStudent ? 'Failed to update student' : 'Failed to add student');
      console.error('Error submitting student:', err);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.codeforcesHandle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRatingColor = (rating) => {
    if (rating >= 2400) return 'text-red-600 font-bold';
    if (rating >= 2100) return 'text-orange-600 font-bold';
    if (rating >= 1900) return 'text-purple-600 font-bold';
    if (rating >= 1600) return 'text-blue-600 font-bold';
    if (rating >= 1400) return 'text-cyan-600 font-bold';
    if (rating >= 1200) return 'text-green-600 font-bold';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className={`bg-white rounded-xl shadow-lg border-4 border-gray-300 p-6 transition-all duration-700 transform ${animateHeader ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600 mt-2">Manage and track student progress in competitive programming</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <CSVLink
              data={students}
              filename="students.csv"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Export CSV
            </CSVLink>
            <button
              onClick={handleAddStudent}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Add Student
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 text-sm font-medium">{error}</div>
          </div>
        )}
      </div>

      {/* Statistics Section */}
      {inactivityStats && (
        <div className={`bg-white rounded-xl shadow-lg border-4 border-gray-300 p-6 transition-all duration-700 transform ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Activity Overview</h2>
            <p className="text-gray-600 text-xs mt-1">Current student activity statistics</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-gray-200 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.03]">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {inactivityStats.totalStudents}
              </div>
              <div className="text-xs font-medium text-blue-800">Total Students</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center border-2 border-gray-200 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.03]">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {inactivityStats.inactive7Days}
              </div>
              <div className="text-xs font-medium text-red-800">Inactive (7+ days)</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center border-2 border-gray-200 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.03]">
              <div className="text-2xl font-bold text-gray-600 mb-1">
                {inactivityStats.remindersDisabled}
              </div>
              <div className="text-xs font-medium text-gray-700">Reminders Disabled</div>
            </div>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className={`bg-white rounded-xl shadow-lg border-4 border-gray-300 p-6 transition-all duration-700 transform ${animateSearch ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <label htmlFor="search" className="sr-only">Search students</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search by name, email, or Codeforces handle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
          </div>
          {searchTerm && (
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {filteredStudents.length} result{filteredStudents.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Students Table Section */}
      <div className={`bg-white rounded-xl shadow-lg border-4 border-gray-300 overflow-hidden transition-all duration-700 transform ${animateTable ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Student List</h2>
          <p className="text-gray-600 text-sm mt-1">Complete list of registered students</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codeforces Handle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student, idx) => (
                <tr key={student._id} className="hover:bg-blue-50 hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{student.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-blue-600">{student.codeforcesHandle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-mono ${getRatingColor(student.currentRating)}`}>
                      {student.currentRating}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-mono ${getRatingColor(student.maxRating)}`}>
                      {student.maxRating}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/student/${student._id}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student._id)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm ? 'No students found matching your search.' : 'No students found.'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <StudentModal
          student={editingStudent}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitStudent}
        />
      )}
    </div>
  );
};

export default StudentTable;