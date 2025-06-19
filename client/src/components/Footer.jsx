import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800 mt-8">
      <div className="w-full flex flex-col md:flex-row items-center justify-between px-6 py-5 gap-4">
        {/* Left: Logo and Project Name */}
        <div className="flex items-center space-x-2">
          <img src="/tle-logo.svg" alt="TLE CodePlus Logo" className="h-7 w-7" />
          <span className="text-xl font-bold text-blue-400 tracking-tight">TLE</span>
          <span className="text-xl font-bold text-white tracking-tight">CodePlus</span>
        </div>
        {/* Center: Extra Info */}
        <div className="flex flex-col items-center text-xs text-gray-400 gap-1">
          <span>© {new Date().getFullYear()} Ashutosh Jaiswal. All rights reserved.</span>
        </div>
        {/* Right: GitHub Link */}
        <a
          href="https://github.com/ashut0shj/TLE-CodePlus"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-300 hover:text-blue-400 transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.262.82-.582 0-.288-.01-1.05-.016-2.06-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.334-5.466-5.933 0-1.31.468-2.382 1.236-3.222-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.912 1.235 3.222 0 4.61-2.803 5.625-5.475 5.922.43.372.823 1.104.823 2.225 0 1.606-.015 2.898-.015 3.293 0 .322.216.699.825.58C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>GitHub</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer; 