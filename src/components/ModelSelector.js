import React from 'react';
import { GEMINI_MODELS } from '../utils/geminiApi';
import RateLimitIndicator from './RateLimitIndicator';

const ModelSelector = ({ selectedModel, onModelChange, disabled = false, isDarkMode = false }) => {
  return (
    <div className="mb-6">
      <label htmlFor="model-select" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
        AI Model Selection
      </label>
      <div className="relative">
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-10 border-2 ${isDarkMode ? 'border-gray-600 focus:ring-blue-900/50 focus:border-blue-400 bg-gray-700 text-gray-100 disabled:bg-gray-600 disabled:border-gray-600 hover:border-gray-500' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-50 disabled:border-gray-200 hover:border-gray-300'} rounded-xl focus:ring-4 disabled:cursor-not-allowed transition-all duration-200 appearance-none cursor-pointer shadow-sm`}
        >
          {Object.entries(GEMINI_MODELS).map(([key, model]) => (
            <option key={key} value={key}>
              {model.name} - {model.description}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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
