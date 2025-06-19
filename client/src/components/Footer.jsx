import React from 'react';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-black text-gray-300 border-t border-gray-700/50 mt-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(59,130,246,0.05)_50%,transparent_100%)] pointer-events-none" />
      
      <div className="relative w-full flex flex-col md:flex-row items-center justify-between px-6 py-6 gap-6">
        {/* Left: Enhanced Logo and Project Name */}
        <div className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300" />
            <div className="relative bg-black rounded-lg p-1.5 border border-gray-700">
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

        {/* Center: Enhanced Info with Animation */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="relative">
              © {new Date().getFullYear()} Ashutosh Jaiswal
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300" />
            </span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="text-gray-500">All rights reserved</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Actively maintained
            </span>
          </div>
        </div>

        {/* Right: Enhanced GitHub Link with Social Links */}
        <div className="flex items-center gap-4">
          {/* GitHub Link */}
          <a
            href="https://github.com/ashut0shj/TLE-CodePlus"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600 rounded-lg transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <svg className="relative w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.262.82-.582 0-.288-.01-1.05-.016-2.06-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.334-5.466-5.933 0-1.31.468-2.382 1.236-3.222-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.912 1.235 3.222 0 4.61-2.803 5.625-5.475 5.922.43.372.823 1.104.823 2.225 0 1.606-.015 2.898-.015 3.293 0 .322.216.699.825.58C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="relative text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              View Source
            </span>
          </a>

          {/* Star Button */}
          <button className="group relative flex items-center gap-1 px-3 py-2 bg-gray-800/50 hover:bg-yellow-500/10 border border-gray-700 hover:border-yellow-500/50 rounded-lg transition-all duration-300 hover:scale-105">
            <svg className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xs text-gray-400 group-hover:text-yellow-400 transition-colors font-medium">
              Star
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </footer>
  );
};

export default Footer;