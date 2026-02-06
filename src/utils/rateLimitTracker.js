// Rate limit tracking utility for Gemini models
// Tracks when models hit rate limits and calculates reset times

const RATE_LIMIT_STORAGE_KEY = 'gemini_rate_limits';

// Default rate limits (requests per day) - these reset every 24 hours
export const MODEL_RATE_LIMITS = {
  'gemini-3-flash-preview': 1000,
  'gemini-3-flash': 1000,
  'gemini-2.5-flash': 1000,
  'gemini-2.5-flash-lite': 1000
};

// Get stored rate limit data
const getStoredRateLimits = () => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading rate limit data:', error);
    return {};
  }
};

// Check if a model has hit its rate limit
export const isModelRateLimited = (modelKey) => {
  const rateLimits = getStoredRateLimits();
  const modelData = rateLimits[modelKey];
  
  if (!modelData) return false;
  
  // Check if the rate limit was hit today
  const today = new Date().toDateString();
  return modelData.date === today && modelData.isRateLimited;
};

// Get time until rate limit resets (in milliseconds)
const getTimeUntilReset = (modelKey) => {
  const rateLimits = getStoredRateLimits();
  const modelData = rateLimits[modelKey];
  
  if (!modelData || !modelData.isRateLimited) return 0;
  
  // Rate limits reset at midnight UTC (24 hours from when they were hit)
  const resetTime = new Date(modelData.timestamp);
  resetTime.setUTCHours(24, 0, 0, 0); // Next midnight UTC
  
  const now = new Date();
  const timeUntilReset = resetTime.getTime() - now.getTime();
  
  return Math.max(0, timeUntilReset);
};

// Format time remaining in a human-readable format
const formatTimeRemaining = (milliseconds) => {
  if (milliseconds <= 0) return 'Available now';
  
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Get all rate limited models
export const getRateLimitedModels = () => {
  const rateLimitedModels = [];
  
  Object.keys(MODEL_RATE_LIMITS).forEach(modelKey => {
    if (isModelRateLimited(modelKey)) {
      rateLimitedModels.push({
        modelKey,
        timeUntilReset: getTimeUntilReset(modelKey),
        formattedTime: formatTimeRemaining(getTimeUntilReset(modelKey))
      });
    }
  });
  
  return rateLimitedModels;
};

// Check if any models are available (not rate limited)
export const hasAvailableModels = () => {
  return Object.keys(MODEL_RATE_LIMITS).some(modelKey => !isModelRateLimited(modelKey));
};

// Get the next available model
export const getNextAvailableModel = (preferredModel = null) => {
  // If preferred model is available, use it
  if (preferredModel && !isModelRateLimited(preferredModel)) {
    return preferredModel;
  }
  
  // Find the first available model
  for (const modelKey of Object.keys(MODEL_RATE_LIMITS)) {
    if (!isModelRateLimited(modelKey)) {
      return modelKey;
    }
  }
  
  return null; // No models available
};
