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
 * Download CSV file
 */
export const downloadCSV = (csvContent, filename = 'stock_metadata.csv', platformId = 'shutterstock') => {
  const platform = getPlatformConfig(platformId);
  const platformName = platform.name.toLowerCase().replace(/\s+/g, '_');
  const defaultFilename = `${platformName}_metadata.csv`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || defaultFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
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
    
    if (!metadata.categories || metadata.categories.trim().length === 0) {
      errors.push('Categories are required for Shutterstock');
    }
    
    // Validate categories against Shutterstock list
    const validCategories = platform.categories;
    if (metadata.categories) {
      const categories = metadata.categories.split(',').map(cat => cat.trim());
      const invalidCategories = categories.filter(cat => !validCategories.includes(cat));
      if (invalidCategories.length > 0) {
        errors.push(`Invalid categories: ${invalidCategories.join(', ')}`);
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
