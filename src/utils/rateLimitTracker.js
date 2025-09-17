// Rate limit tracking utility for Gemini models
// Tracks when models hit rate limits and calculates reset times

const RATE_LIMIT_STORAGE_KEY = 'gemini_rate_limits';

// Default rate limits (requests per day) - these reset every 24 hours
export const MODEL_RATE_LIMITS = {
  'gemini-2.5-flash-lite': 1000,
  'gemini-2.0-flash-lite': 200,
  'gemini-1.5-pro': 50
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

// Save rate limit data
const saveRateLimits = (data) => {
  try {
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving rate limit data:', error);
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

// Mark a model as rate limited
export const markModelRateLimited = (modelKey) => {
  const rateLimits = getStoredRateLimits();
  const today = new Date().toDateString();
  
  rateLimits[modelKey] = {
    date: today,
    isRateLimited: true,
    timestamp: Date.now()
  };
  
  saveRateLimits(rateLimits);
  console.log(`Model ${modelKey} marked as rate limited`);
};

// Get time until rate limit resets (in milliseconds)
export const getTimeUntilReset = (modelKey) => {
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
export const formatTimeRemaining = (milliseconds) => {
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

// Clear rate limit for a model (when it's successfully used)
export const clearModelRateLimit = (modelKey) => {
  const rateLimits = getStoredRateLimits();
  delete rateLimits[modelKey];
  saveRateLimits(rateLimits);
  console.log(`Rate limit cleared for model ${modelKey}`);
};

// Get all rate limited models
export const getRateLimitedModels = () => {
  const rateLimits = getStoredRateLimits();
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
