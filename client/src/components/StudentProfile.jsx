import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

// Modal Component for Contest History
const ContestModal = ({ isOpen, onClose, contests, contestFilter, setContestFilter }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Contest History</h2>
            <p className="text-gray-600 text-sm mt-1">{contests.length} contests participated</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={contestFilter}
              onChange={(e) => setContestFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={contests.map(contest => ({
                    date: formatDate(contest.contestDate),
                    rating: contest.newRating,
                    oldRating: contest.oldRating
                  }))}>
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
                    <Line type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Old Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contests.map((contest, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{contest.contestName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(contest.contestDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contest.oldRating}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{contest.newRating}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${contest.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>{contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contest.rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Component for Problem Solving
const ProblemModal = ({ isOpen, onClose, problems, statistics, problemFilter, setProblemFilter }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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

  const prepareRatingBucketsData = () => {
    if (!statistics.ratingBuckets) return [];
    return Object.entries(statistics.ratingBuckets).map(([bucket, count]) => ({
      bucket,
      count
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Problem Solving Activity</h2>
            <p className="text-gray-600 text-sm mt-1">{problems.length} problems solved recently</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={problemFilter}
              onChange={(e) => setProblemFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Statistics Overview and Bar Graph Row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left: Problem Stats Card */}
            <div className="md:w-1/3 p-0">
              <div className="border-2 border-gray-200 rounded-lg bg-blue-50 p-6 h-full shadow-sm">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Problem Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Solved:</span>
                    <span className="text-xl font-bold text-blue-600">{statistics.totalProblems || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Avg Rating:</span>
                    <span className="text-lg font-semibold text-gray-900">{statistics.averageRating || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Per Day:</span>
                    <span className="text-lg font-semibold text-gray-900">{statistics.averageProblemsPerDay || 0}</span>
                  </div>
                  {statistics.mostDifficultProblem && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="flex items-center gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                        </svg>
                        <span className="font-semibold">Hardest Problem:</span>
                        <a
                          href={`https://codeforces.com/problemset/problem/${statistics.mostDifficultProblem.contestId}/${statistics.mostDifficultProblem.problemIndex}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-900 font-medium truncate max-w-[120px]"
                          title={statistics.mostDifficultProblem.problemName}
                        >
                          {statistics.mostDifficultProblem.problemName}
                        </a>
                      </span>
                      <span className="text-lg font-bold text-amber-700 ml-4">{statistics.mostDifficultProblem.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Right: Bar Graph */}
            <div className="md:w-2/3 p-0 flex items-center justify-center">
              <div className="border-2 border-gray-200 rounded-lg bg-gray-50 p-6 w-full h-full flex items-center justify-center shadow-sm">
                {statistics.ratingBuckets && Object.keys(statistics.ratingBuckets).length > 0 ? (
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareRatingBucketsData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="bucket" 
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                          angle={-45}
                          textAnchor="end"
                          height={50}
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
                ) : (
                  <div className="text-gray-400 text-center w-full">No rating distribution data</div>
                )}
              </div>
            </div>
          </div>
          {/* Problems Table */}
          <div className="overflow-x-auto border-2 border-gray-200 rounded-lg shadow-sm mt-4">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solved Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {problems.map((problem, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <a
                        href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.problemIndex}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                      >
                        {problem.problemName}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${problem.rating ? getRatingColor(problem.rating) : 'text-gray-500'}`}>{problem.rating || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {problem.tags?.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{tag}</span>
                        ))}
                        {problem.tags?.length > 3 && (
                          <span className="text-gray-500 text-xs px-2 py-1">+{problem.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(problem.solvedDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [showContestModal, setShowContestModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Left: Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Link 
                    to="/" 
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1 truncate">{student.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mb-2">
                  <span>{student.email}</span>
                  <span className="hidden md:inline">|</span>
                  <span>Phone: <span className="font-medium text-gray-800">{student.phoneNumber}</span></span>
                  <span className="hidden md:inline">|</span>
                  <span>CF: <span className="font-mono text-blue-600 font-medium">{student.codeforcesHandle}</span></span>
                  <span className="hidden md:inline">|</span>
                  <span>Enrolled: <span className="font-medium text-gray-800">{formatDate(student.enrollmentDate)}</span></span>
                </div>
                {/* Ratings moved here */}
                <div className="flex items-center gap-8 mt-2 mb-2">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getRatingColor(student.currentRating)} mb-1`}>{student.currentRating}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Current</div>
                    <div className={`text-sm font-medium ${getRatingColor(student.maxRating)} mt-1`}>Max: {student.maxRating}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Last Activity:</span>
                      <span className={`text-xs font-medium ${inactivityStatus.color}`}>{student.lastSubmissionDate ? formatDate(student.lastSubmissionDate) : 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Data Updated:</span>
                      <span className={`text-xs font-medium ${student.lastDataSync ? 'text-green-600' : 'text-red-600'}`}>{formatDataFreshness(student.lastDataSync)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right: Status, Actions, Hardest Problem */}
              <div className="flex flex-col items-end gap-4 min-w-[220px]">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 text-sm font-medium flex items-center gap-2 ${refreshing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                  >
                    <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                  <button
                    onClick={handleSendReminder}
                    disabled={sendingReminder || student.emailRemindersDisabled}
                    className={`px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-all duration-200 text-sm font-medium flex items-center gap-2 ${(sendingReminder || student.emailRemindersDisabled) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {sendingReminder ? 'Sending...' : 'Send Reminder'}
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className={`text-xs font-semibold px-2 py-1 rounded ${inactivityStatus.color === 'text-green-600' ? 'bg-green-100 text-green-700' : inactivityStatus.color === 'text-amber-600' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{inactivityStatus.text}</div>
                  <div className="text-xs text-blue-700 font-semibold px-2 py-1 bg-blue-50 rounded">Reminders: {student.reminderEmailCount || 0}</div>
                  <button
                    onClick={handleToggleReminders}
                    className={`text-xs px-2 py-1 rounded font-medium transition-all duration-200 ${student.emailRemindersDisabled ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                  >
                    {student.emailRemindersDisabled ? 'Enable Reminders' : 'Disable Reminders'}
                  </button>
                </div>
                {student.lastReminderSent && (
                  <div className="text-xs text-gray-500 mt-1">Last Reminder: {formatDate(student.lastReminderSent)}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contest History Section */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Contest History</h2>
                <p className="text-gray-600 text-sm mt-1">{contests.length} contests participated</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={contestFilter}
                  onChange={(e) => setContestFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={365}>Last year</option>
                </select>
                <button
                  onClick={() => setShowContestModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View All Contests
                </button>
              </div>
            </div>
          </div>
          {contestLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : contests.length > 0 ? (
            <div>
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm">
                  <div className="h-48">
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
                        <Line type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500">No contest history available</p>
            </div>
          )}
        </div>

        {/* Problem Solving Section */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Problem Solving Activity</h2>
                <p className="text-gray-600 text-sm mt-1">{problems.length} problems solved recently</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={problemFilter}
                  onChange={(e) => setProblemFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={365}>Last year</option>
                </select>
                <button
                  onClick={() => setShowProblemModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View All Problems
                </button>
              </div>
            </div>
          </div>
          {problemLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : problems.length > 0 ? (
            <div>
              {/* Statistics Overview and Bar Graph Row */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Left: Problem Stats Card */}
                <div className="md:w-1/3 p-0">
                  <div className="border-2 border-gray-200 rounded-lg bg-blue-50 p-6 h-full shadow-sm">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Problem Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total Solved:</span>
                        <span className="text-xl font-bold text-blue-600">{statistics.totalProblems || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Avg Rating:</span>
                        <span className="text-lg font-semibold text-gray-900">{statistics.averageRating || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Per Day:</span>
                        <span className="text-lg font-semibold text-gray-900">{statistics.averageProblemsPerDay || 0}</span>
                      </div>
                      {statistics.mostDifficultProblem && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="flex items-center gap-2 text-gray-700">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                            </svg>
                            <span className="font-semibold">Hardest Problem:</span>
                            <a
                              href={`https://codeforces.com/problemset/problem/${statistics.mostDifficultProblem.contestId}/${statistics.mostDifficultProblem.problemIndex}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:text-blue-900 font-medium truncate max-w-[120px]"
                              title={statistics.mostDifficultProblem.problemName}
                            >
                              {statistics.mostDifficultProblem.problemName}
                            </a>
                          </span>
                          <span className="text-lg font-bold text-amber-700 ml-4">{statistics.mostDifficultProblem.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Right: Bar Graph */}
                <div className="md:w-2/3 p-0 flex items-center justify-center">
                  <div className="border-2 border-gray-200 rounded-lg bg-gray-50 p-6 w-full h-full flex items-center justify-center shadow-sm">
                    {statistics.ratingBuckets && Object.keys(statistics.ratingBuckets).length > 0 ? (
                      <div className="w-full h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={prepareRatingBucketsData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="bucket" 
                              tick={{ fontSize: 11, fill: '#6b7280' }}
                              angle={-45}
                              textAnchor="end"
                              height={50}
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
                    ) : (
                      <div className="text-gray-400 text-center w-full">No rating distribution data</div>
                    )}
                  </div>
                </div>
              </div>
              {/* Heatmap - Smallest with Legend */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="border-2 border-gray-200 rounded-lg bg-white p-2 flex items-center shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Activity Heatmap ({new Date().getFullYear()})</h3>
                  {heatmapLoading ? (
                    <div className="flex justify-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  ) : heatmapData.length > 0 ? (
                    <div className="w-full flex justify-center">
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
                        style={{ width: '100%', maxWidth: 700, height: 80 }}
                      />
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-1 text-sm">No activity data available</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">No problem solving data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ContestModal 
        isOpen={showContestModal}
        onClose={() => setShowContestModal(false)}
        contests={contests}
        contestFilter={contestFilter}
        setContestFilter={setContestFilter}
      />
      
      <ProblemModal 
        isOpen={showProblemModal}
        onClose={() => setShowProblemModal(false)}
        problems={problems}
        statistics={statistics}
        problemFilter={problemFilter}
        setProblemFilter={setProblemFilter}
      />
    </div>
  );
};

export default StudentProfile; 