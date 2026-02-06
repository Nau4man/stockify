/**
 * Image Compressor Utility
 *
 * Compresses and resizes images to stay within Vercel's 4.5MB payload limit.
 * Base64 encoding adds ~33% overhead, so we target ~3MB max image size.
 */

// Maximum dimensions for processed images
const MAX_WIDTH = 2048;
const MAX_HEIGHT = 2048;

// Target size in bytes (3MB to account for base64 overhead)
const TARGET_SIZE_BYTES = 3 * 1024 * 1024;

// Minimum quality to try before giving up
const MIN_QUALITY = 0.3;

/**
 * Compress an image file to reduce payload size
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<{blob: Blob, wasCompressed: boolean, originalSize: number, newSize: number}>}
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = MAX_WIDTH,
    maxHeight = MAX_HEIGHT,
    targetSize = TARGET_SIZE_BYTES,
    minQuality = MIN_QUALITY
  } = options;

  const originalSize = file.size;

  // If file is already small enough, return as-is
  if (originalSize <= targetSize) {
    return {
      blob: file,
      wasCompressed: false,
      originalSize,
      newSize: originalSize
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to initialize canvas context'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
    };

    img.onload = async () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Try to compress to target size
        let quality = 0.9;
        let blob = null;
        let mimeType = 'image/jpeg'; // JPEG compresses better than PNG

        // If original is PNG with transparency, we need to handle differently
        const isPng = file.type === 'image/png';
        if (isPng) {
          // Check if image has transparency by sampling alpha channel
          const imageData = ctx.getImageData(0, 0, width, height);
          const hasTransparency = checkTransparency(imageData);

          if (hasTransparency) {
            // Keep as PNG but still resize
            mimeType = 'image/png';
            blob = await canvasToBlob(canvas, mimeType, 1);

            resolve({
              blob,
              wasCompressed: true,
              originalSize,
              newSize: blob.size,
              note: 'PNG with transparency - resized only'
            });
            return;
          }
        }

        // Iteratively reduce quality until we hit target size
        while (quality >= minQuality) {
          blob = await canvasToBlob(canvas, mimeType, quality);

          if (blob.size <= targetSize) {
            break;
          }

          quality -= 0.1;
        }

        // If still too large, reduce dimensions further
        if (blob.size > targetSize && (width > 1024 || height > 1024)) {
          const furtherRatio = 0.7;
          canvas.width = Math.round(width * furtherRatio);
          canvas.height = Math.round(height * furtherRatio);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          quality = 0.8;
          while (quality >= minQuality) {
            blob = await canvasToBlob(canvas, mimeType, quality);
            if (blob.size <= targetSize) break;
            quality -= 0.1;
          }
        }

        resolve({
          blob,
          wasCompressed: true,
          originalSize,
          newSize: blob.size,
          quality: Math.round(quality * 100),
          dimensions: { width: canvas.width, height: canvas.height }
        });
      } catch (error) {
        reject(error);
      } finally {
        cleanup();
      }
    };

    img.onerror = () => {
      cleanup();
      reject(new Error('Failed to load image for compression'));
    };

    // Load image from file
    img.src = objectUrl;
  });
};

/**
 * Convert canvas to blob with promise
 */
const canvasToBlob = (canvas, mimeType, quality) => {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
};

/**
 * Check if image data has any transparent pixels
 */
const checkTransparency = (imageData) => {
  const data = imageData.data;
  // Sample every 100th pixel for performance
  for (let i = 3; i < data.length; i += 400) {
    if (data[i] < 255) {
      return true;
    }
  }
  return false;
};

/**
 * Estimate base64 size from blob size
 * Base64 encoding adds approximately 33% overhead
 */
export const estimateBase64Size = (blobSize) => {
  return Math.ceil(blobSize * 1.37); // 4/3 ratio + some padding
};

/**
 * Check if a file will likely exceed payload limits
 * @param {File} file - The file to check
 * @returns {{willExceed: boolean, estimatedSize: number, limit: number}}
 */
export const checkPayloadSize = (file) => {
  const limit = 4.5 * 1024 * 1024; // Vercel's limit
  const estimatedSize = estimateBase64Size(file.size);

  return {
    willExceed: estimatedSize > limit,
    estimatedSize,
    limit,
    recommendation: estimatedSize > limit
      ? 'Image will be automatically compressed before processing'
      : null
  };
};

/**
 * Format bytes to human readable string
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
