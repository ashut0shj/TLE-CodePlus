import React from 'react';

const StudentTableHeader = ({ sortConfig, handleSort }) => (
  <tr className="bg-slate-50 border-b-2 border-blue-200">
    <th onClick={() => handleSort('name')} className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase cursor-pointer select-none">
      Name ⥯{sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
    </th>
    <th className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase">Email</th>
    <th className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase">Phone</th>
    <th className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase">Handle</th>
    <th className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase">Last Sync</th>
    <th onClick={() => handleSort('currentRating')} className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase cursor-pointer select-none">Current ⥯ {sortConfig.key === 'currentRating' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
    <th onClick={() => handleSort('maxRating')} className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide border-r border-blue-100 last:border-r-0 uppercase cursor-pointer select-none">Max ⥯ {sortConfig.key === 'maxRating' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
    <th className="px-5 py-3 text-left text-base font-bold text-blue-900 tracking-wide uppercase">Actions</th>
  </tr>
);

export default StudentTableHeader; 