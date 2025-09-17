import React from 'react';

const ProgressBar = ({ current, total, currentFileName, isVisible, isDarkMode = false }) => {
  if (!isVisible) return null;

  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Processing Images
          </h3>
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {current} of {total}
          </span>
        </div>
        
        <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="mt-2">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {percentage.toFixed(1)}% complete
          </p>
          {currentFileName && (
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 truncate`}>
              Processing: {currentFileName}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Generating metadata with AI...
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
