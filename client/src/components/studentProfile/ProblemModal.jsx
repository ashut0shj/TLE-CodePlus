import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const ProblemModal = ({ isOpen, onClose, problems, statistics, problemFilter, setProblemFilter }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);
  if (!isOpen && !show) return null;

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
    <div className={`fixed inset-0 z-50 p-4 flex items-center justify-center transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black bg-opacity-50 transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>
      <div className={`relative bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-all duration-500 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} style={{zIndex: 10}}>
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
              <div className="border-2 border-blue-300 rounded-lg bg-blue-50 p-6 h-full shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
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
              <div className="border-2 border-blue-300 rounded-lg bg-gray-50 p-6 w-full h-full flex items-center justify-center shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
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
          <div className="overflow-x-auto border-2 border-blue-300 rounded-lg shadow-md mt-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
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

export default ProblemModal; 