import React from 'react';

const StudentTableStats = ({ filteredStudents }) => (
  <div className="flex gap-4 mb-2">
    <div className="text-center">
      <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{filteredStudents.length}</div>
      <div className="text-sm text-slate-600 dark:text-slate-400">Total</div>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-red-500 dark:text-red-400">
        {filteredStudents.filter(student => {
          if (!student.lastSubmissionDate) return true;
          const now = new Date();
          const last = new Date(student.lastSubmissionDate);
          const days = Math.floor((now - last) / (1000 * 60 * 60 * 24));
          return days > 7;
        }).length}
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400">Inactive 7d+</div>
    </div>
  </div>
);

export default StudentTableStats; 