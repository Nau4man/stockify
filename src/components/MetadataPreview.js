import React, { useState, useEffect, useCallback, useMemo } from 'react';

const MetadataPreview = ({
  metadata,
  isVisible,
  onEdit,
  isDarkMode = false,
  images = [],
  selectedImageIndex = 0,
  onImageSelect, 
  onImageClick,
  onRemoveImage,
  onSave,
  targetPlatform = 'shutterstock'
}) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isVisible || images.length === 0) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (selectedImageIndex > 0 && onImageSelect) {
          onImageSelect(selectedImageIndex - 1);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (selectedImageIndex < images.length - 1 && onImageSelect) {
          onImageSelect(selectedImageIndex + 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        if (onImageSelect) {
          onImageSelect(0);
        }
        break;
      case 'End':
        e.preventDefault();
        if (onImageSelect) {
          onImageSelect(images.length - 1);
        }
        break;
      case 'Delete':
        e.preventDefault();
        if (onRemoveImage) {
          onRemoveImage(selectedImageIndex);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onImageClick) {
          onImageClick(selectedImageIndex);
        }
        break;
      default:
        break;
    }
  }, [isVisible, images.length, selectedImageIndex, onImageSelect, onImageClick, onRemoveImage]);

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isVisible, handleKeyDown]);

  // Cache object URLs for faster thumbnail loading
  const imageUrls = useMemo(() => {
    return images.map(image => URL.createObjectURL(image));
  }, [images]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  // Handle image load events
  const handleImageLoad = useCallback((index) => {
    setLoadedImages(prev => new Set(prev).add(index));
  }, []);

  const handleImageError = useCallback((index) => {
    setLoadedImages(prev => new Set(prev).add(index));
  }, []);

  // Get the current metadata item based on selectedImageIndex
  const currentMetadata = metadata && Array.isArray(metadata) ? metadata[selectedImageIndex] : null;

  // Inline editing functions
  const handleEditForm = useCallback(() => {
    if (!currentMetadata) return;
    setIsEditing(true);
    setEditValues({
      description: currentMetadata.description || '',
      keywords: currentMetadata.keywords || '',
      categories: currentMetadata.categories || '',
      editorial: currentMetadata.editorial || 'no'
    });
  }, [currentMetadata]);

  const handleSaveForm = useCallback(() => {
    if (onSave && currentMetadata) {
      const updatedMetadata = {
        ...currentMetadata,
        ...editValues
      };
      onSave(updatedMetadata, selectedImageIndex);
    }
    setIsEditing(false);
    setEditValues({});
  }, [onSave, editValues, currentMetadata, selectedImageIndex]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditValues({});
  }, []);

  const handleInputChange = useCallback((fieldName, value) => {
    setEditValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);

  // Platform-specific validation rules
  const validationRules = useMemo(() => ({
    shutterstock: {
      description: {
        minLength: 10,
        maxLength: 200,
        required: true,
        message: 'Shutterstock: 10-200 characters required'
      },
      keywords: {
        minCount: 3,
        maxCount: 50,
        required: true,
        message: 'Shutterstock: 3-50 keywords required'
      },
      categories: {
        required: true,
        message: 'Shutterstock: At least one category required'
      }
    },
    getty_images: {
      description: {
        minLength: 20,
        maxLength: 500,
        required: true,
        message: 'Getty Images: 20-500 characters required'
      },
      keywords: {
        minCount: 5,
        maxCount: 30,
        required: true,
        message: 'Getty Images: 5-30 keywords required'
      },
      categories: {
        required: true,
        message: 'Getty Images: At least one category required'
      }
    },
    adobe_stock: {
      description: {
        minLength: 10,
        maxLength: 1000,
        required: true,
        message: 'Adobe Stock: 10-1000 characters required'
      },
      keywords: {
        minCount: 2,
        maxCount: 50,
        required: true,
        message: 'Adobe Stock: 2-50 keywords required'
      },
      categories: {
        required: false,
        message: 'Adobe Stock: Categories are optional'
      }
    },
    istock: {
      description: {
        minLength: 10,
        maxLength: 200,
        required: true,
        message: 'iStock: 10-200 characters required'
      },
      keywords: {
        minCount: 3,
        maxCount: 50,
        required: true,
        message: 'iStock: 3-50 keywords required'
      },
      categories: {
        required: true,
        message: 'iStock: At least one category required'
      }
    }
  }), []);

  // Validation function
  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[targetPlatform]?.[fieldName];
    if (!rules) return { isValid: true, message: '' };

    const errors = [];

    if (rules.required && (!value || value.trim().length === 0)) {
      errors.push(`${rules.message} - Field is required`);
    }

    if (value && value.trim().length > 0) {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${rules.message} - Need at least ${rules.minLength} characters (current: ${value.length})`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${rules.message} - Maximum ${rules.maxLength} characters allowed (current: ${value.length})`);
      }
      if (rules.minCount && fieldName === 'keywords') {
        const keywordCount = value.split(',').filter(k => k.trim().length > 0).length;
        if (keywordCount < rules.minCount) {
          errors.push(`${rules.message} - Need at least ${rules.minCount} keywords (current: ${keywordCount})`);
        }
      }
      if (rules.maxCount && fieldName === 'keywords') {
        const keywordCount = value.split(',').filter(k => k.trim().length > 0).length;
        if (keywordCount > rules.maxCount) {
          errors.push(`${rules.message} - Maximum ${rules.maxCount} keywords allowed (current: ${keywordCount})`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      message: errors.join('. ')
    };
  }, [validationRules, targetPlatform]);

  // Early returns after hooks
  if (!isVisible || !metadata || !Array.isArray(metadata)) return null;

  if (!currentMetadata) return null;

  // Reusable field component for form editing
  const FormField = ({ fieldName, label, value, isEditable = true, isTextarea = false }) => {
    const displayValue = isEditing ? (editValues[fieldName] || '') : (value || '');
    const validation = isEditing ? validateField(fieldName, displayValue) : { isValid: true, message: '' };
    const hasError = !validation.isValid;

    return (
      <div>
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
          {label}
          {isEditing && validationRules[targetPlatform]?.[fieldName]?.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        {isEditing ? (
          isTextarea ? (
            <textarea
              value={displayValue}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className={`w-full text-sm ${isDarkMode ? 'text-gray-200 bg-gray-700' : 'text-gray-900 bg-gray-50'} p-2 rounded border focus:ring-2 focus:border-transparent resize-none ${
                hasError 
                  ? `${isDarkMode ? 'border-red-500' : 'border-red-300'} focus:ring-red-500` 
                  : displayValue && !hasError
                    ? `${isDarkMode ? 'border-green-500' : 'border-green-300'} focus:ring-green-500`
                    : `${isDarkMode ? 'border-gray-600' : 'border-gray-200'} focus:ring-blue-500`
              }`}
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={displayValue}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className={`w-full text-sm ${isDarkMode ? 'text-gray-200 bg-gray-700' : 'text-gray-900 bg-gray-50'} p-2 rounded border focus:ring-2 focus:border-transparent ${
                hasError 
                  ? `${isDarkMode ? 'border-red-500' : 'border-red-300'} focus:ring-red-500` 
                  : displayValue && !hasError
                    ? `${isDarkMode ? 'border-green-500' : 'border-green-300'} focus:ring-green-500`
                    : `${isDarkMode ? 'border-gray-600' : 'border-gray-200'} focus:ring-blue-500`
              }`}
            />
          )
        ) : (
          <div className={`text-sm ${isDarkMode ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-900 bg-gray-50 border-gray-200'} p-2 rounded border`}>
            <span className={displayValue ? '' : `${isDarkMode ? 'text-gray-500' : 'text-gray-400'} italic`}>
              {displayValue || 'Empty'}
            </span>
          </div>
        )}
        {isEditing && (
          <div className="mt-1">
            {hasError ? (
              <p className="text-xs text-red-500">
                {validation.message}
              </p>
            ) : displayValue ? (
              <p className="text-xs text-green-500">
                ✓ {validationRules[targetPlatform]?.[fieldName]?.message || 'Valid'}
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                {validationRules[targetPlatform]?.[fieldName]?.message || 'Enter value to validate'}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Metadata Preview
          </h3>
          {currentMetadata.filename && (
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
              Showing metadata for: <span className="font-medium">{currentMetadata.filename}</span>
            </p>
          )}
          {images.length > 1 && (
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              Image {selectedImageIndex + 1} of {images.length}
            </p>
          )}
        </div>
               {!currentMetadata.error && currentMetadata.filename && (
                 <div className="flex space-x-2">
                   {!isEditing ? (
                     <button
                       onClick={handleEditForm}
                       className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                     >
                       Edit
                     </button>
                   ) : (
                     <>
                       <button
                         onClick={handleSaveForm}
                         className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                       >
                         Save
                       </button>
                       <button
                         onClick={handleCancelEdit}
                         className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                       >
                         Cancel
                       </button>
                     </>
                   )}
                 </div>
               )}
      </div>

      {/* Main Content Layout: Thumbnails on Left, Metadata on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Image Thumbnails */}
        {images.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`text-md font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Images ({images.length})
              </h4>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedImageIndex + 1} of {images.length} selected
                </span>
              </div>
            </div>
          
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-3 gap-1">
              {images.map((image, index) => {
                const isSelected = index === selectedImageIndex;
                const hasError = metadata[index]?.error;
                
                return (
                  <div
                    key={index}
                    className={`relative group cursor-pointer ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 ring-offset-2' 
                        : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                    } ${isDarkMode ? 'ring-offset-gray-800' : 'ring-offset-white'}`}
                    onClick={() => onImageSelect && onImageSelect(index)}
                  >
                    {/* Thumbnail Image */}
                    <div className={`relative ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg overflow-hidden aspect-square`}>
                      {!loadedImages.has(index) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                          <div className="relative">
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-6 h-6 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                          </div>
                        </div>
                      )}
                      <img
                        src={imageUrls[index]}
                        alt={image.name}
                        className="w-full h-full object-cover"
                        onLoad={() => handleImageLoad(index)}
                        onError={() => handleImageError(index)}
                        style={{ opacity: loadedImages.has(index) ? 1 : 0 }}
                      />
                      
                      {/* Error Overlay */}
                      {hasError && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <div className="bg-red-500 text-white rounded-full p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onImageClick && onImageClick(index);
                            }}
                            className={`p-2 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-lg`}
                            title="View full size"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </button>
                          {hasError && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // This would need to be passed as a prop for retry functionality
                                console.log('Retry image:', index);
                              }}
                              className={`p-2 ${isDarkMode ? 'bg-yellow-800 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} rounded-lg shadow-lg`}
                              title="Retry processing"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveImage && onRemoveImage(index);
                            }}
                            className={`p-2 ${isDarkMode ? 'bg-red-800 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} rounded-lg shadow-lg`}
                            title="Remove image"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-blue-500 text-white rounded-full p-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Image Info */}
                    <div className="mt-1">
                      <p className={`text-xs font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {image.name}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {(image.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                      {hasError && (
                        <p className="text-xs text-red-500 truncate">
                          {metadata[index]?.message || 'Processing failed'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Navigation Controls */}
            {images.length > 1 && (
              <div className="flex items-center justify-center mt-4 space-x-4">
                <button
                  onClick={() => onImageSelect && onImageSelect(Math.max(0, selectedImageIndex - 1))}
                  disabled={selectedImageIndex === 0}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedImageIndex === 0
                      ? `${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                      : `${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`
                  }`}
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} px-4`}>
                  {selectedImageIndex + 1} / {images.length}
                </span>
                
                <button
                  onClick={() => onImageSelect && onImageSelect(Math.min(images.length - 1, selectedImageIndex + 1))}
                  disabled={selectedImageIndex === images.length - 1}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedImageIndex === images.length - 1
                      ? `${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                      : `${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`
                  }`}
                >
                  Next
                  <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

               {/* Right Side: Metadata Fields */}
               <div className="lg:col-span-3">
                 <div className="flex items-center justify-between mb-4">
                   <h4 className={`text-md font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                     Metadata Fields
                   </h4>
                   {isEditing && (
                     <div className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                       <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                         Validating for: <span className="font-medium capitalize">{targetPlatform}</span>
                       </span>
                     </div>
                   )}
                 </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Filename
              </label>
              <p className={`text-sm ${isDarkMode ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-900 bg-gray-50 border-gray-200'} p-2 rounded border`}>
                {currentMetadata.filename}
              </p>
            </div>
            
            <FormField
              fieldName="description"
              label="Description"
              value={currentMetadata.description}
              isTextarea={true}
            />
            
            <FormField
              fieldName="keywords"
              label="Keywords"
              value={currentMetadata.keywords}
            />
            
            <FormField
              fieldName="categories"
              label="Categories"
              value={currentMetadata.categories}
            />
            
            <FormField
              fieldName="editorial"
              label="Editorial"
              value={currentMetadata.editorial}
            />
            
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
          
          {images.length > 0 && (
            <div className={`mt-4 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                This is a preview of the selected image's metadata ({currentMetadata.filename}). 
                The complete CSV will include metadata for all {images.length} images.
              </p>
              {currentMetadata.error && (
                <div className={`mt-2 p-2 ${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border rounded-lg`}>
                  <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                    ⚠️ This image failed to process: {currentMetadata.message || 'Unknown error'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetadataPreview;