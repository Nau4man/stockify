import React from 'react';
import BaseModal from './BaseModal';

const TermsOfServiceModal = ({ isDarkMode, setShowTermsOfService }) => {
  return (
    <BaseModal
      isOpen
      onClose={() => setShowTermsOfService(false)}
      isDarkMode={isDarkMode}
      title="Terms of Service"
      subtitle="Last updated: February 6, 2026"
      icon={
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
      iconWrapperClassName="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
      footer={
        <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>By using Stockify, you agree to these Terms of Service.</p>
            </div>
            <button
              onClick={() => setShowTermsOfService(false)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              I Agree
            </button>
          </div>
        </div>
      }
    >
      <div className="prose prose-gray max-w-none">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>1. Acceptance of Terms</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
              By accessing and using Stockify ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>2. Description of Service</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Stockify is an AI-powered web application that generates metadata for stock photography. The service:
            </p>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• Analyzes uploaded images using Google's Gemini AI technology</li>
              <li>• Generates descriptive metadata including titles, descriptions, keywords, and categories</li>
              <li>• Exports metadata in CSV format compatible with stock photography platforms</li>
              <li>• Provides editing capabilities for generated metadata</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>3. User Responsibilities</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              As a user of Stockify, you agree to:
            </p>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• Only upload images that you own or have the right to use</li>
              <li>• Not upload copyrighted material without proper authorization</li>
              <li>• Not use the service for illegal or unauthorized purposes</li>
              <li>• Provide accurate information when configuring API settings</li>
              <li>• Respect the intellectual property rights of others</li>
              <li>• Not attempt to reverse engineer or compromise the service</li>
              <li>• Review generated metadata before submitting to stock platforms</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>4. API Usage and Third-Party Services</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Stockify integrates with third-party services:
            </p>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• <strong>Google Gemini API:</strong> API usage is subject to Google's terms, quotas, and billing</li>
              <li>• <strong>Rate Limits:</strong> API usage is subject to Google's rate limits and pricing</li>
              <li>• <strong>Data Processing:</strong> Images are processed by Google's AI services according to their privacy policy</li>
            </ul>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
              You are responsible for API usage costs and compliance with third-party terms of service.
            </p>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>5. Intellectual Property</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Regarding intellectual property:
            </p>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• <strong>Your Content:</strong> You retain all rights to images you upload</li>
              <li>• <strong>Generated Metadata:</strong> You own the metadata generated for your images</li>
              <li>• <strong>Service IP:</strong> Stockify's software, design, and functionality remain our intellectual property</li>
              <li>• <strong>AI Technology:</strong> The underlying AI technology is provided by Google and subject to their terms</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>6. Service Availability</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
              We strive to provide reliable service but cannot guarantee:
            </p>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• Continuous availability of the service</li>
              <li>• Accuracy of AI-generated metadata</li>
              <li>• Compatibility with all image formats or sizes</li>
              <li>• Performance of third-party API services</li>
              <li>• Acceptance of metadata by stock platforms</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>7. Limitation of Liability</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
              Stockify is provided "as is" without warranties of any kind. We shall not be liable for:
            </p>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• Any loss or damage resulting from use of the service</li>
              <li>• Inaccurate or inappropriate metadata generation</li>
              <li>• Third-party service interruptions or failures</li>
              <li>• Data loss or corruption</li>
              <li>• Indirect, incidental, or consequential damages</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>8. Prohibited Uses</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              You may not use Stockify:
            </p>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>• To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>• To submit false or misleading information</li>
              <li>• To upload or transmit viruses or any other type of malicious code</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>9. Termination</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
              We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>10. Changes to Terms</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>11. Contact Information</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
              If you have any questions about these Terms of Service, please contact us through our support channels.
            </p>
      </div>
    </BaseModal>
  );
};

export default TermsOfServiceModal;
