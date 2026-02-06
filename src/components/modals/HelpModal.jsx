import React from 'react';
import BaseModal from './BaseModal';

const HelpModal = ({ isDarkMode, setShowHelp, setShowApiConfiguration, handleFooterNavigation }) => {
  return (
    <BaseModal
      isOpen
      onClose={() => setShowHelp(false)}
      isDarkMode={isDarkMode}
      title="Help & Support"
      subtitle="Everything you need to run and use Stockify"
      icon={
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
      iconWrapperClassName="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
      footer={
        <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>Need more help? Check the Documentation and API Configuration sections.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowHelp(false);
                  handleFooterNavigation('help');
                }}
                className={`px-4 py-2 ${isDarkMode ? 'text-blue-400 bg-gray-600 border-gray-500 hover:bg-gray-500' : 'text-blue-600 bg-white border-blue-200 hover:bg-blue-50'} border rounded-lg transition-colors duration-200`}
              >
                View Full Guide
              </button>
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Start */}
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            🚀 Quick Start
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload Images</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Drag and drop or select multiple image files</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Process with AI</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Click "Generate Stock Metadata" to process your images</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Download CSV</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Get your stock photo metadata CSV file</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            ✨ Key Features
          </h3>
          <div className="space-y-3">
            <div className={`${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg p-3`}>
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🤖 AI-Powered</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Uses Google Gemini AI for intelligent metadata generation</p>
            </div>
            <div className={`${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} rounded-lg p-3`}>
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📊 Stock Platform Ready</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Generates CSV files compatible with major stock photo platform requirements</p>
            </div>
            <div className={`${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-lg p-3`}>
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>⚡ Batch Processing</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Process multiple images simultaneously</p>
            </div>
            <div className={`${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'} rounded-lg p-3`}>
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>✏️ Editable</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Review and edit generated metadata before download</p>
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            🔧 API Configuration
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              Configure your Gemini API key in <code className={`${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'} px-1 rounded text-xs`}>.env.local</code> and run <code className={`${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'} px-1 rounded text-xs`}>npm run dev:api</code>.
            </p>
            <ol className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-2`}>
              <li>• <button onClick={() => {setShowHelp(false); setShowApiConfiguration(true);}} className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Open API Configuration Guide</button></li>
            </ol>
          </div>
        </div>

        {/* Troubleshooting */}
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            🔍 Troubleshooting
          </h3>
          <div className="space-y-3">
            <div className="border-l-4 border-red-400 pl-4">
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>API Key Error</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Set <code className={`${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'} px-1 rounded text-xs`}>GEMINI_API_KEY</code> in <code className={`${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'} px-1 rounded text-xs`}>.env.local</code> and restart the API server</p>
            </div>
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rate Limit</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Switch to a different model or retry after the server-provided delay</p>
            </div>
            <div className="border-l-4 border-blue-400 pl-4">
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Image Processing Failed</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Check format (JPEG/PNG/WebP/GIF), then retry failed items</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default HelpModal;
