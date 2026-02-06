/**
 * Gemini API Client
 *
 * This module handles communication with the Gemini API through a serverless proxy.
 * The API key is stored server-side only for security.
 */

import { compressImage, checkPayloadSize } from './imageCompressor';

// Gemini model configurations (for UI display only - actual calls go through proxy)
export const GEMINI_MODELS = {
  'gemini-3-flash-preview': {
    name: 'Gemini 3 Flash Preview',
    dailyLimit: 1000,
    description: 'Fast preview model - 1,000 requests/day'
  },
  'gemini-3-flash': {
    name: 'Gemini 3 Flash',
    dailyLimit: 1000,
    description: 'Fast production model - 1,000 requests/day'
  },
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    dailyLimit: 1000,
    description: 'Balanced cost and quality - 1,000 requests/day'
  },
  'gemini-2.5-flash-lite': {
    name: 'Gemini 2.5 Flash Lite',
    dailyLimit: 1000,
    description: 'Lowest cost option - 1,000 requests/day'
  }
};

// Default model
export const DEFAULT_MODEL = 'gemini-3-flash-preview';

// API endpoint (serverless function)
const API_ENDPOINT = '/api/generate-metadata';

// API request timeout (30 seconds)
const API_TIMEOUT_MS = 30000;

/**
 * Convert image file/blob to base64 string
 */
const convertImageToBase64 = (imageOrFile) => {
  return new Promise((resolve, reject) => {
    // Handle both File objects and image objects with file property
    let file;
    if (imageOrFile instanceof File || imageOrFile instanceof Blob) {
      file = imageOrFile;
    } else if (imageOrFile && (imageOrFile.file instanceof File || imageOrFile.file instanceof Blob)) {
      file = imageOrFile.file;
    } else {
      reject(new Error('Invalid file object: expected File/Blob or image object with file property'));
      return;
    }

    // Validate that we have a proper File/Blob
    if (!(file instanceof File) && !(file instanceof Blob)) {
      reject(new Error('Invalid file type: expected File or Blob object'));
      return;
    }

    const reader = new FileReader();
    const timeout = setTimeout(() => {
      reader.abort();
      reject(new Error('Image conversion timeout'));
    }, 10000);

    reader.onload = () => {
      clearTimeout(timeout);
      try {
        const result = reader.result.split(',')[1];
        if (!result) {
          throw new Error('Failed to convert image to base64');
        }
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to read image file'));
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
};

/**
 * Generate metadata for a single image using the serverless proxy
 */
export const generateImageMetadata = async (
  imageFile,
  selectedModel = DEFAULT_MODEL,
  availableModels = Object.keys(GEMINI_MODELS),
  platformId = 'shutterstock'
) => {
  // Validate inputs
  if (!imageFile) {
    throw new Error('No image file provided');
  }

  // Validate selected model exists
  if (!GEMINI_MODELS[selectedModel]) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Invalid model "${selectedModel}", falling back to "${DEFAULT_MODEL}"`);
    }
    selectedModel = DEFAULT_MODEL;
  }

  try {
    // Get the actual file object
    let file;
    if (imageFile instanceof File) {
      file = imageFile;
    } else if (imageFile && imageFile.file instanceof File) {
      file = imageFile.file;
    } else {
      throw new Error('Invalid file object');
    }

    // Check if compression is needed and compress if necessary
    const payloadCheck = checkPayloadSize(file);
    let fileToProcess = file;
    let mimeType = file.type;

    if (payloadCheck.willExceed) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Compressing ${file.name} (${Math.round(file.size / 1024 / 1024 * 100) / 100}MB)`);
      }

      const compressed = await compressImage(file);
      fileToProcess = compressed.blob;
      mimeType = compressed.blob.type || 'image/jpeg';

      if (process.env.NODE_ENV === 'development') {
        console.log(`Compressed to ${Math.round(compressed.newSize / 1024 / 1024 * 100) / 100}MB`);
      }
    }

    // Convert image to base64
    const base64Image = await convertImageToBase64(fileToProcess);

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    // Call the serverless proxy
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        imageBase64: base64Image,
        mimeType: mimeType,
        filename: file.name,
        model: selectedModel,
        platformId: platformId
      })
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          data = { error: text };
        }
      }
    }

    // Handle error responses
    if (!response.ok) {
      const errorType = data?.errorType || 'unknown';
      const errorMessage = data?.error || 'An error occurred';
      const retryAfterSeconds = data?.retryAfterSeconds;

      // Return error metadata
      return {
        filename: file?.name || imageFile?.name || 'unknown',
        error: true,
        errorType: errorType,
        message: errorMessage,
        ...(retryAfterSeconds && { retryAfterSeconds })
      };
    }

    // Success - return metadata
    if (data.success && data.metadata) {
      return {
        ...data.metadata,
        filename: file?.name || imageFile?.name || 'unknown'
      };
    }

    // Unexpected response format
    return {
      filename: file?.name || imageFile?.name || 'unknown',
      error: true,
      errorType: 'unknown',
      message: 'Unexpected response from server'
    };

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error generating metadata for ${imageFile.name}:`, error.message);
    }

    // Determine error type
    let errorType = 'unknown';
    let userMessage = 'An unexpected error occurred';

    if (error.name === 'AbortError') {
      errorType = 'timeout';
      userMessage = 'Request timed out. Please try again.';
    } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      errorType = 'network';
      userMessage = 'Network error. Please check your connection and try again.';
    }

    // Return error metadata
    return {
      filename: imageFile?.name || imageFile?.file?.name || 'unknown',
      error: true,
      errorType: errorType,
      message: userMessage
    };
  }
};

/**
 * Generate metadata for multiple images with progress tracking
 * @param {File[]} images - Array of image files
 * @param {Function} progressCallback - Called with (current, total, filename)
 * @param {string} selectedModel - Model to use
 * @param {string[]} availableModels - List of available models
 * @param {string} platformId - Target platform
 * @param {Function|null} isCancelledFn - Returns true if processing should stop
 */
export const generateMultipleImageMetadata = async (
  images,
  progressCallback,
  selectedModel = DEFAULT_MODEL,
  availableModels = Object.keys(GEMINI_MODELS),
  platformId = 'shutterstock',
  isCancelledFn = null
) => {
  const results = [];
  let rateLimitUntil = 0;

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < images.length; i++) {
    // Check if cancelled before processing each image
    if (isCancelledFn && isCancelledFn()) {
      // Mark remaining images as cancelled
      for (let j = i; j < images.length; j++) {
        results.push({
          filename: images[j].name,
          error: true,
          errorType: 'cancelled',
          message: 'Processing was cancelled'
        });
      }
      break;
    }

    const file = images[i];

    const now = Date.now();
    if (rateLimitUntil > now) {
      const waitMs = rateLimitUntil - now;
      if (progressCallback) {
        progressCallback(i + 1, images.length, `${file.name} (waiting ${Math.ceil(waitMs / 1000)}s)`);
      }
      await wait(waitMs);
    }

    try {
      progressCallback(i + 1, images.length, file.name);
      let metadata = await generateImageMetadata(file, selectedModel, availableModels, platformId);

      if (metadata?.error && metadata.errorType === 'rate_limit' && metadata.retryAfterSeconds) {
        const waitMs = metadata.retryAfterSeconds * 1000;
        rateLimitUntil = Date.now() + waitMs;
        if (progressCallback) {
          progressCallback(i + 1, images.length, `${file.name} (rate limited, retrying in ${metadata.retryAfterSeconds}s)`);
        }
        await wait(waitMs);
        metadata = await generateImageMetadata(file, selectedModel, availableModels, platformId);
      }

      results.push(metadata);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error processing ${file.name}:`, error.message);
      }
      results.push({
        filename: file.name,
        error: true,
        errorType: 'processing',
        message: error.message || 'Failed to process image'
      });
    }
  }

  return results;
};

/**
 * Retry generating metadata for a specific image
 */
export const retryImageMetadata = async (
  imageFile,
  selectedModel = DEFAULT_MODEL,
  availableModels = Object.keys(GEMINI_MODELS),
  platformId = 'shutterstock'
) => {
  return generateImageMetadata(imageFile, selectedModel, availableModels, platformId);
};
