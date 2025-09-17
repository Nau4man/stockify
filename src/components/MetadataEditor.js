import React, { useState, useEffect } from 'react';

const MetadataEditor = ({ metadata, isVisible, onSave, onCancel, isDarkMode = false }) => {
  const [editedMetadata, setEditedMetadata] = useState({
    filename: '',
    description: '',
    keywords: '',
    categories: '',
    editorial: 'no',
    matureContent: 'no',
    illustration: 'no',
    ...metadata
  });

  useEffect(() => {
    if (metadata) {
      setEditedMetadata({
        filename: '',
        description: '',
        keywords: '',
        categories: '',
        editorial: 'no',
        matureContent: 'no',
        illustration: 'no',
        ...metadata
      });
    }
  }, [metadata]);

  // Early return if not visible or no metadata
  if (!isVisible || !metadata || typeof metadata !== 'object') {
    return null;
  }

  const handleChange = (field, value) => {
    setEditedMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(editedMetadata);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Edit Metadata
            </h2>
            <button
              onClick={onCancel}
              className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors duration-200`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Filename
              </label>
              <input
                type="text"
                value={editedMetadata.filename || ''}
                onChange={(e) => handleChange('filename', e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                placeholder="Enter filename"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Description
              </label>
              <textarea
                value={editedMetadata.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                placeholder="Enter description (6-12 words, no commas)"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Keywords
              </label>
              <textarea
                value={editedMetadata.keywords || ''}
                onChange={(e) => handleChange('keywords', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                placeholder="Enter keywords (comma-separated, 7-50 keywords)"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Categories
              </label>
              <input
                type="text"
                value={editedMetadata.categories || ''}
                onChange={(e) => handleChange('categories', e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                placeholder="Enter categories (1-2 categories)"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Editorial
              </label>
              <select
                value={editedMetadata.editorial || 'no'}
                onChange={(e) => handleChange('editorial', e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'} border rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-colors duration-200 appearance-none cursor-pointer shadow-sm`}
              >
                <option value="no">No (Commercial)</option>
                <option value="yes">Yes (Editorial)</option>
              </select>
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
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onCancel}
              className={`px-4 py-2 ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'} rounded-lg transition-colors duration-200`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataEditor;