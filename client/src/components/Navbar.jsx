import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-black shadow-lg">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
              <img 
                src="/tle-logo.svg" 
                alt="TLE CodePlus Logo" 
                className="h-8 w-auto"
              />
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-bold text-blue-400  tracking-tight">TLE</span>
                <span className="text-2xl font-bold text-white tracking-tight">CodePlus</span>
              </div>
            </Link>
          </div>
          
          {/* Navigation Links Section */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Students
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
        </div>
        
        {/* Mobile Menu */}
        <div className="md:hidden border-t border-gray-800 py-3">
          <div className="flex flex-col space-y-2">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-gray-800 mx-3"
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