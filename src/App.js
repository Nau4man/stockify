import React, { useState, useCallback, useEffect, useRef } from 'react';
import FileUpload from './components/FileUpload';
import ProgressBar from './components/ProgressBar';
import MetadataPreview from './components/MetadataPreview';
import ImageModal from './components/ImageModal';
import CSVPreview from './components/CSVPreview';
import FailedImages from './components/FailedImages';
import ToastContainer from './components/ToastContainer';
import { generateMultipleImageMetadata, retryImageMetadata, DEFAULT_MODEL, GEMINI_MODELS } from './utils/geminiApi';
import { generateCSV, downloadCSV, validateMetadata } from './utils/csvGenerator';
import { getRateLimitedModels } from './utils/rateLimitTracker';
import { getPlatformConfig, getAvailablePlatforms } from './utils/platformConfig';
import debugEnv from './debug-env';

function App() {
  const [images, setImages] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentFile: '' });
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCSVPreview, setShowCSVPreview] = useState(false);
  const [retryingImages, setRetryingImages] = useState(new Set());
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [selectedPlatform, setSelectedPlatform] = useState('shutterstock');
  const [rateLimitNotification, setRateLimitNotification] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showApiConfiguration, setShowApiConfiguration] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);
  const [showPlatformInfoModal, setShowPlatformInfoModal] = useState(false);
  const [useDemoData, setUseDemoData] = useState(false);
  
  // Debug platform state changes
  useEffect(() => {
    console.log('Platform changed to:', selectedPlatform);
  }, [selectedPlatform]);

  // Demo data generation for development
  const generateDemoMetadata = useCallback((imageFiles) => {
    const demoData = {
      shutterstock: [
        {
          filename: "beautiful-sunset-landscape.jpg",
          description: "Stunning golden hour sunset over rolling hills with dramatic clouds",
          keywords: "sunset, landscape, golden hour, hills, clouds, nature, sky, dramatic, beautiful, peaceful, outdoor, scenic, horizon, warm light, countryside",
          categories: "Nature, Landscapes",
          editorial: "no",
          matureContent: "no",
          illustration: "no"
        },
        {
          filename: "modern-office-workspace.jpg",
          description: "Clean modern office space with laptop and coffee cup on desk",
          keywords: "office, workspace, modern, laptop, coffee, desk, business, work, technology, clean, minimalist, professional, productivity, corporate",
          categories: "Business/Finance, Technology",
          editorial: "no",
          matureContent: "no",
          illustration: "no"
        },
        {
          filename: "happy-family-picnic.jpg",
          description: "Joyful family enjoying outdoor picnic in sunny park",
          keywords: "family, picnic, outdoor, park, happy, children, parents, food, nature, fun, together, sunny, grass, trees, lifestyle",
          categories: "People, Lifestyle",
          editorial: "no",
          matureContent: "no",
          illustration: "no"
        }
      ],
      adobe_stock: [
        {
          filename: "urban-cityscape-night.jpg",
          title: "Modern city skyline at night with illuminated buildings",
          keywords: "city, skyline, night, urban, buildings, lights, modern, architecture, downtown, metropolis, neon, street, urban life",
          category: "2",
          releases: "",
          matureContent: "no",
          illustration: "no"
        },
        {
          filename: "healthy-salad-bowl.jpg",
          title: "Fresh green salad with vegetables and dressing",
          keywords: "salad, healthy, food, vegetables, fresh, green, nutrition, diet, organic, restaurant, meal, lunch, dinner",
          category: "7",
          releases: "",
          matureContent: "no",
          illustration: "no"
        },
        {
          filename: "athlete-running-track.jpg",
          title: "Athletic runner on outdoor track during training",
          keywords: "athlete, running, track, sports, fitness, training, exercise, outdoor, speed, movement, health, competition, athletic",
          category: "18",
          releases: "Model release available",
          matureContent: "no",
          illustration: "no"
        }
      ]
    };

    return imageFiles.map((file, index) => {
      const platformData = demoData[selectedPlatform] || demoData.shutterstock;
      const demoItem = platformData[index % platformData.length];
      return {
        ...demoItem,
        filename: file.name,
        originalFile: file
      };
    });
  }, [selectedPlatform]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showModelSelector && !event.target.closest('.model-selector-container')) {
        setShowModelSelector(false);
      }
      if (showPlatformSelector && !event.target.closest('.platform-selector-container')) {
        setShowPlatformSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModelSelector, showPlatformSelector]);
  const imagesRef = useRef([]);
  const fileInputRef = useRef(null);
  
  // Toast management functions
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    console.log('Adding toast:', { message, type, duration });
    const id = Date.now() + Math.random();
    setToasts(prev => {
      const newToasts = [...prev, { id, message, type, duration }];
      console.log('Toast state updated:', newToasts.length, 'toasts');
      return newToasts;
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Theme toggle function
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // Auto-clear error when no failed images remain
  useEffect(() => {
    if (metadata.length > 0) {
      const hasFailedImages = metadata.some(item => item.error);
      if (!hasFailedImages && error) {
        setError(null);
      }
    }
  }, [metadata, error]);

  // Update imagesRef whenever images state changes
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);


  // Check for rate limited models and show notifications
  useEffect(() => {
    const rateLimitedModels = getRateLimitedModels();
    if (rateLimitedModels.length > 0) {
      const modelNames = rateLimitedModels.map(m => GEMINI_MODELS[m.modelKey]?.name || m.modelKey).join(', ');
      setRateLimitNotification({
        type: 'warning',
        message: `Rate limit reached for: ${modelNames}. These models will be available again tomorrow.`,
        models: rateLimitedModels
      });
    } else {
      setRateLimitNotification(null);
    }
  }, [selectedModel]); // Re-check when model selection changes

  // Handle file selection
  const handleFilesSelected = useCallback((selectedImages) => {
    console.log('handleFilesSelected called with:', selectedImages);
    console.log('selectedImages length:', selectedImages.length);
    console.log('selectedImages details:', selectedImages.map(img => ({
      name: img.name,
      size: img.size,
      type: img.type
    })));
    
    // Get current images from state (more reliable than ref)
    console.log('Current images from state:', images.length);
    console.log('Current images details:', images.map(img => ({
      name: img.name,
      size: img.size,
      type: img.type
    })));
    
    // Check for duplicates based on name, size, and type
    const newImages = selectedImages.filter(newImage => {
      const isDuplicate = images.some(existingImage => 
        existingImage.name === newImage.name &&
        existingImage.size === newImage.size &&
        existingImage.type === newImage.type
      );
      console.log(`Checking ${newImage.name}: isDuplicate = ${isDuplicate}`);
      return !isDuplicate;
    });

    const duplicateCount = selectedImages.length - newImages.length;
    const addedCount = newImages.length;
    
    console.log('New images to add:', addedCount, 'Duplicates:', duplicateCount);
    console.log('New images details:', newImages.map(img => ({
      name: img.name,
      size: img.size,
      type: img.type
    })));
    
    // Show feedback messages
    if (duplicateCount > 0 && addedCount > 0) {
      console.log('Showing warning toast');
      addToast(`${addedCount} image(s) added successfully. ${duplicateCount} duplicate(s) skipped.`, 'warning');
    } else if (duplicateCount > 0 && addedCount === 0) {
      console.log('Showing error toast');
      addToast(`Image already uploaded! ${duplicateCount} duplicate(s) skipped.`, 'error');
    } else if (addedCount > 0) {
      console.log('Showing success toast');
      addToast(`${addedCount} image(s) added successfully!`, 'success');
    }

    // Update images state
    console.log('Updating images state with new images:', newImages.length);
    setImages(prevImages => {
      const updatedImages = [...prevImages, ...newImages];
      console.log('Updated images count:', updatedImages.length);
      return updatedImages;
    });
    setShowPreview(false);
    // Reset selected image index to 0 when new images are added
    setSelectedImageIndex(0);
  }, [addToast, images]);

  // Handle model selection change
  const handleModelChange = useCallback((newModel) => {
    setSelectedModel(newModel);
    setError(null); // Clear any previous errors when switching models
  }, []);


  // Remove individual image and its corresponding metadata
  const handleRemoveImage = useCallback((index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setMetadata(prevMetadata => {
      const newMetadata = prevMetadata.filter((_, i) => i !== index);
      
      // Clear error if no failed images remain
      const hasFailedImages = newMetadata.some(item => item.error);
      if (!hasFailedImages) {
        setError(null);
      }
      
      return newMetadata;
    });
    
    // Adjust selected image index if necessary
    setSelectedImageIndex(prevIndex => {
      if (index < prevIndex) {
        // If we removed an image before the selected one, shift the index down
        return prevIndex - 1;
      } else if (index === prevIndex) {
        // If we removed the selected image, go to the previous image or 0
        return Math.max(0, prevIndex - 1);
      }
      // If we removed an image after the selected one, keep the same index
      return prevIndex;
    });
  }, []);

  // Clear all images
  const handleClearAll = useCallback(() => {
    console.log('Clearing all images and resetting file input');
    setImages([]);
    setMetadata([]);
    setShowPreview(false);
    setError(null);
    setSelectedImageIndex(0);
    
    // Reset the file input to allow re-uploading the same files
    if (fileInputRef.current) {
      fileInputRef.current.clear();
      console.log('File input cleared via ref method');
    }
  }, []);

  // Process images with AI
  const handleProcessImages = useCallback(async () => {
    // Debug environment variables
    const envDebug = debugEnv();
    console.log('Environment Debug:', envDebug);
    console.log('Current selectedModel:', selectedModel);
    console.log('Available GEMINI_MODELS:', Object.keys(GEMINI_MODELS));
    
    if (images.length === 0) {
      addToast('Please upload at least one image', 'error');
      return;
    }

    // Validate images before processing
    const validImages = images.filter(img => {
      if (!img || !img.name) {
        console.warn('Invalid image file:', img);
        return false;
      }
      return true;
    });

    if (validImages.length === 0) {
      setError('No valid images found. Please upload valid image files.');
      return;
    }

    if (validImages.length !== images.length) {
      console.warn(`Filtered out ${images.length - validImages.length} invalid images`);
    }

    setIsProcessing(true);
    setError(null);
    setProgress({ current: 0, total: validImages.length, currentFile: '' });

    try {
      let result;

      if (useDemoData) {
        // Use demo data for development
        console.log('Using demo data for development...');
        
        // Simulate processing delay
        for (let i = 0; i < validImages.length; i++) {
          setProgress({ current: i + 1, total: validImages.length, currentFile: validImages[i].name });
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay per image
        }
        
        result = generateDemoMetadata(validImages);
      } else {
        // Use real API calls
        console.log('Calling generateMultipleImageMetadata with:', {
          validImages: validImages.length,
          selectedModel,
          availableModels: Object.keys(GEMINI_MODELS),
          selectedPlatform
        });
        
        result = await generateMultipleImageMetadata(
          validImages,
          (current, total, currentFile) => {
            setProgress({ current, total, currentFile });
          },
          selectedModel,
          Object.keys(GEMINI_MODELS),
          selectedPlatform
        );
      }

      setMetadata(result);
      setShowPreview(true);

      // Show error summary if there were errors
      const errors = result.filter(item => item.error);
      if (errors.length > 0) {
        const errorSummary = errors.map(err => `${err.filename}: ${err.message || err.originalError}`).join('; ');
        addToast(`Processing completed with ${errors.length} error(s)`, 'error', 6000);
        setError(`Processing completed with ${errors.length} error(s): ${errorSummary}`);
      } else {
        const message = useDemoData 
          ? 'Demo data generated successfully!'
          : 'All images processed successfully!';
        addToast(message, 'success');
      }

      // Show success message
      const successful = result.filter(item => !item.error).length;
      if (successful > 0) {
        console.log(`Successfully processed ${successful} out of ${result.length} images`);
      }

    } catch (err) {
      console.error('Error processing images:', err);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to process images. ';
      
      if (err.message.includes('API key')) {
        errorMessage += 'Please check your Gemini API key configuration.';
      } else if (err.message.includes('rate limit')) {
        errorMessage += 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (err.message.includes('network')) {
        errorMessage += 'Network error. Please check your internet connection.';
      } else if (err.message.includes('timeout')) {
        errorMessage += 'Request timed out. Please try again.';
      } else {
        errorMessage += 'Please check your API configuration and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0, currentFile: '' });
    }
  }, [images, addToast, selectedModel, selectedPlatform, useDemoData, generateDemoMetadata]);


  // Handle image click for modal
  const handleImageClick = useCallback((imageOrIndex) => {
    let image, imageIndex;
    
    if (typeof imageOrIndex === 'number') {
      // If it's an index, get the image from the array
      imageIndex = imageOrIndex;
      image = images[imageIndex];
    } else {
      // If it's an image object, find its index
      image = imageOrIndex;
      imageIndex = images.findIndex(img => img === image);
    }
    
    if (image && imageIndex >= 0) {
      setSelectedImage(image);
      setCurrentImageIndex(imageIndex);
      setShowImageModal(true);
    }
  }, [images]);

  // Handle image navigation in modal
  const handleImageNavigate = useCallback((newIndex) => {
    if (newIndex >= 0 && newIndex < images.length) {
      setCurrentImageIndex(newIndex);
      setSelectedImage(images[newIndex]);
    }
  }, [images]);

  // Handle metadata edit (now handled by inline editing)
  const handleEditMetadata = useCallback((metadataItem) => {
    // This function is kept for compatibility but inline editing handles everything
    console.log('Edit metadata requested for:', metadataItem);
  }, []);

  const handleSaveMetadata = useCallback((updatedMetadata, index = null) => {
    if (index !== null) {
      // Update specific index (for inline editing)
      setMetadata(prev => prev.map((item, i) => 
        i === index ? updatedMetadata : item
      ));
    } else {
      // Update by filename (fallback for compatibility)
      setMetadata(prev => prev.map(item => 
        item.filename === updatedMetadata.filename ? updatedMetadata : item
      ));
    }
  }, []);

  // Show CSV preview
  const handleShowCSVPreview = useCallback(() => {
    if (metadata.length === 0) {
      setError('No metadata available to preview');
      return;
    }
    setShowCSVPreview(true);
  }, [metadata]);

  // Retry failed image processing
  const handleRetryImage = useCallback(async (imageFile, metadataIndex) => {
    if (retryingImages.has(metadataIndex)) return; // Prevent duplicate retries
    
    setRetryingImages(prev => new Set(prev).add(metadataIndex));
    
    try {
      const newMetadata = await retryImageMetadata(imageFile, selectedModel, Object.keys(GEMINI_MODELS), selectedPlatform);
      
      setMetadata(prevMetadata => {
        const updatedMetadata = prevMetadata.map((item, index) => 
          index === metadataIndex ? newMetadata : item
        );
        
        // Clear error if no failed images remain after successful retry
        const hasFailedImages = updatedMetadata.some(item => item.error);
        if (!hasFailedImages) {
          setError(null);
        }
        
        return updatedMetadata;
      });
    } catch (error) {
      console.error('Retry failed:', error);
      setError(`Retry failed for ${imageFile.name}: ${error.message}`);
    } finally {
      setRetryingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(metadataIndex);
        return newSet;
      });
    }
  }, [retryingImages, selectedModel, selectedPlatform]);

  // Retry all failed images
  const handleRetryAllFailed = useCallback(async () => {
    const failedIndices = metadata
      .map((item, index) => item.error ? index : null)
      .filter(index => index !== null);
    
    if (failedIndices.length === 0) return;
    
    // Add all failed indices to retrying set
    setRetryingImages(new Set(failedIndices));
    
    try {
      const retryPromises = failedIndices.map(async (index) => {
        const imageFile = images[index];
        const newMetadata = await retryImageMetadata(imageFile, selectedModel, Object.keys(GEMINI_MODELS), selectedPlatform);
        return { index, newMetadata };
      });
      
      const results = await Promise.all(retryPromises);
      
      setMetadata(prevMetadata => {
        const newMetadata = [...prevMetadata];
        results.forEach(({ index, newMetadata: result }) => {
          newMetadata[index] = result;
        });
        
        // Clear error if no failed images remain after retry all
        const hasFailedImages = newMetadata.some(item => item.error);
        if (!hasFailedImages) {
          setError(null);
        }
        
        return newMetadata;
      });
    } catch (error) {
      console.error('Retry all failed:', error);
      setError(`Some retries failed: ${error.message}`);
    } finally {
      setRetryingImages(new Set());
    }
  }, [metadata, images, selectedModel, selectedPlatform]);

  // Handle footer navigation
  const handleFooterNavigation = useCallback((section) => {
    const element = document.getElementById(section);
    if (element) {
      const headerHeight = 120; // Approximate header height
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // Download CSV
  const handleDownloadCSV = useCallback(() => {
    if (metadata.length === 0) {
      setError('No metadata available to download');
      return;
    }

    try {
      // Filter out error metadata for CSV generation
      const validMetadata = metadata.filter(item => !item.error);
      const errorMetadata = metadata.filter(item => item.error);

      if (validMetadata.length === 0) {
        setError('No valid metadata available to download. All images failed to process.');
        return;
      }

      // Show warning if some images had errors
      if (errorMetadata.length > 0) {
        console.warn(`Skipping ${errorMetadata.length} images with errors in CSV generation`);
      }

      // Validate all valid metadata before generating CSV
      const validationErrors = [];
      validMetadata.forEach((item, index) => {
        const validation = validateMetadata(item);
        if (!validation.isValid) {
          validationErrors.push(`Image ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      if (validationErrors.length > 0) {
        setError(`Validation errors: ${validationErrors.join('; ')}`);
        return;
      }

      const csvContent = generateCSV(validMetadata, selectedPlatform);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `shutterstock_metadata_${timestamp}.csv`;
      
      downloadCSV(csvContent, filename, selectedPlatform);
      setShowCSVPreview(false);
      
      // Show success message
      console.log(`CSV downloaded successfully: ${filename} (${validMetadata.length} images)`);
      addToast(`CSV downloaded successfully! (${validMetadata.length} images)`, 'success');
      
    } catch (err) {
      console.error('Error generating CSV:', err);
      addToast(`Failed to generate CSV file: ${err.message}`, 'error');
      setError(`Failed to generate CSV file: ${err.message}`);
    }
  }, [metadata, selectedPlatform, addToast]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      {/* Enhanced Header */}
      <header className={`${isDarkMode ? 'bg-gray-900/90 border-gray-700/20' : 'bg-white/90 border-white/20'} backdrop-blur-xl shadow-lg border-b sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Header */}
          <div className="flex items-center justify-between py-6">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group hover:shadow-xl transition-all duration-300">
                <svg className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-white via-blue-300 to-purple-300' : 'from-gray-900 via-blue-800 to-purple-800'} bg-clip-text text-transparent`}>
                  Stockify
                </h1>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1 text-sm sm:text-base`}>
                  AI-Powered Stock Photo Metadata Generator
                </p>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center space-x-4">
              {/* Processing Status */}
              {isProcessing && (
                <div className={`flex items-center space-x-2 ${isDarkMode ? 'bg-blue-900/30 text-blue-300 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200'} px-3 py-2 rounded-lg border`}>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              )}

              {/* Images Count */}
              {images.length > 0 && (
                <div className={`flex items-center space-x-2 ${isDarkMode ? 'bg-green-900/30 text-green-300 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} px-3 py-2 rounded-lg border`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">{images.length} image{images.length !== 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Quick Actions */}
              {images.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleClearAll}
                    disabled={isProcessing}
                    className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'} rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Clear all images"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Theme Switch Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/20' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'} rounded-lg transition-all duration-200`}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Help Button */}
              <button
                onClick={() => setShowHelp(true)}
                className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/20' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'} rounded-lg transition-all duration-200`}
                title="Help & Documentation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} py-3`}>
            <nav className="flex items-center justify-end">
              
              <div className="flex items-center space-x-4">
                {/* Demo Data Toggle */}
                <div className="flex items-center space-x-2">
                  <label className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <input
                      type="checkbox"
                      checked={useDemoData}
                      onChange={(e) => setUseDemoData(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span>Demo Data</span>
                  </label>
                </div>

                {/* Platform Selector */}
                <div className="relative platform-selector-container">
                  <button
                    onClick={() => setShowPlatformSelector(!showPlatformSelector)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white hover:border-blue-400' 
                        : 'bg-white border-gray-300 text-gray-900 hover:border-blue-500'
                    }`}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">{getPlatformConfig(selectedPlatform)?.name || selectedPlatform}</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${showPlatformSelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Platform Dropdown */}
                  {showPlatformSelector && (
                    <div className={`absolute right-0 top-full mt-1 w-64 rounded-lg border shadow-lg z-50 ${
                      isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                      <div className="p-1">
                        {getAvailablePlatforms().map((platform) => (
                          <button
                            key={platform.id}
                            onClick={() => {
                              setSelectedPlatform(platform.id);
                              setShowPlatformSelector(false);
                            }}
                            className={`w-full px-3 py-2 text-left rounded-md transition-colors duration-200 ${
                              selectedPlatform === platform.id 
                                ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                                : (isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-900')
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">{platform.name}</div>
                                <div className={`text-xs ${selectedPlatform === platform.id ? 'text-white/80' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                                  {platform.description}
                                </div>
                              </div>
                              {selectedPlatform === platform.id && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                        
                        {/* Help Button */}
                        <div className="border-t border-gray-200 dark:border-gray-600 mt-1 pt-1">
                          <button
                            onClick={() => {
                              setShowPlatformInfoModal(true);
                              setShowPlatformSelector(false);
                            }}
                            className={`w-full px-3 py-2 text-left rounded-md transition-colors duration-200 flex items-center gap-2 ${
                              isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                                : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">Platform Requirements</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Model Selector */}
                <div className="relative model-selector-container">
                  <button
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white hover:border-blue-400' 
                        : 'bg-white border-gray-300 text-gray-900 hover:border-blue-500'
                    }`}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">{GEMINI_MODELS[selectedModel]?.name || selectedModel}</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${showModelSelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Model Dropdown */}
                  {showModelSelector && (
                    <div className={`absolute right-0 top-full mt-1 w-64 rounded-lg border shadow-lg z-50 ${
                      isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                      <div className="p-1">
                        {Object.entries(GEMINI_MODELS).map(([key, model]) => (
                          <button
                            key={key}
                            onClick={() => {
                              handleModelChange(key);
                              setShowModelSelector(false);
                            }}
                            className={`w-full px-3 py-2 text-left rounded-md transition-colors duration-200 ${
                              selectedModel === key 
                                ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                                : (isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-900')
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">{model.name}</div>
                                <div className={`text-xs ${selectedModel === key ? 'text-white/80' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                                  {model.dailyLimit} requests/day
                                </div>
                              </div>
                              {selectedModel === key && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <div id="upload" className={`${isDarkMode ? 'bg-gray-800/70 border-gray-700/20' : 'bg-white/70 border-white/20'} backdrop-blur-sm rounded-2xl shadow-xl border p-8 scroll-mt-32`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Upload Images
              </h2>
            </div>
            <FileUpload 
              onFilesSelected={handleFilesSelected}
              isProcessing={isProcessing}
              isDarkMode={isDarkMode}
              ref={fileInputRef}
            />
            
            {images.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={handleProcessImages}
                  disabled={isProcessing}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span className="font-semibold">Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="font-semibold">Process Images with AI</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Rate Limit Notification */}
          {rateLimitNotification && (
            <div className={`${isDarkMode ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-200'} border rounded-lg p-4`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className={`h-5 w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>Rate Limit Notice</h3>
                  <div className={`mt-2 text-sm ${isDarkMode ? 'text-amber-100' : 'text-amber-700'}`}>
                    <p>{rateLimitNotification.message}</p>
                    {rateLimitNotification.models && (
                      <div className="mt-2">
                        {rateLimitNotification.models.map((model, index) => (
                          <div key={index} className={`flex items-center text-xs ${isDarkMode ? 'text-amber-100' : 'text-amber-700'}`}>
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                            {GEMINI_MODELS[model.modelKey]?.name}: {model.formattedTime}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Progress Bar */}
          <ProgressBar
            current={progress.current}
            total={progress.total}
            currentFileName={progress.currentFile}
            isVisible={isProcessing}
            isDarkMode={isDarkMode}
          />

          {/* Image Management Summary - Only show if images are uploaded */}
          {images.length > 0 && (
            <div id="preview" className={`${isDarkMode ? 'bg-gray-800/70 border-gray-700/20' : 'bg-white/70 border-white/20'} backdrop-blur-sm rounded-2xl shadow-xl border p-6 scroll-mt-32`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {images.length} Image{images.length !== 1 ? 's' : ''} Uploaded
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {metadata.length > 0 
                        ? `${metadata.filter(item => !item.error).length} processed successfully`
                        : 'Click "Process Images with AI" to generate metadata'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {metadata.length > 0 && metadata.some(item => !item.error) && (
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                        showPreview 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {showPreview ? 'Hide Metadata' : 'View & Edit Metadata'}
                      </span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleClearAll}
                    disabled={isProcessing}
                    className={`px-4 py-2 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium">Clear All</span>
                  </button>
                </div>
              </div>
            </div>
          )}



          {/* Failed Images with Retry Options */}
          {metadata.length > 0 && metadata.some(item => item.error) && (
            <FailedImages 
              metadata={metadata}
              images={images}
              onRetry={handleRetryImage}
              retryingImages={retryingImages}
              onRetryAll={handleRetryAllFailed}
              onRemoveImage={handleRemoveImage}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Metadata Preview - Only show if there are images and user wants to see it */}
          {showPreview && images.length > 0 && (
            <MetadataPreview 
              metadata={metadata}
              isVisible={showPreview}
              onEdit={handleEditMetadata}
              onSave={handleSaveMetadata}
              isDarkMode={isDarkMode}
              images={images}
              selectedImageIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
              targetPlatform={selectedPlatform}
              onRemoveImage={handleRemoveImage}
              onImageClick={handleImageClick}
            />
          )}

          {/* Download Section - Only show if there are successful images */}
          {metadata.length > 0 && !isProcessing && metadata.some(item => !item.error) && (
            <div id="download" className={`${isDarkMode ? 'bg-gray-800/70 border-gray-700/20' : 'bg-white/70 border-white/20'} backdrop-blur-sm rounded-2xl shadow-xl border p-8 scroll-mt-32`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Download CSV
                </h2>
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Your stock photo metadata CSV file is ready for download. 
                This file contains metadata for {metadata.filter(item => !item.error).length} successful image{metadata.filter(item => !item.error).length !== 1 ? 's' : ''}.
                {metadata.some(item => item.error) && (
                  <span className="text-orange-600 block mt-1">
                    {metadata.filter(item => item.error).length} image{metadata.filter(item => item.error).length !== 1 ? 's' : ''} failed to process and will be excluded.
                  </span>
                )}
              </p>

              {/* Processing Summary */}
              <div className={`${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4 mb-6`}>
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-3 flex items-center gap-2`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Processing Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {metadata.filter(item => !item.error).length}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {metadata.filter(item => item.error).length}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {getPlatformConfig(selectedPlatform)?.name || selectedPlatform}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Platform</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {GEMINI_MODELS[selectedModel]?.name || selectedModel}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>AI Model</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleShowCSVPreview}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-semibold">Preview CSV</span>
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold">Download CSV</span>
                </button>
              </div>
            </div>
          )}

          {/* How to Use Section */}
          <div id="help" className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'} border rounded-2xl p-8 scroll-mt-32`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                How to Use Stockify
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Step-by-Step Guide */}
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-blue-900'} mb-4`}>
                  Step-by-Step Guide
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload Images</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Drag and drop or select multiple image files (JPG, PNG, etc.)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Choose AI Model</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Select your preferred Gemini model for processing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Process with AI</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Click "Process Images with AI" to generate metadata</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Review & Edit</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Check metadata preview and edit if needed</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Download CSV</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Get your stock photo metadata CSV file</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips & Best Practices */}
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-blue-900'} mb-4`}>
                  Tips & Best Practices
                </h3>
                <div className="space-y-4">
                  <div className={`${isDarkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-white/70 border-blue-100'} rounded-lg p-4 border`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>📸 Image Quality</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Use high-quality images for better AI analysis and metadata generation.</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-white/70 border-blue-100'} rounded-lg p-4 border`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>🏷️ File Naming</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Descriptive filenames help AI understand image content better.</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-white/70 border-blue-100'} rounded-lg p-4 border`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>⚡ Batch Processing</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Process multiple images at once for efficiency.</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-white/70 border-blue-100'} rounded-lg p-4 border`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>🔧 API Configuration</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Configure your Gemini API key in <code className={`${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-blue-100 text-gray-800'} px-1 rounded text-xs`}>src/utils/geminiApi.js</code></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-t mt-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Brand Section */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className={`text-xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-white via-blue-300 to-purple-300' : 'from-gray-900 via-blue-800 to-purple-800'} bg-clip-text text-transparent`}>
                    Stockify
                  </h3>
                </div>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm leading-relaxed mb-4`}>
                  Generate professional stock photo metadata with AI-powered precision. 
                  Optimized for major stock photo platforms including Shutterstock, Adobe Stock, Getty Images, and more.
                </p>
                <div className={`flex items-center space-x-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>Powered by</span>
                  <span className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Google Gemini AI</span>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider mb-4`}>
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  <li>
                    <button 
                      onClick={() => handleFooterNavigation('upload')}
                      className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200 text-left`}
                    >
                      Upload Images
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleFooterNavigation('preview')}
                      className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200 text-left`}
                    >
                      Preview Metadata
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleFooterNavigation('download')}
                      className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200 text-left`}
                    >
                      Download CSV
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleFooterNavigation('help')}
                      className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200 text-left`}
                    >
                      Help & Support
                    </button>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider mb-4`}>
                  Resources
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a href="https://support.submit.shutterstock.com/s/article/Submission-and-Account-Guidelines?language=en_US" target="_blank" rel="noopener noreferrer" className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200`}>
                      Stock Platform Guidelines
                    </a>
                  </li>
                  <li>
                    <a href="https://ai.google.dev/docs" target="_blank" rel="noopener noreferrer" className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200`}>
                      Gemini API Docs
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support & Info */}
              <div>
                <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider mb-4`}>
                  Support
                </h4>
                <ul className="space-y-3">
                  <li>
                    <button 
                      onClick={() => setShowDocumentation(true)}
                      className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200 text-left`}
                    >
                      Documentation
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setShowApiConfiguration(true)}
                      className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200 text-left`}
                    >
                      API Configuration
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setShowPrivacyPolicy(true)}
                      className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200 text-left`}
                    >
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setShowTermsOfService(true)}
                      className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200 text-left`}
                    >
                      Terms of Service
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} py-6`}>
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className={`flex items-center space-x-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>© 2025 Stockify. All rights reserved.</span>
                <span>•</span>
                <span>Version 1.0.0</span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* GitHub Link */}
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-gray-400 hover:${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}
                  title="View on GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                
                {/* Status Indicator */}
                <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ImageModal
        image={selectedImage}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        images={images}
        currentIndex={currentImageIndex}
        onNavigate={handleImageNavigate}
        isDarkMode={isDarkMode}
      />


      <CSVPreview
        metadata={metadata}
        isVisible={showCSVPreview}
        onClose={() => setShowCSVPreview(false)}
        onDownload={handleDownloadCSV}
        isDarkMode={isDarkMode}
        platformId={selectedPlatform}
      />
      
      {/* Help Modal */}
      {showHelp && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowHelp(false)}
        >
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Help & Documentation
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Everything you need to know about using Stockify
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors duration-200`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Start */}
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                    🚀 Quick Start
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload Images</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Drag and drop or select multiple image files</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Process with AI</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Click "Process Images with AI" to generate metadata</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Download CSV</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Get your stock photo metadata CSV file</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                    ✨ Key Features
                  </h3>
                  <div className="space-y-3">
                    <div className={`${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg p-3`}>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🤖 AI-Powered</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Uses Google Gemini AI for intelligent metadata generation</p>
                    </div>
                    <div className={`${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} rounded-lg p-3`}>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📊 Stock Platform Ready</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Generates CSV files compatible with major stock photo platform requirements</p>
                    </div>
                    <div className={`${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-lg p-3`}>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>⚡ Batch Processing</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Process multiple images simultaneously</p>
                    </div>
                    <div className={`${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'} rounded-lg p-3`}>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>✏️ Editable</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Review and edit generated metadata before download</p>
                    </div>
                  </div>
                </div>

                {/* API Configuration */}
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                    🔧 API Configuration
                  </h3>
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                      To use Stockify, you need to configure your Google Gemini API key:
                    </p>
                    <ol className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-2`}>
                      <li>1. Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} hover:underline`}>Google AI Studio</a></li>
                      <li>2. Open <code className={`${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'} px-1 rounded text-xs`}>src/utils/geminiApi.js</code></li>
                      <li>3. Replace <code className={`${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'} px-1 rounded text-xs`}>YOUR_API_KEY_HERE</code> with your actual API key</li>
                    </ol>
                  </div>
                </div>

                {/* Troubleshooting */}
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                    🔍 Troubleshooting
                  </h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-red-400 pl-4">
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>API Key Error</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Make sure your Gemini API key is correctly configured</p>
                    </div>
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rate Limit</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Switch to a different model or wait for the limit to reset</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Image Processing Failed</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Check image format and try again with the retry button</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>Need more help? Check out the full documentation or contact support.</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowHelp(false);
                      handleFooterNavigation('help');
                    }}
                    className={`px-4 py-2 ${isDarkMode ? 'text-blue-400 bg-gray-600 border-gray-500 hover:bg-gray-500' : 'text-blue-600 bg-white border-blue-200 hover:bg-blue-50'} border rounded-lg transition-colors duration-200`}
                  >
                    View Full Guide
                  </button>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowPrivacyPolicy(false)}
        >
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Privacy Policy
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Last updated: January 2025
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPrivacyPolicy(false)}
                  className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors duration-200`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose prose-gray max-w-none">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>1. Information We Collect</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  Stockify is designed with privacy in mind. We collect minimal information necessary to provide our service:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• <strong>Images:</strong> Only the images you upload for metadata generation. Images are processed locally in your browser and sent to Google's Gemini API for analysis.</li>
                  <li>• <strong>Usage Data:</strong> Basic usage statistics to improve our service (processed images count, error rates).</li>
                  <li>• <strong>Technical Data:</strong> Browser type, device information, and IP address for service optimization.</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>2. How We Use Your Information</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  We use the collected information solely to:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• Generate metadata for your images using AI technology</li>
                  <li>• Provide and maintain our service</li>
                  <li>• Improve user experience and service quality</li>
                  <li>• Ensure service security and prevent abuse</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>3. Data Storage and Security</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  Your privacy and data security are our top priorities:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• <strong>No Permanent Storage:</strong> Images are processed in real-time and not stored on our servers</li>
                  <li>• <strong>Local Processing:</strong> Image analysis happens in your browser before being sent to Google's API</li>
                  <li>• <strong>Secure Transmission:</strong> All data transmission uses HTTPS encryption</li>
                  <li>• <strong>Third-Party Services:</strong> We use Google's Gemini API for AI processing, subject to Google's privacy policy</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>4. Third-Party Services</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  Stockify integrates with the following third-party services:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• <strong>Google Gemini API:</strong> For AI-powered image analysis and metadata generation</li>
                  <li>• <strong>Google AI Studio:</strong> For API key management and usage tracking</li>
                </ul>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  These services have their own privacy policies. We recommend reviewing Google's privacy policy for information about how they handle your data.
                </p>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>5. Your Rights</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  You have the following rights regarding your personal information:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• <strong>Access:</strong> Request information about what data we have collected</li>
                  <li>• <strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li>• <strong>Portability:</strong> Request a copy of your data in a portable format</li>
                  <li>• <strong>Correction:</strong> Request correction of inaccurate personal data</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>6. Cookies and Tracking</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  Stockify uses minimal cookies for essential functionality:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• <strong>Essential Cookies:</strong> For basic website functionality and user preferences</li>
                  <li>• <strong>Analytics:</strong> Anonymous usage statistics to improve our service</li>
                  <li>• <strong>No Advertising:</strong> We do not use tracking cookies for advertising purposes</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>7. Children's Privacy</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  Stockify is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>8. Changes to This Policy</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>9. Contact Us</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  If you have any questions about this Privacy Policy, please contact us through our support channels or by email.
                </p>
              </div>
            </div>

            <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>By using Stockify, you agree to this Privacy Policy.</p>
                </div>
                <button
                  onClick={() => setShowPrivacyPolicy(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTermsOfService && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowTermsOfService(false)}
        >
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Terms of Service
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated: January 2025
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTermsOfService(false)}
                  className={`p-2 text-gray-400 hover:${isDarkMode ? 'text-gray-400' : 'text-gray-600'} hover:bg-gray-100 rounded-lg transition-colors duration-200`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose prose-gray max-w-none">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>1. Acceptance of Terms</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  By accessing and using Stockify ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>2. Description of Service</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  Stockify is an AI-powered web application that generates metadata for stock photography. The service:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• Analyzes uploaded images using Google's Gemini AI technology</li>
                  <li>• Generates descriptive metadata including titles, descriptions, keywords, and categories</li>
                  <li>• Exports metadata in CSV format compatible with stock photography platforms</li>
                  <li>• Provides editing capabilities for generated metadata</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>3. User Responsibilities</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  As a user of Stockify, you agree to:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• Only upload images that you own or have the right to use</li>
                  <li>• Not upload copyrighted material without proper authorization</li>
                  <li>• Not use the service for illegal or unauthorized purposes</li>
                  <li>• Provide accurate information when configuring API settings</li>
                  <li>• Respect the intellectual property rights of others</li>
                  <li>• Not attempt to reverse engineer or compromise the service</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>4. API Usage and Third-Party Services</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  Stockify integrates with third-party services:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• <strong>Google Gemini API:</strong> Users must provide their own API key and are subject to Google's terms of service</li>
                  <li>• <strong>Rate Limits:</strong> API usage is subject to Google's rate limits and pricing</li>
                  <li>• <strong>Data Processing:</strong> Images are processed by Google's AI services according to their privacy policy</li>
                </ul>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  You are responsible for your own API usage costs and compliance with third-party terms of service.
                </p>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>5. Intellectual Property</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  Regarding intellectual property:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• <strong>Your Content:</strong> You retain all rights to images you upload</li>
                  <li>• <strong>Generated Metadata:</strong> You own the metadata generated for your images</li>
                  <li>• <strong>Service IP:</strong> Stockify's software, design, and functionality remain our intellectual property</li>
                  <li>• <strong>AI Technology:</strong> The underlying AI technology is provided by Google and subject to their terms</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>6. Service Availability</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  We strive to provide reliable service but cannot guarantee:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• Continuous availability of the service</li>
                  <li>• Accuracy of AI-generated metadata</li>
                  <li>• Compatibility with all image formats or sizes</li>
                  <li>• Performance of third-party API services</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>7. Limitation of Liability</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  Stockify is provided "as is" without warranties of any kind. We shall not be liable for:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• Any loss or damage resulting from use of the service</li>
                  <li>• Inaccurate or inappropriate metadata generation</li>
                  <li>• Third-party service interruptions or failures</li>
                  <li>• Data loss or corruption</li>
                  <li>• Indirect, incidental, or consequential damages</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>8. Prohibited Uses</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  You may not use Stockify:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>• To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>• To submit false or misleading information</li>
                  <li>• To upload or transmit viruses or any other type of malicious code</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>9. Termination</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>10. Changes to Terms</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>11. Contact Information</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  If you have any questions about these Terms of Service, please contact us through our support channels.
                </p>
              </div>
            </div>

            <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>By using Stockify, you agree to these Terms of Service.</p>
                </div>
                <button
                  onClick={() => setShowTermsOfService(false)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  I Agree
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documentation Modal */}
      {showDocumentation && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowDocumentation(false)}
        >
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Stockify Documentation
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Complete guide to using Stockify for AI-powered metadata generation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDocumentation(false)}
                  className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors duration-200`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose prose-gray max-w-none">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📖 Getting Started</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  Stockify is an AI-powered web application that automatically generates metadata for your stock photography images. Here's everything you need to know to get started:
                </p>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🚀 Quick Start Guide</h3>
                <div className={`${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-6`}>
                  <ol className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} space-y-2`}>
                    <li><strong>1. Configure API:</strong> Set up your Google Gemini API key in the API Configuration section</li>
                    <li><strong>2. Upload Images:</strong> Drag and drop or select multiple images (JPG, PNG, WebP)</li>
                    <li><strong>3. Select Model:</strong> Choose your preferred Gemini AI model</li>
                    <li><strong>4. Process Images:</strong> Click "Process Images" to generate metadata</li>
                    <li><strong>5. Review & Edit:</strong> Preview and edit generated metadata as needed</li>
                    <li><strong>6. Download CSV:</strong> Export your metadata in stock platform-ready format</li>
                  </ol>
                </div>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🖼️ Supported Image Formats</h3>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• <strong>JPEG/JPG:</strong> Most common format, excellent for photographs</li>
                  <li>• <strong>PNG:</strong> Great for images with transparency</li>
                  <li>• <strong>WebP:</strong> Modern format with excellent compression</li>
                  <li>• <strong>Maximum Size:</strong> 10MB per image (recommended: under 5MB for faster processing)</li>
                  <li>• <strong>Resolution:</strong> Any resolution supported (AI works best with clear, high-quality images)</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🤖 AI Models Available</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className={`${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'} border rounded-lg p-4`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-900'} mb-2`}>Gemini 2.5 Flash-Lite</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} mb-2`}>Recommended</p>
                    <ul className={`text-xs ${isDarkMode ? 'text-blue-200' : 'text-blue-600'} space-y-1`}>
                      <li>• Fastest processing</li>
                      <li>• Best for most images</li>
                      <li>• 1,500 requests/day</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Gemini 2.0 Flash-Lite</h4>
                    <p className="text-xs text-green-700 mb-2">Alternative</p>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• Good performance</li>
                      <li>• Reliable results</li>
                      <li>• 1,500 requests/day</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Gemini 1.5 Pro</h4>
                    <p className="text-xs text-purple-700 mb-2">Advanced</p>
                    <ul className="text-xs text-purple-600 space-y-1">
                      <li>• Most detailed analysis</li>
                      <li>• Complex images</li>
                      <li>• 50 requests/day</li>
                    </ul>
                  </div>
                </div>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📊 Generated Metadata Fields</h3>
                <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 mb-6`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Required Fields:</h4>
                      <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                        <li>• <strong>Filename:</strong> Original image filename</li>
                        <li>• <strong>Description:</strong> 6-12 word commercial description</li>
                        <li>• <strong>Keywords:</strong> 7-50 relevant keywords</li>
                        <li>• <strong>Categories:</strong> 1-2 stock platform categories</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Fixed Fields:</h4>
                      <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                        <li>• <strong>Editorial:</strong> Auto-determined (Yes/No)</li>
                        <li>• <strong>Mature Content:</strong> Always "No"</li>
                        <li>• <strong>Illustration:</strong> Always "No"</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>✏️ Editing Metadata</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  You can edit any generated metadata before downloading:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• <strong>Click any image thumbnail</strong> to select it for editing</li>
                  <li>• <strong>Use the Metadata Editor</strong> to modify descriptions, keywords, and categories</li>
                  <li>• <strong>Preview changes</strong> in the Metadata Preview panel</li>
                  <li>• <strong>CSV Preview</strong> shows how your data will look in the final export</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📁 CSV Export Format</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  The exported CSV file is formatted for major stock photo platforms and includes:
                </p>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
                  <pre className="text-xs">
{`Filename,Description,Keywords,Categories,Editorial,Mature content,Illustration
image1.jpg,Beautiful sunset over mountains,landscape,sunset,mountains,nature,sky,photography,outdoor,scenic,travel,adventure,No,No,No
image2.jpg,Modern office workspace interior,office,workspace,interior,modern,business,desk,computer,professional,corporate,productivity,No,No,No`}
                  </pre>
                </div>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>⚡ Performance Tips</h3>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• <strong>Batch Processing:</strong> Process multiple images at once for efficiency</li>
                  <li>• <strong>Image Quality:</strong> Use clear, well-lit images for better AI analysis</li>
                  <li>• <strong>File Size:</strong> Keep images under 5MB for faster processing</li>
                  <li>• <strong>Model Selection:</strong> Use Gemini 2.5 Flash-Lite for best speed/quality balance</li>
                  <li>• <strong>Rate Limits:</strong> Monitor your API usage to avoid hitting daily limits</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🔧 Troubleshooting</h3>
                <div className={`${isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4 mb-6`}>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-yellow-200' : 'text-yellow-900'} mb-2`}>Common Issues:</h4>
                  <ul className={`text-sm ${isDarkMode ? 'text-yellow-100' : 'text-yellow-800'} space-y-2`}>
                    <li>• <strong>API Key Error:</strong> Ensure your Gemini API key is valid and has sufficient quota</li>
                    <li>• <strong>Rate Limit:</strong> Switch to a different model or wait for daily reset</li>
                    <li>• <strong>Image Upload Failed:</strong> Check file format and size (max 10MB)</li>
                    <li>• <strong>Processing Failed:</strong> Try a different image or model</li>
                    <li>• <strong>CSV Download Issues:</strong> Ensure you have processed at least one image successfully</li>
                  </ul>
                </div>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📞 Support & Resources</h3>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• <strong>Google Gemini API:</strong> <a href="https://ai.google.dev/docs" target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Official Documentation</a></li>
                  <li>• <strong>Stock Platform Guidelines:</strong> <a href="https://support.submit.shutterstock.com/s/article/Submission-and-Account-Guidelines?language=en_US" target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Submission and Account Guidelines</a></li>
                  <li>• <strong>API Configuration:</strong> Check the API Configuration modal for setup instructions</li>
                  <li>• <strong>Privacy Policy:</strong> Review our privacy practices and data handling</li>
                </ul>
              </div>
            </div>

            <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>Need more help? Check the API Configuration guide or contact support.</p>
                </div>
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Configuration Modal */}
      {showApiConfiguration && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowApiConfiguration(false)}
        >
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      API Configuration Guide
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Set up Google Gemini API for AI-powered metadata generation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApiConfiguration(false)}
                  className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors duration-200`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose prose-gray max-w-none">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🔑 Getting Your API Key</h3>
                <div className={`${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-6`}>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-900'} mb-2`}>Step-by-Step Guide:</h4>
                  <ol className={`text-sm ${isDarkMode ? 'text-blue-100' : 'text-blue-800'} space-y-2`}>
                    <li><strong>1.</strong> Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} underline`}>Google AI Studio</a></li>
                    <li><strong>2.</strong> Sign in with your Google account</li>
                    <li><strong>3.</strong> Click "Create API Key"</li>
                    <li><strong>4.</strong> Copy the generated API key</li>
                    <li><strong>5.</strong> Paste it in the API Key field below</li>
                  </ol>
                </div>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>⚙️ Configuration Steps</h3>
                <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 mb-6`}>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>1. Set Your API Key</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    Open the file <code className={`${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'} px-2 py-1 rounded text-xs`}>src/utils/geminiApi.js</code> and replace the placeholder:
                  </p>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4 overflow-x-auto">
                    <pre className="text-xs">
{`// Replace this line:
const GEMINI_API_KEY = 'YOUR_API_KEY_HERE';

// With your actual API key:
const GEMINI_API_KEY = 'AIzaSyB...';`}
                    </pre>
                  </div>
                  <div className={`${isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-3`}>
                    <p className={`text-sm ${isDarkMode ? 'text-yellow-100' : 'text-yellow-800'}`}>
                      <strong>⚠️ Security Note:</strong> Never commit your API key to version control. Consider using environment variables for production.
                    </p>
                  </div>
                </div>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📊 API Usage & Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Gemini 2.5 Flash-Lite</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• <strong>Free Tier:</strong> 1,500 requests/day</li>
                      <li>• <strong>Cost:</strong> $0.075 per 1M tokens</li>
                      <li>• <strong>Speed:</strong> Fastest</li>
                      <li>• <strong>Best For:</strong> Most images</li>
                    </ul>
                  </div>
                  <div className={`${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'} border rounded-lg p-4`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-900'} mb-2`}>Gemini 2.0 Flash-Lite</h4>
                    <ul className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'} space-y-1`}>
                      <li>• <strong>Free Tier:</strong> 1,500 requests/day</li>
                      <li>• <strong>Cost:</strong> $0.075 per 1M tokens</li>
                      <li>• <strong>Speed:</strong> Fast</li>
                      <li>• <strong>Best For:</strong> Alternative option</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Gemini 1.5 Pro</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• <strong>Free Tier:</strong> 50 requests/day</li>
                      <li>• <strong>Cost:</strong> $1.25 per 1M tokens</li>
                      <li>• <strong>Speed:</strong> Slower</li>
                      <li>• <strong>Best For:</strong> Complex analysis</li>
                    </ul>
                  </div>
                </div>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>💰 Billing & Quotas</h3>
                <div className={`${isDarkMode ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4 mb-6`}>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-orange-200' : 'text-orange-900'} mb-2`}>Important Billing Information:</h4>
                  <ul className={`text-sm ${isDarkMode ? 'text-orange-100' : 'text-orange-800'} space-y-2`}>
                    <li>• <strong>Free Tier:</strong> Each model has daily request limits</li>
                    <li>• <strong>Paid Usage:</strong> Charges apply after free tier limits</li>
                    <li>• <strong>Billing:</strong> Set up billing in Google Cloud Console</li>
                    <li>• <strong>Monitoring:</strong> Track usage in Google AI Studio</li>
                    <li>• <strong>Cost Control:</strong> Set usage alerts and limits</li>
                  </ul>
                </div>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🔧 Troubleshooting API Issues</h3>
                <div className="space-y-4 mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">❌ Common Errors:</h4>
                    <ul className="text-sm text-red-800 space-y-2">
                      <li>• <strong>"Invalid API Key":</strong> Check that your key is correct and active</li>
                      <li>• <strong>"Quota Exceeded":</strong> You've hit your daily limit - wait for reset or upgrade</li>
                      <li>• <strong>"Permission Denied":</strong> Ensure Gemini API is enabled in your project</li>
                      <li>• <strong>"Rate Limited":</strong> Too many requests - wait a moment and retry</li>
                    </ul>
                  </div>
                  
                  <div className={`${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-green-200' : 'text-green-900'} mb-2`}>✅ Solutions:</h4>
                    <ul className={`text-sm ${isDarkMode ? 'text-green-100' : 'text-green-800'} space-y-2`}>
                      <li>• <strong>Verify API Key:</strong> Double-check the key in geminiApi.js</li>
                      <li>• <strong>Enable APIs:</strong> Ensure Gemini API is enabled in Google Cloud Console</li>
                      <li>• <strong>Check Quotas:</strong> Monitor usage in Google AI Studio</li>
                      <li>• <strong>Switch Models:</strong> Try a different model if one is rate-limited</li>
                      <li>• <strong>Wait for Reset:</strong> Daily limits reset at midnight UTC</li>
                    </ul>
                  </div>
                </div>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>🛡️ Security Best Practices</h3>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 space-y-2`}>
                  <li>• <strong>Never share your API key</strong> publicly or in code repositories</li>
                  <li>• <strong>Use environment variables</strong> for production deployments</li>
                  <li>• <strong>Set up billing alerts</strong> to monitor unexpected charges</li>
                  <li>• <strong>Regularly rotate API keys</strong> for enhanced security</li>
                  <li>• <strong>Monitor usage patterns</strong> for unusual activity</li>
                </ul>

                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📚 Additional Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Google Documentation:</h4>
                    <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                      <li>• <a href="https://ai.google.dev/docs" target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Gemini API Docs</a></li>
                      <li>• <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>AI Studio</a></li>
                      <li>• <a href="https://cloud.google.com/apis" target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Google Cloud APIs</a></li>
                    </ul>
                  </div>
                  <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Stockify Resources:</h4>
                    <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                      <li>• <button onClick={() => {setShowApiConfiguration(false); setShowDocumentation(true);}} className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Full Documentation</button></li>
                      <li>• <button onClick={() => {setShowApiConfiguration(false); setShowHelp(true);}} className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>How to Use Guide</button></li>
                      <li>• <button onClick={() => {setShowApiConfiguration(false); setShowPrivacyPolicy(true);}} className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Privacy Policy</button></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>Need help? Check the full documentation or contact support.</p>
                </div>
                <button
                  onClick={() => setShowApiConfiguration(false)}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                >
                  I'm Ready
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Info Modal */}
      {showPlatformInfoModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowPlatformInfoModal(false)}
        >
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getPlatformConfig(selectedPlatform)?.name} Requirements
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Detailed platform specifications and CSV format information
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPlatformInfoModal(false)}
                  className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors duration-200`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Platform Information */}
                <div className={`p-6 ${isDarkMode ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 border-gray-600' : 'bg-gradient-to-br from-white via-gray-50 to-white border-gray-200'} border-2 rounded-3xl shadow-xl backdrop-blur-sm`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/10">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getPlatformConfig(selectedPlatform)?.name} Format
                        </h4>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                          Optimized
                        </div>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                        {getPlatformConfig(selectedPlatform)?.description}
                      </p>
                      
                      {/* CSV Headers */}
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className={`w-4 h-4 ${isDarkMode ? 'opacity-60' : 'opacity-70'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            CSV Headers ({getPlatformConfig(selectedPlatform)?.csvHeaders.length})
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getPlatformConfig(selectedPlatform)?.csvHeaders.map((header, index) => (
                            <span 
                              key={index}
                              className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 hover:scale-105 ${
                                isDarkMode 
                                  ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 border border-gray-500 hover:from-gray-600 hover:to-gray-500 hover:shadow-lg' 
                                  : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-300 hover:from-gray-200 hover:to-gray-100 hover:shadow-md'
                              }`}
                            >
                              {header}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform-specific requirements */}
                {selectedPlatform === 'adobe_stock' && (
                  <div className={`p-6 ${isDarkMode ? 'bg-gradient-to-br from-amber-900/20 via-orange-900/15 to-red-900/10 border-amber-500/50' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-amber-300'} border-2 rounded-2xl shadow-lg backdrop-blur-sm`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 ${isDarkMode ? 'bg-gradient-to-br from-amber-600 to-orange-600' : 'bg-gradient-to-br from-amber-500 to-orange-500'} rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/10 flex-shrink-0`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                            Adobe Stock Requirements
                          </p>
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-amber-600/20 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                            Creative
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-amber-800/30' : 'bg-amber-100/50'} border ${isDarkMode ? 'border-amber-600/30' : 'border-amber-200'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              <span className={`text-xs font-semibold ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>Title</span>
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-amber-100' : 'text-amber-700'}`}>Max 200 characters</p>
                          </div>
                          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-amber-800/30' : 'bg-amber-100/50'} border ${isDarkMode ? 'border-amber-600/30' : 'border-amber-200'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              <span className={`text-xs font-semibold ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>Keywords</span>
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-amber-100' : 'text-amber-700'}`}>Max 49 keywords</p>
                          </div>
                          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-amber-800/30' : 'bg-amber-100/50'} border ${isDarkMode ? 'border-amber-600/30' : 'border-amber-200'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              <span className={`text-xs font-semibold ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>Category</span>
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-amber-100' : 'text-amber-700'}`}>Numeric code (1-21)</p>
                          </div>
                          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-amber-800/30' : 'bg-amber-100/50'} border ${isDarkMode ? 'border-amber-600/30' : 'border-amber-200'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              <span className={`text-xs font-semibold ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>Optional</span>
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-amber-100' : 'text-amber-700'}`}>All except Filename</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedPlatform === 'shutterstock' && (
                  <div className={`p-6 ${isDarkMode ? 'bg-gradient-to-br from-blue-900/20 via-indigo-900/15 to-purple-900/10 border-blue-500/50' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-300'} border-2 rounded-2xl shadow-lg backdrop-blur-sm`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-500'} rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/10 flex-shrink-0`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                            Shutterstock Requirements
                          </p>
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-blue-600/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                            Editorial
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-800/30' : 'bg-blue-100/50'} border ${isDarkMode ? 'border-blue-600/30' : 'border-blue-200'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className={`text-xs font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Description</span>
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-blue-100' : 'text-blue-700'}`}>6-12 words</p>
                          </div>
                          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-800/30' : 'bg-blue-100/50'} border ${isDarkMode ? 'border-blue-600/30' : 'border-blue-200'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className={`text-xs font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Keywords</span>
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-blue-100' : 'text-blue-700'}`}>7-50 keywords</p>
                          </div>
                          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-800/30' : 'bg-blue-100/50'} border ${isDarkMode ? 'border-blue-600/30' : 'border-blue-200'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className={`text-xs font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Categories</span>
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-blue-100' : 'text-blue-700'}`}>1-2 from official list</p>
                          </div>
                          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-800/30' : 'bg-blue-100/50'} border ${isDarkMode ? 'border-blue-600/30' : 'border-blue-200'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className={`text-xs font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Editorial</span>
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-blue-100' : 'text-blue-700'}`}>Yes/No based on content</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;
