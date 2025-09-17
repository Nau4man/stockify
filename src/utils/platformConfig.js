/**
 * Platform configuration for different stock photo platforms
 * Each platform has its own CSV format, validation rules, and requirements
 */

export const PLATFORMS = {
  SHUTTERSTOCK: {
    id: 'shutterstock',
    name: 'Shutterstock',
    description: 'Shutterstock-ready CSV format',
    csvHeaders: [
      'Filename',
      'Description', 
      'Keywords',
      'Categories',
      'Editorial',
      'Mature content',
      'Illustration'
    ],
    categories: [
      'Abstract', 'Animals/Wildlife', 'Arts', 'Backgrounds/Textures', 
      'Beauty/Fashion', 'Buildings/Landmarks', 'Business/Finance', 
      'Celebrities', 'Education', 'Food and drink', 'Healthcare/Medical', 
      'Holidays', 'Industrial', 'Interiors', 'Miscellaneous', 'Nature', 
      'Objects', 'Parks/Outdoor', 'People', 'Religion', 'Science', 
      'Signs/Symbols', 'Sports/Recreation', 'Technology', 'Transportation', 'Vintage'
    ],
    validation: {
      description: {
        required: true,
        maxLength: 200,
        minWords: 6,
        maxWords: 12
      },
      keywords: {
        required: true,
        minCount: 7,
        maxCount: 50,
        separator: ','
      },
      categories: {
        required: true,
        minCount: 1,
        maxCount: 2
      },
      editorial: {
        required: true,
        values: ['yes', 'no']
      },
      matureContent: {
        required: true,
        fixedValue: 'no'
      },
      illustration: {
        required: true,
        fixedValue: 'no'
      }
    },
    aiPrompt: {
      description: 'Generate a commercial description (6-12 words) or editorial format for news content',
      keywords: 'Include subjects, actions, concepts, style, location, and buyer-intent keywords',
      categories: 'Select 1-2 categories from the official Shutterstock list',
      editorial: 'Determine if content shows people, logos, brands, events, landmarks, or public figures'
    }
  },
  
  ADOBE_STOCK: {
    id: 'adobe_stock',
    name: 'Adobe Stock',
    description: 'Adobe Stock-ready CSV format',
    csvHeaders: [
      'Filename',
      'Title',
      'Keywords', 
      'Category',
      'Releases'
    ],
    categories: [
      { id: 1, name: 'Animals' },
      { id: 2, name: 'Buildings and Architecture' },
      { id: 3, name: 'Business' },
      { id: 4, name: 'Drinks' },
      { id: 5, name: 'The Environment' },
      { id: 6, name: 'States of Mind' },
      { id: 7, name: 'Food' },
      { id: 8, name: 'Graphic Resources' },
      { id: 9, name: 'Hobbies and Leisure' },
      { id: 10, name: 'Industry' },
      { id: 11, name: 'Landscapes' },
      { id: 12, name: 'Lifestyle' },
      { id: 13, name: 'People' },
      { id: 14, name: 'Plants and Flowers' },
      { id: 15, name: 'Culture and Religion' },
      { id: 16, name: 'Science' },
      { id: 17, name: 'Social Issues' },
      { id: 18, name: 'Sports' },
      { id: 19, name: 'Technology' },
      { id: 20, name: 'Transport' },
      { id: 21, name: 'Travel' }
    ],
    validation: {
      title: {
        required: false,
        maxLength: 200,
        description: 'Short and simple description of your asset'
      },
      keywords: {
        required: false,
        maxCount: 49,
        separator: ',',
        description: 'Comma-separated keywords, ordered by relevance'
      },
      category: {
        required: false,
        type: 'numeric',
        description: 'The numeric code for the asset category'
      },
      releases: {
        required: false,
        description: 'The name(s) of model or property releases'
      }
    },
    aiPrompt: {
      title: 'Generate a short, simple description (max 200 characters)',
      keywords: 'Include up to 49 relevant keywords, comma-separated, ordered by relevance',
      category: 'Select the most appropriate category and return its numeric ID',
      releases: 'Leave empty unless you can identify specific model or property releases'
    }
  }
};

export const DEFAULT_PLATFORM = 'shutterstock';

/**
 * Get platform configuration by ID
 */
export const getPlatformConfig = (platformId) => {
  return Object.values(PLATFORMS).find(platform => platform.id === platformId) || PLATFORMS.SHUTTERSTOCK;
};

/**
 * Get all available platforms
 */
export const getAvailablePlatforms = () => {
  return Object.values(PLATFORMS);
};

/**
 * Validate metadata against platform requirements
 */
export const validateMetadataForPlatform = (metadata, platformId) => {
  const platform = getPlatformConfig(platformId);
  const errors = [];
  
  if (!metadata.filename || metadata.filename.trim().length === 0) {
    errors.push('Filename is required');
  }
  
  // Platform-specific validation
  if (platform.id === 'shutterstock') {
    // Shutterstock validation
    if (!metadata.description || metadata.description.trim().length === 0) {
      errors.push('Description is required for Shutterstock');
    }
    
    if (!metadata.keywords || metadata.keywords.trim().length === 0) {
      errors.push('Keywords are required for Shutterstock');
    }
    
    if (!metadata.categories || metadata.categories.trim().length === 0) {
      errors.push('Categories are required for Shutterstock');
    }
    
    if (!metadata.editorial || !['yes', 'no'].includes(metadata.editorial.toLowerCase())) {
      errors.push('Editorial field must be "yes" or "no" for Shutterstock');
    }
  } else if (platform.id === 'adobe_stock') {
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
  
  return errors;
};

/**
 * Convert metadata from one platform format to another
 */
export const convertMetadataFormat = (metadata, fromPlatform, toPlatform) => {
  const converted = { ...metadata };
  
  if (fromPlatform === 'shutterstock' && toPlatform === 'adobe_stock') {
    // Convert Shutterstock to Adobe Stock
    converted.title = metadata.description || '';
    converted.keywords = metadata.keywords || '';
    converted.category = '';
    converted.releases = '';
    
    // Remove Shutterstock-specific fields
    delete converted.description;
    delete converted.categories;
    delete converted.editorial;
    delete converted.matureContent;
    delete converted.illustration;
  } else if (fromPlatform === 'adobe_stock' && toPlatform === 'shutterstock') {
    // Convert Adobe Stock to Shutterstock
    converted.description = metadata.title || '';
    converted.keywords = metadata.keywords || '';
    converted.categories = '';
    converted.editorial = 'no';
    converted.matureContent = 'no';
    converted.illustration = 'no';
    
    // Remove Adobe Stock-specific fields
    delete converted.title;
    delete converted.category;
    delete converted.releases;
  }
  
  return converted;
};
