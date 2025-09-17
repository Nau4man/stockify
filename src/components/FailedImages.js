import React from 'react';

const FailedImages = ({ metadata, images, onRetry, retryingImages, onRetryAll, onRemoveImage, isDarkMode = false }) => {
  // Filter failed images
  const failedImages = metadata.filter((item, index) => item.error);
  
  if (failedImages.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-lg font-semibold text-red-800">
          Failed Images ({failedImages.length})
        </h3>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <p className="text-red-700">
          The following images failed to process. You can retry them individually:
        </p>
        {onRetryAll && (
          <button
            onClick={onRetryAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry All Failed
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {failedImages.map((failedItem, index) => {
          const originalIndex = metadata.findIndex(item => item === failedItem);
          const imageFile = images[originalIndex];
          const isRetrying = retryingImages.has(originalIndex);
          
          return (
            <div key={originalIndex} className={`flex items-center justify-between ${isDarkMode ? 'bg-gray-800 border-red-700' : 'bg-white border-red-200'} border rounded-lg p-3`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate max-w-xs`}>
                    {failedItem.filename}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {failedItem.error?.message || 'Unknown error'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRetry(imageFile, originalIndex)}
                  disabled={isRetrying}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${
                    isRetrying
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isRetrying ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Retrying...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retry
                    </>
                  )}
                </button>
                
                {onRemoveImage && (
                  <button
                    onClick={() => onRemoveImage(originalIndex)}
                    className={`px-3 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-lg transition-colors duration-200`}
                    title="Remove image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FailedImages;
