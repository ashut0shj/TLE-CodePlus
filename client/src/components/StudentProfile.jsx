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
  const [heatmapData, setHeatmapData] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [showAllContests, setShowAllContests] = useState(false);
  const [showAllProblems, setShowAllProblems] = useState(false);

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

  const fetchHeatmapData = useCallback(async () => {
    try {
      setHeatmapLoading(true);
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const daysFromStartOfYear = Math.ceil((new Date() - startOfYear) / (1000 * 60 * 60 * 24));
      
      const response = await axios.get(`${API_BASE_URL}/students/${id}/heatmap?days=${daysFromStartOfYear}`);
      setHeatmapData(response.data);
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
    } finally {
      setHeatmapLoading(false);
    }
  }, [id, API_BASE_URL]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  useEffect(() => {
    if (student) {
      fetchContestHistory();
      fetchProblemData();
      fetchHeatmapData();
    }
  }, [student, fetchContestHistory, fetchProblemData, fetchHeatmapData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await axios.post(`${API_BASE_URL}/students/${id}/refresh`);
      await fetchStudentData();
      await fetchContestHistory();
      await fetchProblemData();
      await fetchHeatmapData();
      alert('Codeforces data refreshed successfully!');
    } catch (err) {
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
      await fetchStudentData();
      alert(`Email reminders ${!student.emailRemindersDisabled ? 'disabled' : 'enabled'} successfully!`);
    } catch (err) {
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
        await axios.post(`${API_BASE_URL}/students/${id}/send-reminder`);
        alert(`Reminder sent successfully to ${student.name}!`);
        await fetchStudentData();
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to send reminder email';
        alert(`Error: ${errorMessage}`);
      } finally {
        setSendingReminder(false);
      }
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 2400) return 'text-red-600 font-bold';
    if (rating >= 2100) return 'text-amber-600 font-bold';
    if (rating >= 1900) return 'text-purple-600 font-bold';
    if (rating >= 1600) return 'text-blue-600 font-bold';
    if (rating >= 1400) return 'text-cyan-600 font-bold';
    if (rating >= 1200) return 'text-green-600 font-bold';
    return 'text-slate-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDataFreshness = (lastDataSync) => {
    if (!lastDataSync) return 'Never';
    const now = new Date();
    const lastSync = new Date(lastDataSync);
    const diffInHours = Math.floor((now - lastSync) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return formatDate(lastDataSync);
  };

  const getInactivityStatus = (lastSubmissionDate) => {
    if (!lastSubmissionDate) return { status: 'unknown', color: 'text-slate-500', text: 'Unknown' };
    
    const daysSinceLastSubmission = Math.floor((new Date() - new Date(lastSubmissionDate)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastSubmission <= 7) {
      return { status: 'active', color: 'text-green-600', text: 'Active' };
    } else if (daysSinceLastSubmission <= 14) {
      return { status: 'warning', color: 'text-amber-600', text: `${daysSinceLastSubmission}d inactive` };
    } else {
      return { status: 'inactive', color: 'text-red-600', text: `${daysSinceLastSubmission}d inactive` };
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
    return heatmapData;
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
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              ← Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-600 text-sm">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-3xl font-bold ${getRatingColor(student.currentRating)}`}>
                {student.currentRating}
              </div>
              <div className="text-xs text-gray-500">Current Rating</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={handleSendReminder}
                disabled={sendingReminder || student.emailRemindersDisabled}
                className={`px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors text-sm font-medium ${(sendingReminder || student.emailRemindersDisabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {sendingReminder ? 'Sending...' : 'Remind'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Student Info & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Student Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-medium text-gray-700">Phone:</span> 
              <span className="text-gray-600">{student.phoneNumber}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-medium text-gray-700">CF Handle:</span> 
              <span className="text-blue-600 font-mono">{student.codeforcesHandle}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-medium text-gray-700">Enrollment:</span> 
              <span className="text-gray-600">{formatDate(student.enrollmentDate)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-medium text-gray-700">Last Activity:</span> 
              <span className={`font-semibold ${inactivityStatus.color}`}>
                {student.lastSubmissionDate ? formatDate(student.lastSubmissionDate) : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-medium text-gray-700">Data Updated:</span> 
              <span className={`font-semibold ${student.lastDataSync ? 'text-green-600' : 'text-red-600'}`}>
                {formatDataFreshness(student.lastDataSync)}
              </span>
            </div>
          </div>
        </div>

        {/* Activity & Reminders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Activity & Reminders</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className={`font-semibold ${inactivityStatus.color}`}>
                {inactivityStatus.text}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Reminders Sent:</span>
              <span className="font-semibold text-blue-600">
                {student.reminderEmailCount || 0}
              </span>
            </div>
            <button
              onClick={handleToggleReminders}
              className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                student.emailRemindersDisabled 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {student.emailRemindersDisabled ? 'Enable Reminders' : 'Disable Reminders'}
            </button>
            {student.lastReminderSent && (
              <div className="text-xs text-gray-600 text-center">
                Last: {formatDate(student.lastReminderSent)}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats & Hardest Problem */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Stats</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-700">Contests:</span>
              <span className="font-semibold text-gray-900">{contests.length}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-700">Problems Solved:</span>
              <span className="font-semibold text-gray-900">{statistics.totalProblems || 0}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-700">Avg Rating:</span>
              <span className="font-semibold text-gray-900">{statistics.averageRating || 0}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-700">Problems/Day:</span>
              <span className="font-semibold text-gray-900">{statistics.averageProblemsPerDay || 0}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-gray-700">Max Rating:</span>
              <span className={`font-semibold ${getRatingColor(student.maxRating)}`}>
                {student.maxRating}
              </span>
            </div>
          </div>
          
          {/* Hardest Problem Section */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">🏆 Hardest Problem</h3>
            {statistics.mostDifficultProblem ? (
              <div className="space-y-2">
                <a
                  href={`https://codeforces.com/problemset/problem/${statistics.mostDifficultProblem.contestId}/${statistics.mostDifficultProblem.problemIndex}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm block truncate"
                  title={statistics.mostDifficultProblem.problemName}
                >
                  {statistics.mostDifficultProblem.problemName}
                </a>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <span className="text-lg font-bold text-amber-600">
                    {statistics.mostDifficultProblem.rating}
                  </span>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {formatDate(statistics.mostDifficultProblem.solvedDate)}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-2">
                <div className="text-sm">No problems solved yet</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contest History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Contest History</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">({contests.length} contests)</span>
          </div>
          <select
            value={contestFilter}
            onChange={(e) => setContestFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="space-y-6">
            {/* Compact Rating Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareRatingChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Contest Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contest</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Old</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contests.slice(0, showAllContests ? contests.length : 5).map((contest, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{contest.contestName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(contest.contestDate)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{contest.oldRating}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{contest.newRating}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${contest.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{contest.rank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* View All Button - Under Table */}
            {contests.length > 5 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAllContests(!showAllContests)}
                  className="px-6 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  {showAllContests ? `Show Less (5 of ${contests.length})` : `View All (${contests.length} contests)`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No contest history available.</p>
        )}
      </div>

      {/* Problem Solving */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Problem Solving</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">({problems.length} problems)</span>
          </div>
          <select
            value={problemFilter}
            onChange={(e) => setProblemFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          Showing data for the last <span className="font-semibold">{problemFilter} days</span>
          {problems.length > 0 && (
            <span> • <span className="font-semibold">{problems.length} problems</span> solved</span>
          )}
        </div>

        {problemLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : problems.length > 0 ? (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{statistics.totalProblems}</div>
                <div className="text-sm text-blue-800">Problems Solved</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-2xl font-bold text-green-600">{statistics.averageRating}</div>
                <div className="text-sm text-green-800">Avg Rating</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{statistics.averageProblemsPerDay}</div>
                <div className="text-sm text-purple-800">Problems/Day</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-2xl font-bold text-amber-600">
                  {statistics.mostDifficultProblem?.rating || 0}
                </div>
                <div className="text-sm text-amber-800">Hardest Problem</div>
              </div>
            </div>

            {/* Rating Distribution Chart */}
            {statistics.ratingBuckets && Object.keys(statistics.ratingBuckets).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rating Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareRatingBucketsData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="bucket" 
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Tooltip 
                        formatter={(value, name) => [value, 'Problems']}
                        labelFormatter={(label) => `Rating ${label}`}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Activity Heatmap */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Activity Heatmap ({new Date().getFullYear()})
              </h3>
              {heatmapLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : heatmapData.length > 0 ? (
                <CalendarHeatmap
                  startDate={new Date(new Date().getFullYear(), 0, 1)}
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
              ) : (
                <p className="text-gray-500 text-center py-8">No activity data available.</p>
              )}
            </div>

            {/* Problems Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solved</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {problems.slice(0, showAllProblems ? problems.length : 10).map((problem, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <a
                          href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.problemIndex}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          {problem.problemName}
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{problem.rating || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {problem.tags?.slice(0, 2).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {problem.tags?.length > 2 && (
                            <span className="text-gray-500 text-xs">+{problem.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(problem.solvedDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* View All Button - Under Table */}
            {problems.length > 10 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAllProblems(!showAllProblems)}
                  className="px-6 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  {showAllProblems ? `Show Less (10 of ${problems.length})` : `View All (${problems.length} problems)`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No problem solving data available.</p>
        )}
      </div>
    </div>
  );
};

export default StudentProfile; 