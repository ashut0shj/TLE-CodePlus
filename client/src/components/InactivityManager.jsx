import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InactivityManager = () => {
  const [inactivityStats, setInactivityStats] = useState(null);
  const [topReminderStudents, setTopReminderStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingInactivity, setCheckingInactivity] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, remindersResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/students/stats/inactivity`),
        axios.get(`${API_BASE_URL}/students/stats/reminders`)
      ]);
      
      setInactivityStats(statsResponse.data);
      setTopReminderStudents(remindersResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inactivity data');
      console.error('Error fetching inactivity data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualInactivityCheck = async () => {
    try {
      setCheckingInactivity(true);
      const response = await axios.post(`${API_BASE_URL}/students/inactivity/check`);
      alert(`Inactivity check completed! ${response.data.results.length} students processed.`);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to trigger inactivity check');
      console.error('Error triggering inactivity check:', err);
    } finally {
      setCheckingInactivity(false);
    }
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
          <h1 className="text-3xl font-bold text-slate-800">Inactivity Management</h1>
          <p className="text-base text-slate-600 mt-1">Monitor student activity and manage email reminders</p>
        </div>
        <button
          onClick={handleManualInactivityCheck}
          disabled={checkingInactivity}
          className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
        >
          {checkingInactivity ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Checking...
            </>
          ) : (
            'Run Inactivity Check'
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
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

      {/* Top Reminder Students */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-slate-800">Students with Most Reminder Emails</h2>
          <p className="text-sm text-slate-600 mt-1">Students who have received the most inactivity reminder emails</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-base">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Reminder Count</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Last Reminder</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {topReminderStudents.map((student, idx) => (
                <tr key={student._id} className={idx % 2 === 0 ? 'even:bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 font-semibold">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-700">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {student.reminderEmailCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                    {student.lastReminderSent 
                      ? new Date(student.lastReminderSent).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                    {student.lastSubmissionDate 
                      ? new Date(student.lastSubmissionDate).toLocaleDateString()
                      : 'Unknown'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {topReminderStudents.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-lg">
              No students have received reminder emails yet.
            </div>
          )}
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">How Inactivity Detection Works</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• <strong>Automatic Check:</strong> Runs daily at 9:00 AM to identify students inactive for 7+ days</p>
          <p>• <strong>Email Reminders:</strong> Sends personalized emails to inactive students encouraging them to solve problems</p>
          <p>• <strong>Reminder Limits:</strong> Only sends one reminder per week per student to avoid spam</p>
          <p>• <strong>Opt-out Option:</strong> Students can disable email reminders in their profile (enabled by default)</p>
          <p>• <strong>Real-time Updates:</strong> When a student's CF handle is updated, their data is fetched immediately</p>
        </div>
      </div>
    </div>
  );
};

export default InactivityManager; 