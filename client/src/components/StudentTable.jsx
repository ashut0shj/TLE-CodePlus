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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchStudents();
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
    } catch (err) {
      setError(editingStudent ? 'Failed to update student' : 'Failed to add student');
      console.error('Error submitting student:', err);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.codeforcesHandle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.phoneNumber && student.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    if (sortConfig.key === 'name') {
      aValue = aValue?.toLowerCase() || '';
      bValue = bValue?.toLowerCase() || '';
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    } else {
      aValue = aValue || 0;
      bValue = bValue || 0;
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  const getRatingColor = (rating) => {
    if (rating >= 2400) return 'text-red-600 font-semibold';
    if (rating >= 2100) return 'text-amber-600 font-semibold';
    if (rating >= 1900) return 'text-purple-600 font-semibold';
    if (rating >= 1600) return 'text-blue-600 font-semibold';
    if (rating >= 1400) return 'text-cyan-600 font-semibold';
    if (rating >= 1200) return 'text-green-600 font-semibold';
    return 'text-slate-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg border border-blue-400 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Students</h1>
              <p className="text-slate-600 mt-1">Manage and track student progress</p>
            </div>
            <div className="flex gap-3">
              <CSVLink
                data={students}
                filename="students.csv"
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                Export CSV
              </CSVLink>
              <button
                onClick={handleAddStudent}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all duration-200"
              >
                Add Student
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Search and Stats */}
        <div className="bg-white rounded-lg border border-blue-400 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-slate-600">
                  {filteredStudents.length} result{filteredStudents.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{filteredStudents.length}</div>
                <div className="text-sm text-slate-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {filteredStudents.filter(student => {
                    if (!student.lastSubmissionDate) return true;
                    const now = new Date();
                    const last = new Date(student.lastSubmissionDate);
                    const days = Math.floor((now - last) / (1000 * 60 * 60 * 24));
                    return days > 7;
                  }).length}
                </div>
                <div className="text-sm text-slate-600">Inactive 7d+</div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-blue-400 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-slate-800">Student List</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full font-sans">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-blue-200">
                  <th onClick={() => handleSort('name')} className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase cursor-pointer select-none">
                    Name ⥯{sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase">Email</th>
                  <th className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase">Phone</th>
                  <th className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase">Handle</th>
                  <th className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase">Last Sync</th>
                  <th onClick={() => handleSort('currentRating')} className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase cursor-pointer select-none">
                    Current ⥯ {sortConfig.key === 'currentRating' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('maxRating')} className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase cursor-pointer select-none">
                    Max ⥯ {sortConfig.key === 'maxRating' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student, index) => {
                  let rowClass = 'bg-gradient-to-b from-gray-50 via-white to-gray-50';
                  if (!student.lastSubmissionDate) {
                    rowClass = 'bg-red-100';
                  } else {
                    const now = new Date();
                    const last = new Date(student.lastSubmissionDate);
                    const days = Math.floor((now - last) / (1000 * 60 * 60 * 24));
                    if (days > 7) {
                      rowClass = 'bg-red-100';
                    } else if (days > 4) {
                      rowClass = 'bg-amber-100';
                    }
                  }
                  return (
                    <tr
                      key={student._id}
                      className={`${rowClass} border-b border-gray-300 hover:shadow-sm hover:scale-[1.01] transition-all duration-150`}
                    >
                      <td className="px-5 py-3 border-r border-gray-100">
                        <div className="font-medium text-slate-800">{student.name}</div>
                      </td>
                      <td className="px-5 py-3 border-r border-gray-100">
                        <div className="text-slate-600">{student.email}</div>
                      </td>
                      <td className="px-5 py-3 border-r border-gray-100">
                        <div className="text-slate-600">{student.phoneNumber}</div>
                      </td>
                      <td className="px-5 py-3 border-r border-gray-100">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://codeforces.com/profile/${student.codeforcesHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-blue-600 hover:underline"
                          >
                            {student.codeforcesHandle}
                          </a>
                        </div>
                      </td>
                      <td className="px-5 py-3 border-r border-gray-100">
                        <span className="text-xs text-slate-500">
                          {student.lastDataSync ? new Date(student.lastDataSync).toLocaleDateString() : 'Never'}
                        </span>
                      </td>
                      <td className="px-5 py-3 border-r border-gray-100">
                        <span className={`font-mono ${getRatingColor(student.currentRating)}`}>
                          {student.currentRating}
                        </span>
                      </td>
                      <td className="px-5 py-3 border-r border-gray-100">
                        <span className={`font-mono ${getRatingColor(student.maxRating)}`}>
                          {student.maxRating}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <Link
                            to={`/student/${student._id}`}
                            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-200"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="px-3 py-1 text-xs font-medium text-white bg-gray-600 rounded-full hover:bg-gray-700 transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student._id)}
                            className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">
                {searchTerm ? 'No students found matching your search.' : 'No students found.'}
              </p>
            </div>
          )}
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
    </div>
  );
};

export default StudentTable;