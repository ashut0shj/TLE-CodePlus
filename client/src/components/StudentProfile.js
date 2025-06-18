import React, { useState, useEffect } from 'react';
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

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  useEffect(() => {
    if (student) {
      fetchContestHistory();
      fetchProblemData();
    }
  }, [student, contestFilter, problemFilter]);

  const fetchStudentData = async () => {
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
  };

  const fetchContestHistory = async () => {
    try {
      setContestLoading(true);
      const response = await axios.get(`${API_BASE_URL}/students/${id}/contests?days=${contestFilter}`);
      setContests(response.data);
    } catch (err) {
      console.error('Error fetching contest history:', err);
    } finally {
      setContestLoading(false);
    }
  };

  const fetchProblemData = async () => {
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
  };

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
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Codeforces Data'}
          </button>
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
        </div>
      </div>

      {/* Contest History Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Contest History</h2>
          <select
            value={contestFilter}
            onChange={(e) => setContestFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last 365 days</option>
          </select>
        </div>

        {/* Rating Chart */}
        {contests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Rating Progress</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareRatingChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rating" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Contest List */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Contests</h3>
          {contestLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : contests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Contest</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Rank</th>
                    <th className="px-4 py-2 text-left">Rating Change</th>
                    <th className="px-4 py-2 text-left">Problems Solved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contests.map((contest) => (
                    <tr key={contest._id}>
                      <td className="px-4 py-2">{contest.contestName}</td>
                      <td className="px-4 py-2">{formatDate(contest.contestDate)}</td>
                      <td className="px-4 py-2">{contest.rank}</td>
                      <td className={`px-4 py-2 ${contest.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                      </td>
                      <td className="px-4 py-2">{contest.problemsSolved}/{contest.totalProblems}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No contests found in the selected period.</p>
          )}
        </div>
      </div>

      {/* Problem Solving Data Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Problem Solving Data</h2>
          <select
            value={problemFilter}
            onChange={(e) => setProblemFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{statistics.totalProblems || 0}</div>
            <div className="text-sm text-gray-600">Total Problems</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{statistics.averageRating || 0}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{statistics.averageProblemsPerDay || 0}</div>
            <div className="text-sm text-gray-600">Problems/Day</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {statistics.mostDifficultProblem?.rating || 0}
            </div>
            <div className="text-sm text-gray-600">Hardest Problem</div>
          </div>
        </div>

        {/* Rating Buckets Chart */}
        {statistics.ratingBuckets && Object.keys(statistics.ratingBuckets).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Problems by Rating</h3>
            {problemLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareRatingBucketsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Heatmap */}
        {problems.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Submission Heatmap</h3>
            {problemLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <CalendarHeatmap
                  startDate={new Date(Date.now() - problemFilter * 24 * 60 * 60 * 1000)}
                  endDate={new Date()}
                  values={prepareHeatmapData()}
                  classForValue={(value) => {
                    if (!value) return 'color-empty';
                    return `color-scale-${Math.min(value.count, 4)}`;
                  }}
                  titleForValue={(value) => {
                    if (!value) return 'No submissions';
                    return `${value.count} problem(s) solved on ${value.date}`;
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile; 