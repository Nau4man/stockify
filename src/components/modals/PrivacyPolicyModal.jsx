import React from 'react';
import BaseModal from './BaseModal';

const PrivacyPolicyModal = ({ isDarkMode, setShowPrivacyPolicy }) => {
  return (
    <BaseModal
      isOpen
      onClose={() => setShowPrivacyPolicy(false)}
      isDarkMode={isDarkMode}
      title="Privacy Policy"
      subtitle="Last updated: February 6, 2026"
      icon={
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      }
      iconWrapperClassName="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
    >
      <div className="prose prose-gray max-w-none">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>1. Information We Collect</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Stockify is designed with privacy in mind. We collect minimal information necessary to provide our service:
            </p>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• <strong>Images:</strong> Only the images you upload for metadata generation. Images are processed locally in your browser and sent to Google's Gemini API for analysis.</li>
              <li>• <strong>Usage Data:</strong> Basic usage statistics to improve our service (processed images count, error rates).</li>
              <li>• <strong>Technical Data:</strong> Browser type, device information, and IP address for service optimization.</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>2. How We Use Your Information</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We use the collected information solely to:
            </p>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• Generate metadata for your uploaded images</li>
              <li>• Improve reliability, debugging, and performance</li>
              <li>• Provide features such as draft recovery and preferences</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>3. Third-Party Services</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Stockify may rely on third-party services to operate:
            </p>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• <strong>Google Gemini API:</strong> Receives image data and prompts for metadata generation</li>
              <li>• <strong>Vercel:</strong> Hosts client and serverless API functions</li>
              <li>• <strong>Upstash Redis:</strong> Supports production rate limiting</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>4. Data Storage and Retention</h3>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• Draft metadata and preferences are stored in your browser local storage</li>
              <li>• Client and API errors may be logged for monitoring and reliability</li>
              <li>• Data retention follows hosting and infrastructure provider defaults</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>5. Security</h3>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• API keys are handled server-side and should never be exposed in client code</li>
              <li>• API endpoints include request validation, payload limits, and rate limiting</li>
              <li>• Sensitive fields are redacted from error logs where possible</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>6. Your Choices</h3>
            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
              <li>• Remove uploaded images from the active session at any time</li>
              <li>• Clear draft metadata and app preferences from local storage</li>
              <li>• Stop using the service at any time</li>
            </ul>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>7. Policy Updates</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
              We may update this policy when product behavior, infrastructure, or legal requirements change. The “Last updated” date reflects the latest revision.
            </p>

            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>8. Contact</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
              For privacy questions, use the in-app support and documentation links.
            </p>
      </div>
    </BaseModal>
  );
};

export default PrivacyPolicyModal;
