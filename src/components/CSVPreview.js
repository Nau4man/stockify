import React from 'react';
import { getPlatformConfig } from '../utils/platformConfig';

const CSVPreview = ({ metadata, isVisible, onClose, onDownload, isDarkMode = false, platformId = 'shutterstock' }) => {
  if (!isVisible || !metadata || metadata.length === 0) return null;

  const validMetadata = metadata.filter(item => !item.error);
  const errorCount = metadata.length - validMetadata.length;
  const platform = getPlatformConfig(platformId);

  // Don't show preview if no valid metadata
  if (validMetadata.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} bg-opacity-100 rounded-lg shadow-2xl border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} max-w-6xl w-full max-h-[90vh] overflow-hidden`}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                CSV Preview
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                Preview of {validMetadata.length} image{validMetadata.length !== 1 ? 's' : ''} ready for download
                {errorCount > 0 && ` (${errorCount} failed)`}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`text-gray-400 hover:text-gray-600 transition-colors duration-200`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh]">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} sticky top-0`}>
              <tr>
                {platform.csvHeaders.map((header, index) => (
                  <th key={index} className={`px-4 py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {validMetadata.map((item, index) => (
                <tr key={index} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  {platform.csvHeaders.map((header, headerIndex) => {
                    let cellValue = '';
                    let isFilename = false;
                    
                    if (platformId === 'adobe_stock') {
                      switch (header) {
                        case 'Filename':
                          cellValue = item.filename;
                          isFilename = true;
                          break;
                        case 'Title':
                          cellValue = item.title || item.description || '';
                          break;
                        case 'Keywords':
                          cellValue = item.keywords || '';
                          break;
                        case 'Category':
                          cellValue = item.category || '';
                          break;
                        case 'Releases':
                          cellValue = item.releases || '';
                          break;
                        default:
                          cellValue = item[header.toLowerCase().replace(/\s+/g, '')] || '';
                      }
                    } else {
                      // Default Shutterstock format
                      switch (header) {
                        case 'Filename':
                          cellValue = item.filename;
                          isFilename = true;
                          break;
                        case 'Description':
                          cellValue = item.description || '';
                          break;
                        case 'Keywords':
                          cellValue = item.keywords || '';
                          break;
                        case 'Categories':
                          cellValue = item.categories || '';
                          break;
                        case 'Editorial':
                          cellValue = item.editorial || 'no';
                          break;
                        case 'Mature content':
                          cellValue = item.matureContent || 'no';
                          break;
                        case 'Illustration':
                          cellValue = item.illustration || 'no';
                          break;
                        default:
                          cellValue = item[header.toLowerCase().replace(/\s+/g, '')] || '';
                      }
                    }
                    
                    return (
                      <td key={headerIndex} className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} ${isFilename ? 'font-medium' : ''}`}>
                        {isFilename ? (
                          cellValue
                        ) : (
                          <div className="max-w-xs truncate">
                            {cellValue || <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} italic`}>Empty</span>}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {validMetadata.length === 0 && (
          <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} bg-opacity-100`}>
            <p>No valid metadata to preview</p>
          </div>
        )}
        
        <div className="p-6 border-t">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="mb-2">
              This preview shows the first few rows of your CSV file. 
              The complete file will contain all {validMetadata.length} processed image{validMetadata.length !== 1 ? 's' : ''}.
            </p>
            <p>
              <strong>Note:</strong> Mature Content and Illustration are automatically set to "no" for stock platform compatibility.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={onClose}
              className={`px-4 py-2 ${isDarkMode ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'} rounded-lg transition-colors duration-200`}
            >
              Close
            </button>
            <button
              onClick={onDownload}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVPreview;