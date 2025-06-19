import React, { useContext } from 'react';
// import { Link } from 'react-router-dom'; // Removed unused import
import { ThemeContext } from '../App.jsx';

const Navbar = () => {
  const { dark, setDark } = useContext(ThemeContext);

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 shadow-lg border-b border-gray-800">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-gray-900 rounded-lg p-1.5 border border-gray-700">
                <img src="/tle-logo.svg" alt="TLE CodePlus Logo" className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent tracking-tight">
                TLE
              </span>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent tracking-tight">
                CodePlus
              </span>
            </div>
          </div>

          {/* Dark mode toggle switch */}
          <div className="flex items-center ml-auto">
            <button
              aria-label="Toggle dark mode"
              className="relative flex items-center focus:outline-none group"
              onClick={() => setDark((d) => !d)}
            >
              <span className="text-2xl mr-2 select-none">
                {dark ? '🌙' : '☀️'}
              </span>
              <span className="w-10 h-6 flex items-center bg-gray-700 rounded-full p-1 transition-colors duration-300">
                <span
                  className={`w-4 h-4 bg-gray-900 rounded-full shadow-md transform transition-transform duration-300 ${dark ? 'translate-x-4' : ''}`}
                />
              </span>
            </button>
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
      </div>
    </nav>
  );
};

export default Navbar;