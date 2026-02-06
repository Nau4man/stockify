import React, { useState, useCallback, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import FileUpload from './components/FileUpload';
import ProgressBar from './components/ProgressBar';
import MetadataPreview from './components/MetadataPreview';
import ImageModal from './components/ImageModal';
import CSVPreview from './components/CSVPreview';
import FailedImages from './components/FailedImages';
import ToastContainer from './components/ToastContainer';
import { generateMultipleImageMetadata, retryImageMetadata, DEFAULT_MODEL, GEMINI_MODELS } from './utils/geminiApi';
import { generateCSV, downloadCSV, showCSVInNewWindow, validateMetadata, fixCategoryMappings } from './utils/csvGenerator';
import { getRateLimitedModels, isModelRateLimited, getNextAvailableModel, hasAvailableModels } from './utils/rateLimitTracker';
import { getPlatformConfig, getAvailablePlatforms } from './utils/platformConfig';
import { saveDraftMetadata, loadDraftMetadata, clearDraftMetadata, hasDraft, savePreferences, loadPreferences, formatRelativeTime } from './utils/storageManager';
import { trackApiError, trackError, ErrorCategory, ErrorSeverity } from './utils/errorTracker';

const HelpModal = lazy(() => import('./components/modals/HelpModal'));
const DocumentationModal = lazy(() => import('./components/modals/DocumentationModal'));
const ApiConfigurationModal = lazy(() => import('./components/modals/ApiConfigurationModal'));
const PrivacyPolicyModal = lazy(() => import('./components/modals/PrivacyPolicyModal'));
const TermsOfServiceModal = lazy(() => import('./components/modals/TermsOfServiceModal'));
const PlatformInfoModal = lazy(() => import('./components/modals/PlatformInfoModal'));

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
  // Initialize with DEFAULT_MODEL, but validate it exists
  const [selectedModel, setSelectedModel] = useState(() => {
    // Ensure the default model exists in GEMINI_MODELS
    if (GEMINI_MODELS[DEFAULT_MODEL]) {
      return DEFAULT_MODEL;
    }
    // Fallback to first available model
    return Object.keys(GEMINI_MODELS)[0];
  });
  const [lastProcessingModel, setLastProcessingModel] = useState(DEFAULT_MODEL);
  const [selectedPlatform, setSelectedPlatform] = useState('shutterstock');
  const [rateLimitNotification, setRateLimitNotification] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showApiConfiguration, setShowApiConfiguration] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const prefs = loadPreferences();
    return prefs.darkMode ?? false;
  });
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);
  const [showPlatformInfoModal, setShowPlatformInfoModal] = useState(false);
  const [useDemoData, setUseDemoData] = useState(false);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [draftInfo, setDraftInfo] = useState(null);
  const rateLimitModelName = useMemo(() => {
    return GEMINI_MODELS[lastProcessingModel]?.name || lastProcessingModel;
  }, [lastProcessingModel]);
  const successfulMetadata = useMemo(() => {
    return metadata.filter(item => item && !item.error);
  }, [metadata]);
  const failedMetadata = useMemo(() => {
    return metadata.filter(item => item && item.error);
  }, [metadata]);
  

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

  // Ref to track retrying images synchronously (prevents race conditions on rapid clicks)
  const retryingImagesRef = useRef(new Set());
  
  // Validate and fix selected model if it doesn't exist (handles hot reload issues)
  useEffect(() => {
    if (!GEMINI_MODELS[selectedModel]) {
      const validModel = Object.keys(GEMINI_MODELS)[0];
      console.warn(`Invalid model "${selectedModel}" detected, switching to "${validModel}"`);
      setSelectedModel(validModel);
    }
  }, [selectedModel]);

  // Toast management functions
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Theme toggle function
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      savePreferences({ darkMode: newValue });
      return newValue;
    });
  }, []);

  // Auto-clear error when no failed images remain
  useEffect(() => {
    if (metadata.length > 0) {
      if (failedMetadata.length === 0 && error) {
        setError(null);
      }
    }
  }, [metadata, failedMetadata, error]);

  // Update imagesRef whenever images state changes
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Cleanup Object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Revoke all Object URLs when component unmounts
      imagesRef.current.forEach(image => {
        if (image?.url) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, []);

  // Check for saved draft on mount
  useEffect(() => {
    const draft = hasDraft();
    if (draft && draft.count > 0) {
      setDraftInfo(draft);
      setShowDraftRecovery(true);
    }
  }, []);

  // Auto-save metadata when it changes (debounced)
  useEffect(() => {
    if (metadata.length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const imageNames = images.map(img => img.name);
      saveDraftMetadata(metadata, imageNames);
    }, 1000); // Debounce by 1 second

    return () => clearTimeout(timeoutId);
  }, [metadata, images]);

  // Save preferences when platform or model changes
  useEffect(() => {
    savePreferences({ platform: selectedPlatform, model: selectedModel });
  }, [selectedPlatform, selectedModel]);

  // Check for rate limited models and show notifications
  useEffect(() => {
    const rateLimitedModels = getRateLimitedModels();
    if (rateLimitedModels.length > 0) {
      const modelName = GEMINI_MODELS[rateLimitedModels[0].modelKey]?.name || rateLimitedModels[0].modelKey;
      setRateLimitNotification({
        type: 'warning',
        message: `Rate limit reached for ${modelName}. This model will be available again tomorrow.`,
        models: rateLimitedModels
      });
    } else {
      setRateLimitNotification(null);
    }
  }, [selectedModel]); // Re-check when model selection changes

  const existingImageKeys = useMemo(() => {
    return new Set(images.map(image => `${image.name}|${image.size}|${image.type}`));
  }, [images]);



  // Handle file selection
  const handleFilesSelected = useCallback((selectedImages) => {
    const seenKeys = new Set(existingImageKeys);
    const newImages = selectedImages.filter((newImage) => {
      const key = `${newImage.name}|${newImage.size}|${newImage.type}`;
      if (seenKeys.has(key)) {
        return false;
      }
      seenKeys.add(key);
      return true;
    });

    const duplicateCount = selectedImages.length - newImages.length;
    const addedCount = newImages.length;

    // Show feedback messages
    if (duplicateCount > 0 && addedCount > 0) {
      addToast(`${addedCount} image(s) added successfully. ${duplicateCount} duplicate(s) skipped.`, 'warning');
    } else if (duplicateCount > 0 && addedCount === 0) {
      addToast(`Image already uploaded! ${duplicateCount} duplicate(s) skipped.`, 'error');
    } else if (addedCount > 0) {
      addToast(`${addedCount} image(s) added successfully!`, 'success');
    }

    // Create image objects with URLs from File objects
    const imageObjects = newImages.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));

    // Update images state
    setImages(prevImages => [...prevImages, ...imageObjects]);
    // Only reset selected image index if current selection is invalid
    setSelectedImageIndex(prevIndex => {
      // If current selection is still valid (has metadata), keep it
      if (prevIndex < images.length && metadata[prevIndex] && !metadata[prevIndex].error) {
        return prevIndex;
      }
      // Otherwise, find the first processed image or default to 0
      const firstProcessedIndex = metadata.findIndex(item => item && !item.error);
      return firstProcessedIndex >= 0 ? firstProcessedIndex : 0;
    });
  }, [addToast, existingImageKeys, images, metadata]);

  // Handle model selection change
  const handleModelChange = useCallback((newModel) => {
    setSelectedModel(newModel);
    setError(null); // Clear any previous errors when switching models
  }, []);

  // Handle draft recovery - restore saved metadata
  const handleRestoreDraft = useCallback(() => {
    const draft = loadDraftMetadata();
    if (draft && draft.metadata) {
      setMetadata(draft.metadata);
      setShowPreview(true);
      setShowDraftRecovery(false);
      addToast(`Restored ${draft.metadata.length} item(s) from your last session`, 'success');
    }
  }, [addToast]);

  // Handle draft recovery - dismiss
  const handleDismissDraft = useCallback(() => {
    clearDraftMetadata();
    setShowDraftRecovery(false);
    setDraftInfo(null);
  }, []);

  // Remove individual image and its corresponding metadata
  const handleRemoveImage = useCallback((index) => {
    // Revoke the Object URL to prevent memory leak
    setImages(prevImages => {
      const imageToRemove = prevImages[index];
      if (imageToRemove?.url) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prevImages.filter((_, i) => i !== index);
    });
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
    // Revoke all Object URLs to prevent memory leaks
    images.forEach(image => {
      if (image?.url) {
        URL.revokeObjectURL(image.url);
      }
    });

    setImages([]);
    setMetadata([]);
    setShowPreview(false);
    setError(null);
    setSelectedImageIndex(0);

    // Clear saved draft
    clearDraftMetadata();

    // Reset the file input to allow re-uploading the same files
    if (fileInputRef.current) {
      fileInputRef.current.clear();
    }
  }, [images]);

  // Process images with AI
  const handleProcessImages = useCallback(async () => {
    if (images.length === 0) {
      addToast('Please upload at least one image', 'error');
      return;
    }

    let modelToUse = selectedModel;

    // Check model availability before processing
    if (!useDemoData) {
      if (!hasAvailableModels()) {
        addToast('All AI models are currently rate-limited. Please try again later.', 'error');
        return;
      }

      if (isModelRateLimited(selectedModel)) {
        const nextModel = getNextAvailableModel(selectedModel);
        if (nextModel) {
          addToast(`Selected model is rate-limited. Using ${GEMINI_MODELS[nextModel]?.name || nextModel} instead.`, 'warning');
          modelToUse = nextModel;
          setSelectedModel(nextModel);
        }
      }
    }

    setLastProcessingModel(modelToUse);

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
        // Simulate processing delay
        for (let i = 0; i < validImages.length; i++) {
          setProgress({ current: i + 1, total: validImages.length, currentFile: validImages[i].name });
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay per image
        }

        result = generateDemoMetadata(validImages);
      } else {
        // Use real API calls
        result = await generateMultipleImageMetadata(
          validImages,
          (current, total, currentFile) => {
            setProgress({ current, total, currentFile });
          },
          modelToUse,
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

    } catch (err) {
      console.error('Error processing images:', err);

      // Track error for monitoring
      trackApiError(err, '/api/generate-metadata', {
        imageCount: images.length,
        model: selectedModel,
        platform: selectedPlatform
      });

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
  }, [images, addToast, selectedModel, selectedPlatform, useDemoData, generateDemoMetadata, setSelectedModel]);


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
    // Use ref for synchronous check to prevent race conditions on rapid clicks
    if (retryingImagesRef.current.has(metadataIndex)) return;

    // Immediately mark as retrying in ref (synchronous)
    retryingImagesRef.current.add(metadataIndex);
    setRetryingImages(prev => new Set(prev).add(metadataIndex));

    try {
      setLastProcessingModel(selectedModel);
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

      // Track retry error
      trackApiError(error, '/api/generate-metadata (retry)', {
        filename: imageFile.name,
        model: selectedModel,
        platform: selectedPlatform,
        metadataIndex
      });

      setError(`Retry failed for ${imageFile.name}: ${error.message}`);
    } finally {
      // Clean up both ref and state
      retryingImagesRef.current.delete(metadataIndex);
      setRetryingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(metadataIndex);
        return newSet;
      });
    }
  }, [selectedModel, selectedPlatform]);

  // Retry all failed images
  const handleRetryAllFailed = useCallback(async () => {
    const failedIndices = metadata
      .map((item, index) => item.error ? index : null)
      .filter(index => index !== null);

    if (failedIndices.length === 0) return;

    // Add all failed indices to retrying set (both ref and state)
    retryingImagesRef.current = new Set(failedIndices);
    setRetryingImages(new Set(failedIndices));

    // Capture image references upfront to avoid race conditions
    // if images array changes while retries are in-flight
    const failedImageFiles = failedIndices.map(index => images[index]);

    try {
      setLastProcessingModel(selectedModel);
      const retryPromises = failedIndices.map(async (index, i) => {
        const imageFile = failedImageFiles[i];
        if (!imageFile) {
          throw new Error(`Image at index ${index} is no longer available`);
        }
        const newMetadata = await retryImageMetadata(imageFile, selectedModel, Object.keys(GEMINI_MODELS), selectedPlatform);
        return { index, newMetadata };
      });

      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled(retryPromises);

      let successCount = 0;
      let failCount = 0;

      setMetadata(prevMetadata => {
        const newMetadata = [...prevMetadata];
        results.forEach((result, i) => {
          const index = failedIndices[i];
          if (result.status === 'fulfilled') {
            newMetadata[index] = result.value.newMetadata;
            successCount++;
          } else {
            // Keep the original error metadata but update the message
            newMetadata[index] = {
              ...prevMetadata[index],
              error: true,
              message: result.reason?.message || 'Retry failed'
            };
            failCount++;
          }
        });

        // Clear error if no failed images remain after retry all
        const hasFailedImages = newMetadata.some(item => item.error);
        if (!hasFailedImages) {
          setError(null);
        }

        return newMetadata;
      });

      // Show appropriate toast message
      if (failCount > 0 && successCount > 0) {
        addToast(`Retried ${successCount + failCount} images: ${successCount} succeeded, ${failCount} failed`, 'warning');
      } else if (failCount > 0) {
        addToast(`All ${failCount} retries failed`, 'error');
      } else {
        addToast(`Successfully retried ${successCount} images`, 'success');
      }
    } catch (error) {
      console.error('Retry all failed:', error);
      setError(`Retry operation failed: ${error.message}`);
    } finally {
      retryingImagesRef.current.clear();
      setRetryingImages(new Set());
    }
  }, [metadata, images, selectedModel, selectedPlatform, addToast]);

  // Handle footer navigation
  const HEADER_SCROLL_OFFSET = 120;
  const handleFooterNavigation = useCallback((section) => {
    const targetSection =
      section === 'preview' && !document.getElementById('preview')
        ? 'upload'
        : section;

    const element = document.getElementById(targetSection);
    if (!element) return;

    const elementPosition =
      element.getBoundingClientRect().top + window.scrollY - HEADER_SCROLL_OFFSET;

    window.scrollTo({
      top: Math.max(0, elementPosition),
      behavior: 'smooth'
    });
  }, []);


  // Download CSV
  const handleDownloadCSV = useCallback(() => {
    if (metadata.length === 0) {
      setError('No metadata available to download');
      return;
    }

    try {
      // Filter out error metadata for CSV generation
      const validMetadata = successfulMetadata;
      const errorMetadata = failedMetadata;

      if (validMetadata.length === 0) {
        setError('No valid metadata available to download. All images failed to process.');
        return;
      }

      // Show warning if some images had errors
      if (errorMetadata.length > 0) {
        console.warn(`Skipping ${errorMetadata.length} images with errors in CSV generation`);
      }

      // Fix category mappings and normalize platform-specific fields before validation/CSV
      const validationErrors = [];
      const categoryChanges = []; // Track category conversions for user notification

      let fixedMetadata = validMetadata.map(item => {
        const fixed = fixCategoryMappings(item, selectedPlatform);
        // Track if categories were changed
        if (item.categories !== fixed.categories) {
          categoryChanges.push({
            filename: item.filename,
            original: item.categories,
            fixed: fixed.categories
          });
        }
        return fixed;
      });

      // Adobe Stock normalization: ensure title, numeric category, and keyword cap
      if (selectedPlatform === 'adobe_stock') {
        const adobePlatform = getPlatformConfig('adobe_stock');
        const categoryNameToId = (name) => {
          if (!name) return '';
          const match = adobePlatform.categories.find(c => String(c.name).toLowerCase() === String(name).toLowerCase());
          return match ? String(match.id) : '';
        };

        fixedMetadata = fixedMetadata.map(item => {
          // Ensure title exists (fallback to description, trimmed to 200 chars)
          const title = (item.title && String(item.title).trim().length > 0)
            ? String(item.title).slice(0, 200)
            : (item.description ? String(item.description).slice(0, 200) : '');

          // Normalize category to numeric ID if a name was provided
          let category = item.category || '';
          if (category) {
            const numeric = parseInt(category, 10);
            if (isNaN(numeric) || numeric < 1 || numeric > 21) {
              category = categoryNameToId(category);
            } else {
              category = String(numeric);
            }
          }

          // Cap keywords to 49 (Adobe limit)
          let keywords = item.keywords || '';
          if (keywords) {
            const parts = String(keywords).split(',').map(k => k.trim()).filter(Boolean);
            keywords = parts.slice(0, 49).join(', ');
          }

          return {
            ...item,
            title,
            category,
            keywords
          };
        });
      }

      // Shutterstock normalization: ensure required fields and sensible fallbacks
      if (selectedPlatform === 'shutterstock') {
        fixedMetadata = fixedMetadata.map(item => {
          // Ensure description exists (fallback to title)
          const description = (item.description && String(item.description).trim().length > 0)
            ? String(item.description)
            : (item.title ? String(item.title) : '');

          // Ensure categories present; default to 'Miscellaneous'
          let categories = item.categories;
          if (Array.isArray(categories)) {
            categories = categories.join(', ');
          }
          if (!categories || String(categories).trim().length === 0) {
            categories = 'Miscellaneous';
          }

          // Normalize keywords string
          let keywords = item.keywords || '';
          if (keywords) {
            const parts = String(keywords).split(',').map(k => k.trim()).filter(Boolean);
            keywords = parts.join(', ');
          }

          return {
            ...item,
            description,
            categories,
            keywords,
            editorial: item.editorial === 'yes' ? 'yes' : 'no',
            matureContent: 'no',
            illustration: 'no'
          };
        });
      }
      
      fixedMetadata.forEach((item, index) => {
        const validation = validateMetadata(item, selectedPlatform);
        if (!validation.isValid) {
          validationErrors.push({ index, messages: validation.errors });
        }
      });

      // If some rows are invalid, skip them but allow download of valid ones
      const validForCsv = fixedMetadata.filter((_, idx) => !validationErrors.find(e => e.index === idx));

      if (validForCsv.length === 0) {
        setError('No valid rows to download after validation. Please fix metadata issues.');
        return;
      }

      if (validationErrors.length > 0) {
        addToast(`Skipped ${validationErrors.length} invalid item(s). Downloading ${validForCsv.length} valid item(s).`, 'warning');
      }

      // Notify user about category auto-corrections
      if (categoryChanges.length > 0) {
        addToast(`Auto-corrected categories for ${categoryChanges.length} image(s) to match platform requirements.`, 'info');
      }

      const csvContent = generateCSV(validForCsv, selectedPlatform);
      const timestamp = new Date().toISOString().split('T')[0];
      const platform = getPlatformConfig(selectedPlatform);
      const platformName = platform.name.toLowerCase().replace(/\s+/g, '_');
      const filename = `${platformName}_metadata_${timestamp}.csv`;
      
      try {
        downloadCSV(csvContent, filename, selectedPlatform);
        setShowCSVPreview(false);
        addToast(`CSV downloaded successfully! (${fixedMetadata.length} images)`, 'success');
      } catch (downloadError) {
        // Try fallback method
        try {
          showCSVInNewWindow(csvContent, filename);
          addToast(`Download failed, but CSV content opened in new window. You can copy and save it manually.`, 'warning');
        } catch (fallbackError) {
          addToast(`Download failed: ${downloadError.message}`, 'error');
          throw downloadError; // Re-throw the original error
        }
      }
      
    } catch (err) {
      // Track CSV generation error
      trackError(err, {
        severity: ErrorSeverity.ERROR,
        category: ErrorCategory.UNKNOWN,
        context: {
          operation: 'csv_generation',
          platform: selectedPlatform,
          metadataCount: metadata.length
        },
        tags: ['csv', 'download']
      });

      addToast(`Failed to generate CSV file: ${err.message}`, 'error');
      setError(`Failed to generate CSV file: ${err.message}`);
    }
  }, [failedMetadata, metadata, selectedPlatform, successfulMetadata, addToast]);

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
                  <button
                    onClick={() => setUseDemoData(!useDemoData)}
                    className={`group flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                      useDemoData 
                        ? (isDarkMode 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500 text-white shadow-lg shadow-purple-500/25' 
                          : 'bg-gradient-to-r from-purple-500 to-indigo-500 border-purple-400 text-white shadow-lg shadow-purple-500/25')
                        : (isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-gray-300 hover:border-purple-400 hover:bg-gray-700' 
                          : 'bg-white border-gray-300 text-gray-600 hover:border-purple-400 hover:bg-purple-50')
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      useDemoData 
                        ? 'bg-white shadow-lg' 
                        : (isDarkMode ? 'bg-gray-500' : 'bg-gray-400')
                    }`}></div>
                    <span className="text-sm font-medium">{useDemoData ? 'Demo Mode' : 'AI Mode'}</span>
                    {useDemoData && (
                      <div className="flex items-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>

                {/* Platform Selector */}
                <div className="relative platform-selector-container">
                  <button
                    onClick={() => setShowPlatformSelector(!showPlatformSelector)}
                    className={`group flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 text-white hover:border-blue-400 hover:from-gray-700 hover:to-gray-600' 
                        : 'bg-gradient-to-r from-white to-gray-50 border-gray-300 text-gray-900 hover:border-blue-500 hover:from-blue-50 hover:to-indigo-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-3">
                        {/* Platform Logo */}
                        {selectedPlatform === 'shutterstock' ? (
                          <img 
                            src="/assets/logos/shutterstock.webp" 
                            alt="Shutterstock" 
                            className="h-8 w-auto"
                          />
                        ) : selectedPlatform === 'adobe_stock' ? (
                          <img 
                            src="/assets/logos/adobe-stock.png" 
                            alt="Adobe Stock" 
                            className="h-8 w-auto"
                          />
                        ) : null}
                        <div className="flex flex-col items-start">
                          <div className="text-sm font-semibold">
                            {getPlatformConfig(selectedPlatform)?.name || selectedPlatform}
                          </div>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Target platform
                          </span>
                        </div>
                      </div>
                    </div>
                    <svg className={`w-5 h-5 transition-all duration-300 ${showPlatformSelector ? 'rotate-180 text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Platform Dropdown */}
                  {showPlatformSelector && (
                    <div className={`absolute right-0 top-full mt-2 w-72 rounded-xl border-2 shadow-2xl z-50 backdrop-blur-sm ${
                      isDarkMode ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-200'
                    }`}>
                      <div className="p-2">
                        <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Select Platform
                        </div>
                        {getAvailablePlatforms().map((platform) => {
                          return (
                            <div key={platform.id} className="group">
                              <button
                                onClick={() => {
                                  setSelectedPlatform(platform.id);
                                  setShowPlatformSelector(false);
                                }}
                                className={`w-full px-3 py-3 text-left rounded-lg transition-all duration-200 ${
                                  selectedPlatform === platform.id 
                                    ? (isDarkMode ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25')
                                    : (isDarkMode ? 'hover:bg-gray-700/50 text-white hover:shadow-md' : 'hover:bg-gray-50 text-gray-900 hover:shadow-md')
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <div className="flex-1">
                                      <div className="font-semibold text-sm">
                                        {platform.name}
                                      </div>
                                      <div className={`text-xs ${selectedPlatform === platform.id ? 'text-white/80' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                                        {platform.description}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPlatform(platform.id);
                                        setShowPlatformInfoModal(true);
                                        setShowPlatformSelector(false);
                                      }}
                                      className={`p-1 rounded-md transition-all duration-200 ${
                                        selectedPlatform === platform.id
                                          ? (isDarkMode 
                                            ? 'hover:bg-blue-500/20 text-white/80 hover:text-white hover:bg-blue-500/30' 
                                            : 'hover:bg-blue-500/20 text-white/80 hover:text-white hover:bg-blue-500/30')
                                          : (isDarkMode 
                                            ? 'hover:bg-gray-600 text-gray-400 hover:text-white' 
                                            : 'hover:bg-gray-200 text-gray-500 hover:text-gray-900')
                                      }`}
                                      title={`View ${platform.name} requirements`}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Model Selector */}
                <div className="relative model-selector-container">
                  <button
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    className={`group flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 text-white hover:border-green-400 hover:from-gray-700 hover:to-gray-600' 
                        : 'bg-gradient-to-r from-white to-gray-50 border-gray-300 text-gray-900 hover:border-green-500 hover:from-green-50 hover:to-emerald-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full shadow-lg ${
                        selectedModel === 'gemini-3-flash-preview' ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/50' :
                        selectedModel === 'gemini-3-flash' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/50' :
                        selectedModel === 'gemini-2.5-flash' ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-purple-500/50' :
                        selectedModel === 'gemini-2.5-flash-lite' ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/50' :
                        'bg-gradient-to-r from-gray-500 to-gray-600 shadow-gray-500/50'
                      }`}></div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold">{GEMINI_MODELS[selectedModel]?.name || selectedModel}</span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          AI Model
                        </span>
                      </div>
                    </div>
                    <svg className={`w-5 h-5 transition-all duration-300 ${showModelSelector ? 'rotate-180 text-green-500' : 'text-gray-400 group-hover:text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Model Dropdown */}
                  {showModelSelector && (
                    <div className={`absolute right-0 top-full mt-2 w-72 rounded-xl border-2 shadow-2xl z-50 backdrop-blur-sm ${
                      isDarkMode ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-200'
                    }`}>
                      <div className="p-2">
                        <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Select AI Model
                        </div>
                        {Object.entries(GEMINI_MODELS).map(([key, model]) => (
                          <button
                            key={key}
                            onClick={() => {
                              handleModelChange(key);
                              setShowModelSelector(false);
                            }}
                            className={`w-full px-3 py-3 text-left rounded-lg transition-all duration-200 group ${
                              selectedModel === key 
                                ? (isDarkMode ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg shadow-green-500/25' : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25')
                                : (isDarkMode ? 'hover:bg-gray-700/50 text-white hover:shadow-md' : 'hover:bg-gray-50 text-gray-900 hover:shadow-md')
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  key === 'gemini-3-flash-preview' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                  key === 'gemini-3-flash' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                  key === 'gemini-2.5-flash' ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500' :
                                  key === 'gemini-2.5-flash-lite' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                  'bg-gradient-to-r from-gray-500 to-gray-600'
                                }`}></div>
                                <div>
                                  <div className="font-semibold text-sm">{model.name}</div>
                                  <div className={`text-xs ${selectedModel === key ? 'text-white/80' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                                    {model.dailyLimit} requests/day
                                  </div>
                                </div>
                              </div>
                              {selectedModel === key && (
                                <div className="flex items-center space-x-1">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
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
          {/* Draft Recovery Banner */}
          {showDraftRecovery && draftInfo && (
            <div className={`${isDarkMode ? 'bg-blue-900/30 border-blue-700/50' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4 flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Unsaved work found
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {draftInfo.count} item(s) from {formatRelativeTime(draftInfo.timestamp)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRestoreDraft}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Restore
                </button>
                <button
                  onClick={handleDismissDraft}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

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
            
            {/* Image Preview Section */}
            {images.length > 0 && (
              <div className="mt-4">
                {/* Thumbnail Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 mb-4">
                  {images.slice(0, 10).map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-16 object-cover rounded-lg hover:ring-2 hover:ring-blue-400 transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setSelectedImage(images[index]);
                          setCurrentImageIndex(index);
                          setShowImageModal(true);
                        }}
                      />
                      
                      {/* Hover Actions Overlay - Hidden during processing */}
                      {!isProcessing && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center rounded-lg transition-all duration-200">
                          <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex(index);
                                setSelectedImage(images[index]);
                                setCurrentImageIndex(index);
                                setShowImageModal(true);
                              }}
                              className={`p-1 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded shadow-lg`}
                              title="View full size"
                            >
                              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(index);
                              }}
                              className={`p-1 ${isDarkMode ? 'bg-red-800 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} rounded shadow-lg`}
                              title="Remove this image"
                            >
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Processing Status Badge */}
                      {metadata[index] && (
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          metadata[index].error
                            ? 'bg-red-500 text-white'
                            : 'bg-green-500 text-white'
                        }`}>
                          {metadata[index].error ? '✕' : '✓'}
                        </div>
                      )}

                      {/* Overflow Indicator */}
                      {index === 9 && images.length > 10 && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">+{images.length - 10}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {images.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleProcessImages}
                    disabled={isProcessing}
                    className={`px-6 py-3 bg-indigo-600 text-white rounded-lg transition-all duration-200 flex items-center gap-3 shadow-md border-2 border-indigo-500 ${
                      isProcessing
                        ? 'opacity-75 cursor-not-allowed'
                        : 'hover:bg-indigo-700 hover:shadow-lg hover:border-indigo-400 transform hover:-translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <div className="text-left">
                          <div className="font-bold text-lg">AI Processing...</div>
                          <div className="text-sm opacity-90">Generating metadata</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <div className="text-left">
                          <div className="font-bold text-lg">Generate Stock Metadata</div>
                          <div className="text-sm opacity-90">AI keywords, titles & descriptions</div>
                        </div>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Clear All Button - hidden during processing */}
                  {!isProcessing && (
                    <button
                      onClick={handleClearAll}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
                        isDarkMode
                          ? 'bg-transparent border-red-500 text-red-400 hover:bg-red-500/10 hover:border-red-400'
                          : 'bg-transparent border-red-500 text-red-600 hover:bg-red-50 hover:border-red-400'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="font-medium text-sm">Clear All</span>
                    </button>
                  )}
                </div>
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




          {/* Failed Images with Retry Options */}
          {failedMetadata.length > 0 && (
            <FailedImages 
              metadata={metadata}
              images={images}
              rateLimitModelName={rateLimitModelName}
              onRetry={handleRetryImage}
              retryingImages={retryingImages}
              onRetryAll={handleRetryAllFailed}
              onRemoveImage={handleRemoveImage}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Metadata Preview - Only show if there are processed images */}
          {showPreview && successfulMetadata.length > 0 && (
            <div id="preview" className="scroll-mt-32">
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
            </div>
          )}

          {/* Download Section - Only show if there are successful images */}
          {successfulMetadata.length > 0 && !isProcessing && (
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
                This file contains metadata for {successfulMetadata.length} successful image{successfulMetadata.length !== 1 ? 's' : ''}.
                {failedMetadata.length > 0 && (
                  <span className="text-orange-600 block mt-1">
                    {failedMetadata.length} image{failedMetadata.length !== 1 ? 's' : ''} failed to process and will be excluded.
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
                      {successfulMetadata.length}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {failedMetadata.length}
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
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Set <code className={`${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-blue-100 text-gray-800'} px-1 rounded text-xs`}>GEMINI_API_KEY</code> in <code className={`${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-blue-100 text-gray-800'} px-1 rounded text-xs`}>.env.local</code> and run <code className={`${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-blue-100 text-gray-800'} px-1 rounded text-xs`}>npm run dev:api</code>.</p>
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
                  href="https://github.com/Nau4man/stockify" 
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
      <Suspense fallback={null}>
        {showHelp && (
          <HelpModal
            isDarkMode={isDarkMode}
            setShowHelp={setShowHelp}
            setShowApiConfiguration={setShowApiConfiguration}
            handleFooterNavigation={handleFooterNavigation}
          />
        )}
        {showDocumentation && (
          <DocumentationModal
            isDarkMode={isDarkMode}
            setShowDocumentation={setShowDocumentation}
            setShowApiConfiguration={setShowApiConfiguration}
            setShowHelp={setShowHelp}
            setShowPrivacyPolicy={setShowPrivacyPolicy}
          />
        )}
        {showApiConfiguration && (
          <ApiConfigurationModal
            isDarkMode={isDarkMode}
            setShowApiConfiguration={setShowApiConfiguration}
            setShowDocumentation={setShowDocumentation}
            setShowHelp={setShowHelp}
            setShowPrivacyPolicy={setShowPrivacyPolicy}
          />
        )}
        {showPrivacyPolicy && (
          <PrivacyPolicyModal
            isDarkMode={isDarkMode}
            setShowPrivacyPolicy={setShowPrivacyPolicy}
          />
        )}
        {showTermsOfService && (
          <TermsOfServiceModal
            isDarkMode={isDarkMode}
            setShowTermsOfService={setShowTermsOfService}
          />
        )}
        {showPlatformInfoModal && (
          <PlatformInfoModal
            isOpen={showPlatformInfoModal}
            onClose={() => setShowPlatformInfoModal(false)}
            isDarkMode={isDarkMode}
            platform={getPlatformConfig(selectedPlatform)}
          />
        )}
      </Suspense>
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
      

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;
