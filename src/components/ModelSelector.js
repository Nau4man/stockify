import React, { useState, useRef, useEffect } from 'react';
import { GEMINI_MODELS } from '../utils/geminiApi';
import RateLimitIndicator from './RateLimitIndicator';

const ModelSelector = ({ selectedModel, onModelChange, disabled = false, isDarkMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  console.log('ModelSelector props:', { selectedModel, disabled, isDarkMode });
  console.log('Available models:', Object.keys(GEMINI_MODELS));
  console.log('Selected model info:', GEMINI_MODELS[selectedModel]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedModelConfig = GEMINI_MODELS[selectedModel] || {};

  const handleModelSelect = (modelKey) => {
    onModelChange(modelKey);
    setIsOpen(false);
  };
  
  return (
    <div className="mb-6">
      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
        AI Model Selection
      </label>
      <div className="relative" ref={dropdownRef}>
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
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-bold">{selectedModelConfig.name || 'Select Model'}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedModelConfig.description || 'Choose an AI model'}
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
            absolute top-full left-0 right-0 mt-2 z-50
            ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}
            border-2 rounded-2xl shadow-2xl backdrop-blur-xl
            max-h-80 overflow-y-auto
            animate-in slide-in-from-top-2 duration-200
          `}>
            {Object.entries(GEMINI_MODELS).map(([key, model]) => (
              <button
                key={key}
                onClick={() => handleModelSelect(key)}
                className={`
                  w-full px-6 py-4 text-left transition-all duration-200
                  ${isDarkMode 
                    ? 'hover:bg-gray-700 text-white border-b border-gray-700 last:border-b-0' 
                    : 'hover:bg-gray-50 text-gray-900 border-b border-gray-100 last:border-b-0'
                  }
                  ${selectedModel === key 
                    ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700')
                    : ''
                  }
                  first:rounded-t-2xl last:rounded-b-2xl
                  flex items-center gap-3
                `}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{model.name}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {model.description}
                  </div>
                </div>
                {selectedModel === key && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Model Information */}
      <div className={`mt-3 p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'} rounded-xl border`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 w-8 h-8 ${isDarkMode ? 'bg-gray-600' : 'bg-blue-100'} rounded-lg flex items-center justify-center mr-3`}>
            <svg className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm">
            <div className="flex items-center justify-between mb-1">
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {GEMINI_MODELS[selectedModel]?.name || 'Unknown Model'}
              </p>
              <RateLimitIndicator modelKey={selectedModel} isDarkMode={isDarkMode} />
            </div>
            <div className="space-y-1">
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-600'} flex items-center`}>
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Daily limit: <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} ml-1`}>{GEMINI_MODELS[selectedModel]?.dailyLimit || 'Unknown'} requests</span>
              </p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {GEMINI_MODELS[selectedModel]?.description || 'No description available'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rate Limit Warning */}
      {selectedModel === 'gemini-1.5-pro' && (
        <div className={`mt-3 p-4 ${isDarkMode ? 'bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border-amber-700' : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'} border rounded-xl`}>
          <div className="flex items-start">
            <div className={`flex-shrink-0 w-8 h-8 ${isDarkMode ? 'bg-amber-800' : 'bg-amber-100'} rounded-lg flex items-center justify-center mr-3`}>
              <svg className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-sm">
              <p className={`font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'} mb-1`}>Low Rate Limit</p>
              <p className={isDarkMode ? 'text-amber-200' : 'text-amber-700'}>This model has only 50 requests per day. Consider using Gemini 2.5 Flash-Lite for better capacity.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
