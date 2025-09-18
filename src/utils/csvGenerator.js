import Papa from 'papaparse';
import { getPlatformConfig } from './platformConfig';

/**
 * Generate CSV content from metadata array for a specific platform
 */
export const generateCSV = (metadataArray, platformId = 'shutterstock') => {
  const platform = getPlatformConfig(platformId);
  
  // Use platform-specific headers
  const headers = platform.csvHeaders;

  // Convert metadata to CSV format based on platform
  const csvData = metadataArray.map(item => {
    if (platformId === 'adobe_stock') {
      return [
        item.filename,
        item.title || item.description || '', // Use title for Adobe Stock, fallback to description
        item.keywords || '',
        item.category || '', // Numeric category for Adobe Stock
        item.releases || '' // Releases field for Adobe Stock
      ];
    } else {
      // Default Shutterstock format
      return [
        item.filename,
        item.description || '',
        item.keywords || '',
        item.categories || '',
        item.editorial || 'no',
        item.matureContent || 'no',
        item.illustration || 'no'
      ];
    }
  });

  // Generate CSV using Papa Parse
  const csv = Papa.unparse({
    fields: headers,
    data: csvData
  }, {
    quotes: true,
    delimiter: ',',
    header: true
  });


  return csv;
};

/**
 * Download CSV file with fallback options
 */
export const downloadCSV = (csvContent, filename = 'stock_metadata.csv', platformId = 'shutterstock') => {
  try {
    const platform = getPlatformConfig(platformId);
    const platformName = platform.name.toLowerCase().replace(/\s+/g, '_');
    const defaultFilename = `${platformName}_metadata.csv`;
    const finalFilename = filename || defaultFilename;
    
    // Create blob with proper MIME type
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Set link attributes
    link.href = url;
    link.download = finalFilename;
    link.style.display = 'none';
    
    // Add to DOM
    document.body.appendChild(link);
    
    // Trigger click immediately
    link.click();
    
    // Clean up after a short delay
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    // Return success indicator
    return { success: true, filename: finalFilename };
    
  } catch (error) {
    console.error('Error downloading CSV:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to download CSV file';
    if (error.name === 'SecurityError') {
      errorMessage = 'Download blocked by browser security settings. Please check your popup blocker or try a different browser.';
    } else if (error.name === 'NotAllowedError') {
      errorMessage = 'Download not allowed. Please ensure the download was triggered by a user action.';
    } else {
      errorMessage = `Failed to download CSV: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Fallback method to show CSV content in a new window
 */
export const showCSVInNewWindow = (csvContent, filename = 'stock_metadata.csv') => {
  try {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              pre { white-space: pre-wrap; word-wrap: break-word; }
              .header { background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
              .copy-btn { 
                background: #007bff; color: white; border: none; padding: 10px 20px; 
                border-radius: 5px; cursor: pointer; margin-bottom: 20px;
              }
              .copy-btn:hover { background: #0056b3; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>CSV Content: ${filename}</h2>
              <p>If the download didn't work, you can copy this content and save it as a .csv file:</p>
              <button class="copy-btn" onclick="copyToClipboard()">Copy to Clipboard</button>
            </div>
            <pre id="csv-content">${csvContent}</pre>
            <script>
              function copyToClipboard() {
                const content = document.getElementById('csv-content').textContent;
                navigator.clipboard.writeText(content).then(() => {
                  alert('CSV content copied to clipboard!');
                }).catch(() => {
                  alert('Failed to copy to clipboard. Please select and copy the text manually.');
                });
              }
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    } else {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }
  } catch (error) {
    console.error('Error showing CSV in new window:', error);
    throw new Error(`Failed to show CSV content: ${error.message}`);
  }
};

/**
 * Fix common category mapping issues
 */
export const fixCategoryMappings = (metadata, platformId = 'shutterstock') => {
  if (platformId === 'shutterstock' && metadata.categories) {
    const categoryMappings = {
      'Landscapes': 'Nature',
      'Landscape': 'Nature',
      'Scenic': 'Nature',
      'Outdoor': 'Parks/Outdoor',
      'Outdoors': 'Parks/Outdoor',
      'Wildlife': 'Animals/Wildlife',
      'Architecture': 'Buildings/Landmarks',
      'Business': 'Business/Finance',
      'Technology': 'Technology',
      'Sports': 'Sports/Recreation',
      'Food': 'Food and drink',
      'People': 'People',
      'Abstract': 'Abstract',
      'Nature': 'Nature'
    };
    
    // Handle different data types for categories
    let categoriesArray;
    if (Array.isArray(metadata.categories)) {
      // If it's already an array, use it directly
      categoriesArray = metadata.categories;
    } else if (typeof metadata.categories === 'string') {
      // If it's a string, split by comma
      categoriesArray = metadata.categories.split(',');
    } else {
      // If it's something else, convert to string first
      categoriesArray = [String(metadata.categories)];
    }
    
    const mappedCategories = categoriesArray.map(cat => {
      const trimmed = String(cat).trim();
      return categoryMappings[trimmed] || trimmed;
    });
    
    return {
      ...metadata,
      categories: mappedCategories.join(', ')
    };
  }
  
  return metadata;
};

/**
 * Validate metadata before CSV generation
 */
export const validateMetadata = (metadata, platformId = 'shutterstock') => {
  const platform = getPlatformConfig(platformId);
  const errors = [];
  
  if (!metadata.filename) {
    errors.push('Filename is required');
  }
  
  // Platform-specific validation
  if (platformId === 'shutterstock') {
    if (!metadata.description || metadata.description.trim().length === 0) {
      errors.push('Description is required for Shutterstock');
    }
    
    if (!metadata.keywords || metadata.keywords.trim().length === 0) {
      errors.push('Keywords are required for Shutterstock');
    }
    
    if (!metadata.categories || (typeof metadata.categories === 'string' && metadata.categories.trim().length === 0) || (Array.isArray(metadata.categories) && metadata.categories.length === 0)) {
      errors.push('Categories are required for Shutterstock');
    }
    
    // Validate categories against Shutterstock list
    const validCategories = platform.categories;
    if (metadata.categories) {
      // Handle different data types for categories
      let categoriesArray;
      if (Array.isArray(metadata.categories)) {
        categoriesArray = metadata.categories;
      } else if (typeof metadata.categories === 'string') {
        categoriesArray = metadata.categories.split(',');
      } else {
        categoriesArray = [String(metadata.categories)];
      }
      
      const categories = categoriesArray.map(cat => String(cat).trim());
      const invalidCategories = categories.filter(cat => !validCategories.includes(cat));
      if (invalidCategories.length > 0) {
        // Map common invalid categories to valid ones
        const categoryMappings = {
          'Landscapes': 'Nature',
          'Landscape': 'Nature',
          'Scenic': 'Nature',
          'Outdoor': 'Parks/Outdoor',
          'Outdoors': 'Parks/Outdoor',
          'Wildlife': 'Animals/Wildlife',
          'Architecture': 'Buildings/Landmarks',
          'Business': 'Business/Finance',
          'Technology': 'Technology',
          'Sports': 'Sports/Recreation',
          'Food': 'Food and drink',
          'People': 'People',
          'Abstract': 'Abstract',
          'Nature': 'Nature'
        };
        
        // Check if we can map invalid categories to valid ones
        const unmappableCategories = invalidCategories.filter(cat => !categoryMappings[cat]);
        
        if (unmappableCategories.length > 0) {
          errors.push(`Invalid categories: ${unmappableCategories.join(', ')}. Valid categories: ${validCategories.slice(0, 5).join(', ')}...`);
        }
      }
    }
  } else if (platformId === 'adobe_stock') {
    // Adobe Stock validation
    if (metadata.title && metadata.title.length > 200) {
      errors.push('Title must be 200 characters or less for Adobe Stock');
    }
    
    if (metadata.keywords) {
      const keywordCount = metadata.keywords.split(',').length;
      if (keywordCount > 49) {
        errors.push('Maximum 49 keywords allowed for Adobe Stock');
      }
    }
    
    if (metadata.category) {
      const categoryId = parseInt(metadata.category);
      if (isNaN(categoryId) || categoryId < 1 || categoryId > 21) {
        errors.push('Category must be a number between 1 and 21 for Adobe Stock');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
