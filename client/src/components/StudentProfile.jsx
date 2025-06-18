import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [contests, setContests] = useState([]);
  const [problems, setProblems] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [contestLoading, setContestLoading] = useState(false);
  const [problemLoading, setProblemLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contestFilter, setContestFilter] = useState(365);
  const [problemFilter, setProblemFilter] = useState(90);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  const fetchStudentData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/students/${id}`);
      setStudent(response.data);
    } catch (err) {
      setError('Failed to fetch student data');
      console.error('Error fetching student:', err);
    } finally {
      setLoading(false);
    }
  }, [id, API_BASE_URL]);

  const fetchContestHistory = useCallback(async () => {
    try {
      setContestLoading(true);
      const response = await axios.get(`${API_BASE_URL}/students/${id}/contests?days=${contestFilter}`);
      setContests(response.data);
    } catch (err) {
      console.error('Error fetching contest history:', err);
    } finally {
      setContestLoading(false);
    }
  }, [id, contestFilter, API_BASE_URL]);

  const fetchProblemData = useCallback(async () => {
    try {
      setProblemLoading(true);
      const response = await axios.get(`${API_BASE_URL}/students/${id}/problems?days=${problemFilter}`);
      setProblems(response.data.problems);
      setStatistics(response.data.statistics);
    } catch (err) {
      console.error('Error fetching problem data:', err);
    } finally {
      setProblemLoading(false);
    }
  }, [id, problemFilter, API_BASE_URL]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  useEffect(() => {
    if (student) {
      fetchContestHistory();
      fetchProblemData();
    }
  }, [student, fetchContestHistory, fetchProblemData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('Refreshing Codeforces data for student:', id);
      const response = await axios.post(`${API_BASE_URL}/students/${id}/refresh`);
      console.log('Refresh response:', response.data);
      
      // Reload all data
      await fetchStudentData();
      await fetchContestHistory();
      await fetchProblemData();
      
      alert('Codeforces data refreshed successfully!');
    } catch (err) {
      console.error('Refresh error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to refresh Codeforces data';
      alert(`Error: ${errorMessage}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleReminders = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/students/${id}/reminders`, {
        emailRemindersDisabled: !student.emailRemindersDisabled
      });
      await fetchStudentData(); // Refresh student data
      alert(`Email reminders ${!student.emailRemindersDisabled ? 'disabled' : 'enabled'} successfully!`);
    } catch (err) {
      console.error('Error toggling reminders:', err);
      alert('Failed to update email reminder settings');
    }
  };

  const handleSendReminder = async () => {
    if (student.emailRemindersDisabled) {
      alert('Please enable email reminders for this student first.');
      return;
    }

    if (window.confirm(`Send a reminder email to ${student.name} (${student.email})?`)) {
      try {
        setSendingReminder(true);
        const response = await axios.post(`${API_BASE_URL}/students/${id}/send-reminder`);
        
        if (response.status === 200) {
          alert(`Reminder sent successfully to ${student.name}!`);
          await fetchStudentData(); // Refresh to update reminder count
        } else {
          alert('Failed to send reminder email.');
        }
      } catch (err) {
        console.error('Error sending reminder:', err);
        const errorMessage = err.response?.data?.message || 'Failed to send reminder email';
        alert(`Error: ${errorMessage}`);
      } finally {
        setSendingReminder(false);
      }
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 2400) return 'text-red-600 font-bold';
    if (rating >= 2100) return 'text-orange-600 font-bold';
    if (rating >= 1900) return 'text-purple-600 font-bold';
    if (rating >= 1600) return 'text-blue-600 font-bold';
    if (rating >= 1400) return 'text-cyan-600 font-bold';
    if (rating >= 1200) return 'text-green-600 font-bold';
    return 'text-gray-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInactivityStatus = (lastSubmissionDate) => {
    if (!lastSubmissionDate) return { status: 'unknown', color: 'text-gray-500', text: 'Unknown' };
    
    const daysSinceLastSubmission = Math.floor((new Date() - new Date(lastSubmissionDate)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastSubmission <= 7) {
      return { status: 'active', color: 'text-green-600', text: 'Active' };
    } else if (daysSinceLastSubmission <= 14) {
      return { status: 'warning', color: 'text-yellow-600', text: `${daysSinceLastSubmission} days inactive` };
    } else {
      return { status: 'inactive', color: 'text-red-600', text: `${daysSinceLastSubmission} days inactive` };
    }
  };

  const prepareRatingChartData = () => {
    return contests.map(contest => ({
      date: formatDate(contest.contestDate),
      rating: contest.newRating,
      oldRating: contest.oldRating
    }));
  };

  const prepareRatingBucketsData = () => {
    if (!statistics.ratingBuckets) return [];
    return Object.entries(statistics.ratingBuckets).map(([bucket, count]) => ({
      bucket,
      count
    }));
  };

  const prepareHeatmapData = () => {
    const heatmapData = {};
    problems.forEach(problem => {
      const date = new Date(problem.solvedDate).toISOString().split('T')[0];
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });
    return Object.entries(heatmapData).map(([date, count]) => ({
      date,
      count
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error || 'Student not found'}</div>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          Back to Students
        </Link>
      </div>
    );
  }

  const inactivityStatus = getInactivityStatus(student.lastSubmissionDate);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link to="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← Back to Students
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{student.name}</h1>
          <p className="text-gray-600">{student.email}</p>
        </div>
        <div className="text-right space-y-2">
          <div className={`text-2xl font-bold ${getRatingColor(student.currentRating)}`}>
            {student.currentRating}
          </div>
          <div className="text-sm text-gray-500">Current Rating</div>
          <div className={`text-lg ${getRatingColor(student.maxRating)}`}>
            Max: {student.maxRating}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {refreshing ? 'Refreshing...' : 'Refresh CF Data'}
            </button>
            <button
              onClick={handleSendReminder}
              disabled={sendingReminder || student.emailRemindersDisabled}
              className={`px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 transition-colors ${(sendingReminder || student.emailRemindersDisabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {sendingReminder ? 'Sending...' : 'Send Reminder'}
            </button>
          </div>
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Student Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Phone:</span> {student.phoneNumber}
          </div>
          <div>
            <span className="font-medium">Codeforces Handle:</span> {student.codeforcesHandle}
          </div>
          <div>
            <span className="font-medium">Enrollment Date:</span> {formatDate(student.enrollmentDate)}
          </div>
          <div>
            <span className="font-medium">Last Activity:</span> 
            <span className={`ml-2 font-semibold ${inactivityStatus.color}`}>
              {student.lastSubmissionDate ? formatDate(student.lastSubmissionDate) : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Inactivity Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Activity & Reminders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${inactivityStatus.color}`}>
              {inactivityStatus.text}
            </div>
            <div className="text-sm text-gray-600 mt-1">Activity Status</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {student.reminderEmailCount || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Reminders Sent</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <button
              onClick={handleToggleReminders}
              className={`px-4 py-2 rounded font-semibold ${
                student.emailRemindersDisabled 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {student.emailRemindersDisabled ? 'Enable Reminders' : 'Disable Reminders'}
            </button>
            <div className="text-sm text-gray-600 mt-1">Email Reminders</div>
          </div>
        </div>
        {student.lastReminderSent && (
          <div className="mt-4 text-sm text-gray-600">
            Last reminder sent: {formatDate(student.lastReminderSent)}
          </div>
        )}
        {student.emailRemindersDisabled && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Email reminders are currently disabled for this student. 
              Enable them first to send manual reminders.
            </p>
          </div>
        )}
      </div>

      {/* Contest History Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Contest History</h2>
          <select
            value={contestFilter}
            onChange={(e) => setContestFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md"
          >
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
        
        {contestLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : contests.length > 0 ? (
          <div className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareRatingChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Contest</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Old Rating</th>
                    <th className="text-left py-2">New Rating</th>
                    <th className="text-left py-2">Change</th>
                    <th className="text-left py-2">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {contests.map((contest, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2">{contest.contestName}</td>
                      <td className="py-2">{formatDate(contest.contestDate)}</td>
                      <td className="py-2">{contest.oldRating}</td>
                      <td className="py-2">{contest.newRating}</td>
                      <td className={`py-2 ${contest.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                      </td>
                      <td className="py-2">{contest.rank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No contest history available.</p>
        )}
      </div>

      {/* Problem Solving Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Problem Solving</h2>
          <select
            value={problemFilter}
            onChange={(e) => setProblemFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md"
          >
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>

        {problemLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : problems.length > 0 ? (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{statistics.totalProblems}</div>
                <div className="text-sm text-gray-600">Problems Solved</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{statistics.averageRating}</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{statistics.averageProblemsPerDay}</div>
                <div className="text-sm text-gray-600">Problems/Day</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {statistics.mostDifficultProblem?.rating || 0}
                </div>
                <div className="text-sm text-gray-600">Hardest Problem</div>
              </div>
            </div>

            {/* Rating Distribution Chart */}
            {statistics.ratingBuckets && Object.keys(statistics.ratingBuckets).length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareRatingBucketsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Activity Heatmap */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Activity Heatmap</h3>
              <CalendarHeatmap
                startDate={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)}
                endDate={new Date()}
                values={prepareHeatmapData()}
                classForValue={(value) => {
                  if (!value) return 'color-empty';
                  return `color-scale-${Math.min(value.count, 4)}`;
                }}
                titleForValue={(value) => {
                  if (!value) return 'No activity';
                  return `${value.count} problem${value.count === 1 ? '' : 's'} solved on ${value.date}`;
                }}
              />
            </div>

            {/* Problems Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Problem</th>
                    <th className="text-left py-2">Rating</th>
                    <th className="text-left py-2">Tags</th>
                    <th className="text-left py-2">Solved Date</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2">
                        <a
                          href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.problemIndex}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {problem.problemName}
                        </a>
                      </td>
                      <td className="py-2">{problem.rating || 'N/A'}</td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {problem.tags?.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {problem.tags?.length > 3 && (
                            <span className="text-gray-500 text-xs">+{problem.tags.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2">{formatDate(problem.solvedDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No problem solving data available.</p>
        )}
      </div>
    </div>
  );
};

export default StudentProfile; 