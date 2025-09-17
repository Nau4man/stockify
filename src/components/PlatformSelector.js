import React, { useState } from 'react';
import { getAvailablePlatforms, getPlatformConfig } from '../utils/platformConfig';

const PlatformSelector = ({ selectedPlatform, onPlatformChange, disabled = false, isDarkMode = false }) => {
  const platforms = getAvailablePlatforms();
  const selectedPlatformConfig = getPlatformConfig(selectedPlatform);
  const [isOpen, setIsOpen] = useState(false);

  const handlePlatformSelect = (platformId) => {
    onPlatformChange(platformId);
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      <label className={`block text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        Target Platform
      </label>
      
      <div className="relative">
        {/* Custom Dropdown Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-6 py-4 pr-14 rounded-2xl border-2 transition-all duration-300 ease-in-out
            ${isDarkMode 
              ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-gray-600 text-white hover:border-blue-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 hover:shadow-xl hover:shadow-blue-500/10' 
              : 'bg-gradient-to-r from-white via-gray-50 to-white border-gray-300 text-gray-900 hover:border-blue-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:shadow-xl hover:shadow-blue-500/10'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}
            shadow-lg backdrop-blur-sm
            font-semibold text-base
            flex items-center justify-between
            group
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'} transition-all duration-200 group-hover:scale-110`}>
              {selectedPlatform === 'shutterstock' ? (
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                    {/* Shutterstock Official Logo */}
                    <rect width="24" height="24" rx="3" fill="#0084FF"/>
                    <path d="M6 6h12v12H6V6zm1.5 1.5v9h9v-9h-9z" fill="white"/>
                    <path d="M8.5 8.5h7v7h-7v-7zm1.5 1.5v4h4v-4h-4z" fill="#0084FF"/>
                    <circle cx="7.5" cy="7.5" r="0.5" fill="white"/>
                    <circle cx="16.5" cy="7.5" r="0.5" fill="white"/>
                    <circle cx="7.5" cy="16.5" r="0.5" fill="white"/>
                    <circle cx="16.5" cy="16.5" r="0.5" fill="white"/>
                    <text x="12" y="13" textAnchor="middle" fontSize="3" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold">SS</text>
                  </svg>
                </div>
              ) : selectedPlatform === 'adobe_stock' ? (
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                    {/* Adobe Stock Official Logo */}
                    <rect width="24" height="24" rx="3" fill="#FF0000"/>
                    <path d="M6 6h12v12H6V6zm1.5 1.5v9h9v-9h-9z" fill="white"/>
                    <path d="M8.5 8.5h7v7h-7v-7zm1.5 1.5v4h4v-4h-4z" fill="#FF0000"/>
                    <circle cx="7.5" cy="7.5" r="0.5" fill="white"/>
                    <circle cx="16.5" cy="7.5" r="0.5" fill="white"/>
                    <circle cx="7.5" cy="16.5" r="0.5" fill="white"/>
                    <circle cx="16.5" cy="16.5" r="0.5" fill="white"/>
                    <text x="12" y="13" textAnchor="middle" fontSize="3" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold">AS</text>
                  </svg>
                </div>
              ) : (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              )}
            </div>
            <div className="text-left">
              <div className="font-bold">{selectedPlatformConfig.name}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedPlatformConfig.description}
              </div>
            </div>
          </div>
          
          {/* Animated dropdown arrow */}
          <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'} transition-all duration-200 group-hover:bg-opacity-80`}>
            <svg 
              className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {/* Custom Dropdown Menu */}
        {isOpen && (
          <div className={`
            absolute top-full left-0 right-0 mt-2 rounded-2xl border-2 shadow-2xl backdrop-blur-xl z-50
            ${isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-gray-900/50' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-gray-900/20'
            }
            animate-in slide-in-from-top-2 duration-200
          `}>
            <div className="p-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform.id)}
                  className={`
                    w-full px-4 py-3 rounded-xl transition-all duration-200 text-left
                    ${selectedPlatform === platform.id 
                      ? (isDarkMode 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg')
                      : (isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700 hover:text-white' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                    }
                    flex items-center gap-3 group
                  `}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
                    selectedPlatform === platform.id 
                      ? 'bg-white/20' 
                      : (isDarkMode ? 'bg-gray-600' : 'bg-gray-100')
                  }`}>
                    {platform.id === 'shutterstock' ? (
                      <div className="w-6 h-6 flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                          {/* Shutterstock Official Logo */}
                          <rect width="24" height="24" rx="3" fill="#0084FF"/>
                          <path d="M6 6h12v12H6V6zm1.5 1.5v9h9v-9h-9z" fill="white"/>
                          <path d="M8.5 8.5h7v7h-7v-7zm1.5 1.5v4h4v-4h-4z" fill="#0084FF"/>
                          <circle cx="7.5" cy="7.5" r="0.5" fill="white"/>
                          <circle cx="16.5" cy="7.5" r="0.5" fill="white"/>
                          <circle cx="7.5" cy="16.5" r="0.5" fill="white"/>
                          <circle cx="16.5" cy="16.5" r="0.5" fill="white"/>
                          <text x="12" y="13" textAnchor="middle" fontSize="3" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold">SS</text>
                        </svg>
                      </div>
                    ) : platform.id === 'adobe_stock' ? (
                      <div className="w-6 h-6 flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                          {/* Adobe Stock Official Logo */}
                          <rect width="24" height="24" rx="3" fill="#FF0000"/>
                          <path d="M6 6h12v12H6V6zm1.5 1.5v9h9v-9h-9z" fill="white"/>
                          <path d="M8.5 8.5h7v7h-7v-7zm1.5 1.5v4h4v-4h-4z" fill="#FF0000"/>
                          <circle cx="7.5" cy="7.5" r="0.5" fill="white"/>
                          <circle cx="16.5" cy="7.5" r="0.5" fill="white"/>
                          <circle cx="7.5" cy="16.5" r="0.5" fill="white"/>
                          <circle cx="16.5" cy="16.5" r="0.5" fill="white"/>
                          <text x="12" y="13" textAnchor="middle" fontSize="3" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold">AS</text>
                        </svg>
                      </div>
                    ) : (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{platform.name}</div>
                    <div className={`text-sm ${selectedPlatform === platform.id ? 'text-white/80' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                      {platform.description}
                    </div>
                  </div>
                  {selectedPlatform === platform.id && (
                    <div className="ml-auto">
                      <img src="/assets/icons/tick.svg" alt="Selected" className="w-5 h-5 brightness-0 invert" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Backdrop for closing dropdown */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
        
        {/* Enhanced glow effect */}
        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
          isDarkMode ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10' : 'bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5'
        }`}></div>
      </div>
      
      {/* Enhanced Platform Information Panel */}
      <div className={`mt-6 p-6 ${isDarkMode ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 border-gray-600' : 'bg-gradient-to-br from-white via-gray-50 to-white border-gray-200'} border-2 rounded-3xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/10">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h4 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedPlatformConfig.name} Format
              </h4>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                Optimized
              </div>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              {selectedPlatformConfig.description}
            </p>
            
            {/* Enhanced CSV Headers */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <img src="/assets/icons/bookmark.svg" alt="Headers" className={`w-4 h-4 ${isDarkMode ? 'opacity-60' : 'opacity-70'}`} />
                <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  CSV Headers ({selectedPlatformConfig.csvHeaders.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPlatformConfig.csvHeaders.map((header, index) => (
                  <span 
                    key={index}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 border border-gray-500 hover:from-gray-600 hover:to-gray-500 hover:shadow-lg' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-300 hover:from-gray-200 hover:to-gray-100 hover:shadow-md'
                    }`}
                  >
                    {header}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Enhanced Platform-specific requirements */}
            {selectedPlatform === 'adobe_stock' && (
              <div className={`mt-5 p-5 ${isDarkMode ? 'bg-gradient-to-br from-amber-900/20 via-orange-900/15 to-red-900/10 border-amber-500/50' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-amber-300'} border-2 rounded-2xl shadow-lg backdrop-blur-sm`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${isDarkMode ? 'bg-gradient-to-br from-amber-600 to-orange-600' : 'bg-gradient-to-br from-amber-500 to-orange-500'} rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/10 flex-shrink-0`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                        Adobe Stock Requirements
                      </p>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-amber-600/20 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                        Creative
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-amber-800/30' : 'bg-amber-100/50'} border ${isDarkMode ? 'border-amber-600/30' : 'border-amber-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>Title</span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-amber-100' : 'text-amber-700'}`}>Max 200 characters</p>
                      </div>
                      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-amber-800/30' : 'bg-amber-100/50'} border ${isDarkMode ? 'border-amber-600/30' : 'border-amber-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>Keywords</span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-amber-100' : 'text-amber-700'}`}>Max 49 keywords</p>
                      </div>
                      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-amber-800/30' : 'bg-amber-100/50'} border ${isDarkMode ? 'border-amber-600/30' : 'border-amber-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>Category</span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-amber-100' : 'text-amber-700'}`}>Numeric code (1-21)</p>
                      </div>
                      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-amber-800/30' : 'bg-amber-100/50'} border ${isDarkMode ? 'border-amber-600/30' : 'border-amber-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>Optional</span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-amber-100' : 'text-amber-700'}`}>All except Filename</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedPlatform === 'shutterstock' && (
              <div className={`mt-5 p-5 ${isDarkMode ? 'bg-gradient-to-br from-blue-900/20 via-indigo-900/15 to-purple-900/10 border-blue-500/50' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-300'} border-2 rounded-2xl shadow-lg backdrop-blur-sm`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-500'} rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/10 flex-shrink-0`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                        Shutterstock Requirements
                      </p>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-blue-600/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                        Editorial
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-800/30' : 'bg-blue-100/50'} border ${isDarkMode ? 'border-blue-600/30' : 'border-blue-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Description</span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-blue-100' : 'text-blue-700'}`}>6-12 words</p>
                      </div>
                      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-800/30' : 'bg-blue-100/50'} border ${isDarkMode ? 'border-blue-600/30' : 'border-blue-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Keywords</span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-blue-100' : 'text-blue-700'}`}>7-50 keywords</p>
                      </div>
                      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-800/30' : 'bg-blue-100/50'} border ${isDarkMode ? 'border-blue-600/30' : 'border-blue-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Categories</span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-blue-100' : 'text-blue-700'}`}>1-2 from official list</p>
                      </div>
                      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-800/30' : 'bg-blue-100/50'} border ${isDarkMode ? 'border-blue-600/30' : 'border-blue-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Editorial</span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-blue-100' : 'text-blue-700'}`}>Yes/No based on content</p>
                      </div>
                    </div>
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
