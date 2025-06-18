import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TLE</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">CodePlus</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Students
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 