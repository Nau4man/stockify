import React from 'react';
import BaseModal from './BaseModal';

const PlatformInfoModal = ({ isOpen, onClose, isDarkMode, platform }) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      isDarkMode={isDarkMode}
      title={`${platform?.name || 'Platform'} Requirements`}
      titleClassName={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
      maxWidthClassName="max-w-2xl"
      maxHeightClassName="max-h-[80vh]"
      bodyClassName="p-6 overflow-y-auto max-h-[60vh]"
      footer={
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            CSV Headers
          </h3>
          <div className="flex flex-wrap gap-2">
            {platform?.csvHeaders?.map((header, index) => (
              <span
                key={index}
                className={`px-3 py-1 text-sm rounded-full ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {header}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Description
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {platform?.description || 'No description available'}
          </p>
        </div>

        {platform?.categories && (
          <div>
            <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Available Categories ({platform.categories.length})
            </h3>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {platform.categories.map((category, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default PlatformInfoModal;
