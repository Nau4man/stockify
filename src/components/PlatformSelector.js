import React from 'react';
import { getAvailablePlatforms, getPlatformConfig } from '../utils/platformConfig';

const PlatformSelector = ({ selectedPlatform, onPlatformChange, disabled = false, isDarkMode = false }) => {
  const platforms = getAvailablePlatforms();
  const selectedPlatformConfig = getPlatformConfig(selectedPlatform);

  return (
    <div className="mb-6">
      <label htmlFor="platform-select" className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
        🎯 Target Platform
      </label>
      
      <div className="relative group">
        <select
          id="platform-select"
          value={selectedPlatform}
          onChange={(e) => onPlatformChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full px-5 py-4 pr-12 rounded-2xl border-2 transition-all duration-300 ease-in-out
            ${isDarkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 text-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 hover:border-gray-500' 
              : 'bg-gradient-to-r from-white to-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:scale-[1.02]'}
            shadow-lg backdrop-blur-sm
            font-medium text-base
          `}
        >
          {platforms.map((platform) => (
            <option key={platform.id} value={platform.id} className="py-2">
              {platform.name} - {platform.description}
            </option>
          ))}
        </select>
        
        {/* Enhanced dropdown arrow with animation */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'} group-hover:bg-opacity-80 transition-all duration-200`}>
            <svg 
              className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-transform duration-200 group-hover:rotate-180`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* Subtle glow effect */}
        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isDarkMode ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : 'bg-gradient-to-r from-blue-500/5 to-purple-500/5'
        }`}></div>
      </div>
      
      {/* Platform-specific information */}
      <div className={`mt-4 p-5 ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} border-2 rounded-2xl shadow-lg backdrop-blur-sm`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              {selectedPlatformConfig.name} Format
            </h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3 leading-relaxed`}>
              {selectedPlatformConfig.description}
            </p>
            
            {/* CSV Headers */}
            <div className="mt-3">
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                📋 CSV Headers:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedPlatformConfig.csvHeaders.map((header, index) => (
                  <span 
                    key={index}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 border border-gray-500 hover:from-gray-600 hover:to-gray-500' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-300 hover:from-gray-200 hover:to-gray-100'
                    }`}
                  >
                    {header}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Platform-specific requirements */}
            {selectedPlatform === 'adobe_stock' && (
              <div className={`mt-4 p-4 ${isDarkMode ? 'bg-gradient-to-r from-amber-900/30 to-orange-900/20 border-amber-600' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'} border-2 rounded-xl shadow-md`}>
                <div className="flex items-start">
                  <div className={`w-8 h-8 ${isDarkMode ? 'bg-amber-600' : 'bg-amber-500'} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-amber-200' : 'text-amber-800'} mb-2`}>
                      🎨 Adobe Stock Requirements:
                    </p>
                    <ul className={`text-sm ${isDarkMode ? 'text-amber-100' : 'text-amber-700'} space-y-1.5`}>
                      <li className="flex items-center"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>Title: Max 200 characters</li>
                      <li className="flex items-center"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>Keywords: Max 49 keywords</li>
                      <li className="flex items-center"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>Category: Numeric code (1-21)</li>
                      <li className="flex items-center"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>All fields except Filename are optional</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {selectedPlatform === 'shutterstock' && (
              <div className={`mt-4 p-4 ${isDarkMode ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border-blue-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300'} border-2 rounded-xl shadow-md`}>
                <div className="flex items-start">
                  <div className={`w-8 h-8 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'} mb-2`}>
                      📸 Shutterstock Requirements:
                    </p>
                    <ul className={`text-sm ${isDarkMode ? 'text-blue-100' : 'text-blue-700'} space-y-1.5`}>
                      <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>Description: 6-12 words</li>
                      <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>Keywords: 7-50 keywords</li>
                      <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>Categories: 1-2 from official list</li>
                      <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>Editorial: Yes/No based on content</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformSelector;
