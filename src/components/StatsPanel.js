import React from 'react';

const StatsPanel = ({ metadata, isVisible, isDarkMode = false }) => {
  if (!isVisible || !metadata || metadata.length === 0) return null;

  const validMetadata = metadata.filter(item => !item.error);
  const errorCount = metadata.length - validMetadata.length;
  
  // Calculate statistics
  const totalKeywords = validMetadata.reduce((sum, item) => {
    if (!item || !item.keywords) return sum;
    return sum + item.keywords.split(',').length;
  }, 0);
  
  const avgKeywords = validMetadata.length > 0 ? Math.round(totalKeywords / validMetadata.length) : 0;
  
  const categories = {};
  validMetadata.forEach(item => {
    if (item && item.categories) {
      const cats = item.categories.split(',').map(cat => cat.trim());
      cats.forEach(cat => {
        if (cat) {
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
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
        Processing Statistics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {validMetadata.length}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Successful</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {errorCount}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Errors</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {avgKeywords}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Keywords</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(categories).length}
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
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
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
