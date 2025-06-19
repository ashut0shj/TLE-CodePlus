import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const ContestModal = ({ isOpen, onClose, contests, contestFilter, setContestFilter }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      // Delay unmount for animation
      const timeout = setTimeout(() => setShow(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);
  if (!isOpen && !show) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`fixed inset-0 z-50 p-4 flex items-center justify-center transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black bg-opacity-50 transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>
      <div className={`relative bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-all duration-500 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} style={{zIndex: 10}}>
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
            <div className="rounded-lg border-2 border-blue-300 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
              <div className="h-48">
                {/* Chart will be rendered by parent */}
                {/* You may need to import and use recharts here if needed */}
                {/* ...chart code... */}
                {/* The chart code is omitted for brevity, but should be copied from the original */}
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
          <div className="overflow-x-auto border-2 border-blue-300 rounded-lg shadow-md mt-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
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

export default ContestModal; 