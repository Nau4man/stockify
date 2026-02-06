import React from 'react';
import BaseModal from './BaseModal';

const DocumentationModal = ({ isDarkMode, setShowDocumentation, setShowApiConfiguration, setShowHelp, setShowPrivacyPolicy }) => {
  return (
    <BaseModal
      isOpen
      onClose={() => setShowDocumentation(false)}
      isDarkMode={isDarkMode}
      title="Stockify Documentation"
      subtitle="Updated: February 6, 2026"
      icon={
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
      iconWrapperClassName="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center"
      maxWidthClassName="max-w-5xl"
      footer={
        <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>Need more help? Check the API Configuration guide or contact support.</p>
            </div>
            <button
              onClick={() => setShowDocumentation(false)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Got It
            </button>
          </div>
        </div>
      }
    >
      <div className="prose prose-gray max-w-none">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📖 Getting Started</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Stockify is an AI-powered web application that automatically generates metadata for your stock photography images. Here's everything you need to know to get started:
            </p>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🚀 Quick Start Guide</h3>
            <div className={`${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-6`}>
              <ol className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} space-y-2`}>
                <li><strong>1. Configure API:</strong> Add <code>GEMINI_API_KEY</code> to <code>.env.local</code> and run <code>npm run dev:api</code></li>
                <li><strong>2. Upload Images:</strong> Drag and drop or select multiple images (JPG, PNG, WebP)</li>
                <li><strong>3. Select Model:</strong> Choose your preferred Gemini AI model</li>
                <li><strong>4. Process Images:</strong> Click "Generate Stock Metadata" to generate metadata</li>
                <li><strong>5. Review & Edit:</strong> Preview and edit generated metadata as needed</li>
                <li><strong>6. Download CSV:</strong> Export your metadata in stock platform-ready format</li>
              </ol>
            </div>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🖼️ Supported Image Formats</h3>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• <strong>JPEG/JPG:</strong> Most common format, excellent for photographs</li>
              <li>• <strong>PNG:</strong> Great for images with transparency</li>
              <li>• <strong>WebP:</strong> Modern format with excellent compression</li>
              <li>• <strong>GIF:</strong> Supported for compatible stock workflows</li>
              <li>• <strong>Maximum Size:</strong> Keep images under 5MB for best reliability and speed</li>
              <li>• <strong>Resolution:</strong> Any resolution supported (AI works best with clear, high-quality images)</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🤖 AI Models Available</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'} border rounded-lg p-4`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-900'} mb-2`}>Gemini 3 Flash Preview</h4>
                <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} mb-2`}>Recommended</p>
                <ul className={`text-xs ${isDarkMode ? 'text-blue-200' : 'text-blue-600'} space-y-1`}>
                  <li>• Fast preview model</li>
                  <li>• Great default for most images</li>
                  <li>• 1,000 requests/day</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Gemini 3 Flash</h4>
                <p className="text-xs text-green-700 mb-2">Alternative</p>
                <ul className="text-xs text-green-600 space-y-1">
                  <li>• Fast production model</li>
                  <li>• Stable for day-to-day batches</li>
                  <li>• 1,000 requests/day</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Gemini 2.5 Flash / Flash Lite</h4>
                <p className="text-xs text-purple-700 mb-2">Balanced</p>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• Cost and quality balance</li>
                  <li>• Good for mixed content</li>
                  <li>• 1,000 requests/day</li>
                </ul>
              </div>
            </div>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📊 Generated Metadata Fields</h3>
            <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 mb-6`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Required Fields:</h4>
                  <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                    <li>• <strong>Filename:</strong> Original image filename</li>
                    <li>• <strong>Description:</strong> 6-12 word commercial description</li>
                    <li>• <strong>Keywords:</strong> 7-50 relevant keywords</li>
                    <li>• <strong>Categories:</strong> 1-2 stock platform categories</li>
                  </ul>
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Fixed Fields:</h4>
                  <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                    <li>• <strong>Editorial:</strong> Auto-determined (Yes/No)</li>
                    <li>• <strong>Mature Content:</strong> Always "No"</li>
                    <li>• <strong>Illustration:</strong> Always "No"</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>✏️ Editing Metadata</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              You can edit any generated metadata before downloading:
            </p>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• <strong>Click any image thumbnail</strong> to select it for editing</li>
              <li>• <strong>Use the Metadata Editor</strong> to modify descriptions, keywords, and categories</li>
              <li>• <strong>Preview changes</strong> in the Metadata Preview panel</li>
              <li>• <strong>CSV Preview</strong> shows how your data will look in the final export</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📁 CSV Export Format</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              The exported CSV file is formatted for major stock photo platforms and includes:
            </p>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
              <pre className="text-xs">
{`Filename,Description,Keywords,Categories,Editorial,Mature content,Illustration
image1.jpg,Beautiful sunset over mountains,landscape,sunset,mountains,nature,sky,photography,outdoor,scenic,travel,adventure,No,No,No
image2.jpg,Modern office workspace interior,office,workspace,interior,modern,business,desk,computer,professional,corporate,productivity,No,No,No`}
              </pre>
            </div>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>⚡ Performance Tips</h3>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• <strong>Batch Processing:</strong> Process multiple images at once for efficiency</li>
              <li>• <strong>Image Quality:</strong> Use clear, well-lit images for better AI analysis</li>
              <li>• <strong>File Size:</strong> Keep images under 5MB for faster processing</li>
              <li>• <strong>Model Selection:</strong> Start with Gemini 3 Flash Preview and switch if rate-limited</li>
              <li>• <strong>Rate Limits:</strong> Monitor model usage to avoid temporary blocks</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🔧 Troubleshooting</h3>
            <div className={`${isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4 mb-6`}>
              <h4 className={`font-semibold ${isDarkMode ? 'text-yellow-200' : 'text-yellow-900'} mb-2`}>Common Issues:</h4>
              <ul className={`text-sm ${isDarkMode ? 'text-yellow-100' : 'text-yellow-800'} space-y-2`}>
                <li>• <strong>API Key Error:</strong> Ensure <code>GEMINI_API_KEY</code> is set in <code>.env.local</code> and API server is running</li>
                <li>• <strong>Rate Limit:</strong> Switch to a different model or wait for daily reset</li>
                <li>• <strong>Image Upload Failed:</strong> Check file format and keep files under 5MB</li>
                <li>• <strong>Processing Failed:</strong> Try a different image or model</li>
                <li>• <strong>CSV Download Issues:</strong> Ensure you have processed at least one image successfully</li>
              </ul>
            </div>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📞 Support & Resources</h3>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• <strong>Google Gemini API:</strong> <a href="https://ai.google.dev/docs" target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Official Documentation</a></li>
              <li>• <strong>Stock Platform Guidelines:</strong> <a href="https://support.submit.shutterstock.com/s/article/Submission-and-Account-Guidelines?language=en_US" target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Submission and Account Guidelines</a></li>
              <li>• <strong>API Configuration:</strong> Check the API Configuration modal for setup instructions</li>
              <li>• <strong>Privacy Policy:</strong> Review our privacy practices and data handling</li>
            </ul>
      </div>
    </BaseModal>
  );
};

export default DocumentationModal;
