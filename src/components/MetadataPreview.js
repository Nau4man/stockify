import React from 'react';

const MetadataPreview = ({ metadata, isVisible, onEdit, isDarkMode = false }) => {
  if (!isVisible || !metadata) return null;

  return (
    <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Metadata Preview
          </h3>
          {metadata.selectedImageName && (
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
              Showing metadata for: <span className="font-medium">{metadata.selectedImageName}</span>
            </p>
          )}
        </div>
        {onEdit && !metadata.error && metadata.filename && (
          <button
            onClick={() => onEdit(metadata)}
            className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Edit
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Filename
          </label>
          <p className={`text-sm ${isDarkMode ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-900 bg-gray-50 border-gray-200'} p-2 rounded border`}>
            {metadata.filename}
          </p>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Description
          </label>
          <p className={`text-sm ${isDarkMode ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-900 bg-gray-50 border-gray-200'} p-2 rounded border`}>
            {metadata.description || <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} italic`}>Empty</span>}
          </p>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Keywords
          </label>
          <p className={`text-sm ${isDarkMode ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-900 bg-gray-50 border-gray-200'} p-2 rounded border`}>
            {metadata.keywords || <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} italic`}>Empty</span>}
          </p>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Categories
          </label>
          <p className={`text-sm ${isDarkMode ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-900 bg-gray-50 border-gray-200'} p-2 rounded border`}>
            {metadata.categories || <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} italic`}>Empty</span>}
          </p>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Editorial
          </label>
          <p className={`text-sm ${isDarkMode ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-900 bg-gray-50 border-gray-200'} p-2 rounded border`}>
            {metadata.editorial || 'no'}
          </p>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Mature Content
          </label>
          <div className={`text-sm ${isDarkMode ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-900 bg-gray-50 border-gray-200'} p-2 rounded border flex items-center`}>
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span>No (Fixed for stock platforms)</span>
          </div>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Illustration
          </label>
          <div className={`text-sm ${isDarkMode ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-900 bg-gray-50 border-gray-200'} p-2 rounded border flex items-center`}>
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span>No (Fixed for stock platforms)</span>
          </div>
        </div>
      </div>
      
      {metadata.totalImages && (
        <div className={`mt-4 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            This is a preview of the selected image's metadata ({metadata.selectedImageName}). 
            The complete CSV will include metadata for all {metadata.totalImages} images.
          </p>
        </div>
      )}
    </div>
  );
};

export default MetadataPreview;