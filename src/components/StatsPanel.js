import React from 'react';

const StatsPanel = ({ metadata, isVisible, isDarkMode = false }) => {
  if (!isVisible || !metadata || metadata.length === 0) return null;

  const validMetadata = metadata.filter(item => !item.error);
  const errorCount = metadata.length - validMetadata.length;
  
  // Calculate statistics
  const totalKeywords = validMetadata.reduce((sum, item) => {
    if (!item || !item.keywords) return sum;
    // Handle keywords as string (comma-separated)
    if (typeof item.keywords === 'string') {
      return sum + item.keywords.split(',').length;
    }
    return sum;
  }, 0);
  
  const avgKeywords = validMetadata.length > 0 ? Math.round(totalKeywords / validMetadata.length) : 0;
  
  const categories = {};
  validMetadata.forEach(item => {
    if (item && item.categories) {
      // Handle different category formats based on platform
      let cats = [];
      if (typeof item.categories === 'string') {
        // Shutterstock format: comma-separated string
        cats = item.categories.split(',').map(cat => cat.trim());
      } else if (typeof item.categories === 'number') {
        // Adobe Stock format: numeric category ID
        cats = [item.categories.toString()];
      } else if (Array.isArray(item.categories)) {
        // Array format
        cats = item.categories.map(cat => cat.toString());
      }
      
      cats.forEach(cat => {
        if (cat && cat.trim()) {
          categories[cat] = (categories[cat] || 0) + 1;
        }
      });
    }
  });
  
  const topCategories = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <img src="/assets/icons/star.svg" alt="Stats" className="w-6 h-6 text-blue-500" />
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Processing Statistics
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <img src="/assets/icons/tick-circle.svg" alt="Success" className="w-6 h-6 text-green-500 mr-2" />
            <div className="text-2xl font-bold text-green-600">
              {validMetadata.length}
            </div>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Successful</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <img src="/assets/icons/x-circle.svg" alt="Error" className="w-6 h-6 text-red-500 mr-2" />
            <div className="text-2xl font-bold text-red-600">
              {errorCount}
            </div>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Errors</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <img src="/assets/icons/search.svg" alt="Keywords" className="w-6 h-6 text-blue-500 mr-2" />
            <div className="text-2xl font-bold text-blue-600">
              {avgKeywords}
            </div>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Keywords</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <img src="/assets/icons/bookmark.svg" alt="Categories" className="w-6 h-6 text-purple-500 mr-2" />
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(categories).length}
            </div>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Categories</div>
        </div>
      </div>

      {topCategories.length > 0 && (
        <div>
          <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Top Categories
          </h4>
          <div className="space-y-1">
            {topCategories.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{category}</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {errorCount > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <div className="flex items-center">
            <img src="/assets/icons/alert-circle.svg" alt="Alert" className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-sm text-red-800">
              {errorCount} image{errorCount !== 1 ? 's' : ''} failed to process
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
