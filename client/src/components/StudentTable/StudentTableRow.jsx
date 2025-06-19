import React from 'react';
import { Link } from 'react-router-dom';

const getRatingColor = (rating) => {
  if (rating >= 2400) return 'text-red-600 dark:text-red-400 font-semibold';
  if (rating >= 2100) return 'text-amber-600 dark:text-amber-400 font-semibold';
  if (rating >= 1900) return 'text-purple-600 dark:text-purple-400 font-semibold';
  if (rating >= 1600) return 'text-blue-600 dark:text-blue-400 font-semibold';
  if (rating >= 1400) return 'text-cyan-600 dark:text-cyan-400 font-semibold';
  if (rating >= 1200) return 'text-green-600 dark:text-green-400 font-semibold';
  return 'text-slate-600 dark:text-slate-300';
};

const StudentTableRow = ({ student, rowClass, handleEditStudent, handleDeleteStudent }) => (
  <tr className={`${rowClass} border-b border-gray-300 dark:border-gray-700 hover:shadow-sm hover:scale-[1.01] transition-all duration-150`}>
    <td className="px-5 py-3 border-r border-gray-100 dark:border-gray-800">
      <div className="font-medium text-slate-800 dark:text-slate-200">{student.name}</div>
    </td>
    <td className="px-5 py-3 border-r border-gray-100 dark:border-gray-800">
      <div className="text-slate-600 dark:text-slate-300">{student.email}</div>
    </td>
    <td className="px-5 py-3 border-r border-gray-100 dark:border-gray-800">
      <div className="text-slate-600 dark:text-slate-300">{student.phoneNumber}</div>
    </td>
    <td className="px-5 py-3 border-r border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <a
          href={`https://codeforces.com/profile/${student.codeforcesHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-blue-600 dark:text-blue-400 hover:underline"
        >
          {student.codeforcesHandle}
        </a>
      </div>
    </td>
    <td className="px-5 py-3 border-r border-gray-100 dark:border-gray-800">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {student.lastDataSync ? new Date(student.lastDataSync).toLocaleDateString() : 'Never'}
      </span>
    </td>
    <td className="px-5 py-3 border-r border-gray-100 dark:border-gray-800">
      <span className={`font-mono ${getRatingColor(student.currentRating)}`}>{student.currentRating}</span>
    </td>
    <td className="px-5 py-3 border-r border-gray-100 dark:border-gray-800">
      <span className={`font-mono ${getRatingColor(student.maxRating)}`}>{student.maxRating}</span>
    </td>
    <td className="px-5 py-3">
      <div className="flex gap-2">
        <Link
          to={`/student/${student._id}`}
          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-full hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
        >
          View
        </Link>
        <button
          onClick={() => handleEditStudent(student)}
          className="px-3 py-1 text-xs font-medium text-white bg-gray-600 dark:bg-gray-700 rounded-full hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteStudent(student._id)}
          className="px-3 py-1 text-xs font-medium text-white bg-red-600 dark:bg-red-700 rounded-full hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200"
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

export default StudentTableRow; 