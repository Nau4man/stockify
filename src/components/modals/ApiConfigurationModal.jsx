import React from 'react';
import BaseModal from './BaseModal';

const ApiConfigurationModal = ({ isDarkMode, setShowApiConfiguration, setShowDocumentation, setShowHelp, setShowPrivacyPolicy }) => {
  return (
    <BaseModal
      isOpen
      onClose={() => setShowApiConfiguration(false)}
      isDarkMode={isDarkMode}
      title="API Configuration Guide"
      subtitle="Updated: February 6, 2026"
      icon={
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      }
      iconWrapperClassName="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center"
      footer={
        <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>Need help? Check the full documentation or help guide.</p>
            </div>
            <button
              onClick={() => setShowApiConfiguration(false)}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
            >
              I'm Ready
            </button>
          </div>
        </div>
      }
    >
      <div className="prose prose-gray max-w-none">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🔑 Getting Your API Key</h3>
            <div className={`${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-6`}>
              <h4 className={`font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-900'} mb-2`}>Step-by-Step Guide:</h4>
              <ol className={`text-sm ${isDarkMode ? 'text-blue-100' : 'text-blue-800'} space-y-2`}>
                <li><strong>1.</strong> Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} underline`}>Google AI Studio</a></li>
                <li><strong>2.</strong> Sign in with your Google account</li>
                <li><strong>3.</strong> Click "Create API Key"</li>
                <li><strong>4.</strong> Copy the generated API key</li>
                <li><strong>5.</strong> Store the key in <code>.env.local</code> (local) or hosting environment variables (production)</li>
              </ol>
            </div>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>⚙️ Configuration Steps</h3>
            <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 mb-6`}>
              <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>1. Configure Environment Variables</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                For local development, create <code className={`${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'} px-2 py-1 rounded text-xs`}>.env.local</code> in the project root:
              </p>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4 overflow-x-auto">
                <pre className="text-xs">
{`GEMINI_API_KEY=your_real_key_here`}
                </pre>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                Start both services:
              </p>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4 overflow-x-auto">
                <pre className="text-xs">
{`# Terminal 1
npm run dev:api

# Terminal 2
npm start`}
                </pre>
              </div>
              <div className={`${isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-3`}>
                <p className={`text-sm ${isDarkMode ? 'text-yellow-100' : 'text-yellow-800'}`}>
                  <strong>⚠️ Security Note:</strong> Never commit your API key and do not use <code>REACT_APP_GEMINI_API_KEY</code>.
                </p>
              </div>
            </div>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📊 API Usage & Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Gemini 3 Flash Preview</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• <strong>Daily Limit:</strong> 1,000 requests/day</li>
                  <li>• <strong>Speed:</strong> Very fast</li>
                  <li>• <strong>Best For:</strong> Default metadata generation</li>
                </ul>
              </div>
              <div className={`${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'} border rounded-lg p-4`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-900'} mb-2`}>Gemini 3 Flash</h4>
                <ul className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'} space-y-1`}>
                  <li>• <strong>Daily Limit:</strong> 1,000 requests/day</li>
                  <li>• <strong>Speed:</strong> Fast</li>
                  <li>• <strong>Best For:</strong> Stable production workflows</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Gemini 2.5 Flash / Flash Lite</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• <strong>Daily Limit:</strong> 1,000 requests/day</li>
                  <li>• <strong>Speed:</strong> Balanced</li>
                  <li>• <strong>Best For:</strong> Cost/quality tradeoff</li>
                </ul>
              </div>
            </div>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>💰 Billing & Quotas</h3>
            <div className={`${isDarkMode ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4 mb-6`}>
              <h4 className={`font-semibold ${isDarkMode ? 'text-orange-200' : 'text-orange-900'} mb-2`}>Important Billing Information:</h4>
              <ul className={`text-sm ${isDarkMode ? 'text-orange-100' : 'text-orange-800'} space-y-2`}>
                <li>• <strong>Free Tier:</strong> Model availability and limits can change by account and region</li>
                <li>• <strong>Paid Usage:</strong> Charges apply beyond free quotas, based on your Google billing setup</li>
                <li>• <strong>Monitoring:</strong> Track usage and quotas in Google AI Studio</li>
                <li>• <strong>Cost Control:</strong> Set usage alerts and limits</li>
              </ul>
            </div>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🔧 Troubleshooting API Issues</h3>
            <div className="space-y-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">❌ Common Errors:</h4>
                <ul className="text-sm text-red-800 space-y-2">
                  <li>• <strong>"Invalid API Key":</strong> Check that your key is correct and active</li>
                  <li>• <strong>"Quota Exceeded":</strong> You've hit your daily limit - wait for reset or upgrade</li>
                  <li>• <strong>"Service misconfigured":</strong> API server can't find required environment variables</li>
                  <li>• <strong>"Rate Limited":</strong> Too many requests - wait a moment and retry</li>
                </ul>
              </div>
              
              <div className={`${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-green-200' : 'text-green-900'} mb-2`}>✅ Solutions:</h4>
                <ul className={`text-sm ${isDarkMode ? 'text-green-100' : 'text-green-800'} space-y-2`}>
                  <li>• <strong>Verify API Key:</strong> Double-check <code>GEMINI_API_KEY</code> in <code>.env.local</code></li>
                  <li>• <strong>Restart API Server:</strong> Re-run <code>npm run dev:api</code> after changing env variables</li>
                  <li>• <strong>Check Health:</strong> Open <code>http://localhost:3001/api/health</code></li>
                  <li>• <strong>Switch Models:</strong> Try a different model if one is rate-limited</li>
                  <li>• <strong>Wait for Reset:</strong> Respect retry windows returned by the API</li>
                </ul>
              </div>
            </div>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🛡️ Security Best Practices</h3>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• <strong>Never share your API key</strong> publicly or in code repositories</li>
              <li>• <strong>Use environment variables</strong> for production deployments</li>
              <li>• <strong>Set up billing alerts</strong> to monitor unexpected charges</li>
              <li>• <strong>Regularly rotate API keys</strong> for enhanced security</li>
              <li>• <strong>Monitor usage patterns</strong> for unusual activity</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📚 Additional Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Google Documentation:</h4>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                  <li>• <a href="https://ai.google.dev/docs" target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Gemini API Docs</a></li>
                  <li>• <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>AI Studio</a></li>
                  <li>• <a href="https://cloud.google.com/apis" target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Google Cloud APIs</a></li>
                </ul>
              </div>
              <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Stockify Resources:</h4>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                  <li>• <button onClick={() => {setShowApiConfiguration(false); setShowDocumentation(true);}} className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Full Documentation</button></li>
                  <li>• <button onClick={() => {setShowApiConfiguration(false); setShowHelp(true);}} className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>How to Use Guide</button></li>
                  <li>• <button onClick={() => {setShowApiConfiguration(false); setShowPrivacyPolicy(true);}} className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Privacy Policy</button></li>
                </ul>
              </div>
            </div>
      </div>
    </BaseModal>
  );
};

export default ApiConfigurationModal;
