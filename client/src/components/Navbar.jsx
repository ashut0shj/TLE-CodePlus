import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-slate-800 tracking-tight">TLE</span>
            <span className="text-lg font-semibold text-blue-600 tracking-tight">CodePlus</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-slate-700 hover:text-blue-600 font-medium transition-all duration-200">
              Students
            </Link>
            <Link to="/inactivity" className="text-slate-700 hover:text-blue-600 font-medium transition-all duration-200">
              Inactivity
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 