/**
 * Storage Manager
 *
 * Handles localStorage persistence for draft metadata and application state.
 * Provides graceful fallbacks if localStorage is unavailable.
 */

const STORAGE_KEYS = {
  DRAFT_METADATA: 'stockify_draft_metadata',
  SELECTED_PLATFORM: 'stockify_selected_platform',
  SELECTED_MODEL: 'stockify_selected_model',
  DARK_MODE: 'stockify_dark_mode',
  LAST_SESSION: 'stockify_last_session'
};

// Maximum age for draft data (24 hours)
const MAX_DRAFT_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Check if localStorage is available
 */
const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Save draft metadata to localStorage
 * @param {Array} metadata - Array of metadata objects
 * @param {Array} imageNames - Array of image filenames (for reference)
 */
export const saveDraftMetadata = (metadata, imageNames = []) => {
  if (!isStorageAvailable() || !metadata || metadata.length === 0) {
    return false;
  }

  try {
    const draft = {
      metadata,
      imageNames,
      timestamp: Date.now(),
      version: 1
    };

    localStorage.setItem(STORAGE_KEYS.DRAFT_METADATA, JSON.stringify(draft));
    return true;
  } catch (error) {
    // Storage might be full
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to save draft metadata:', error.message);
    }
    return false;
  }
};

/**
 * Load draft metadata from localStorage
 * @returns {Object|null} Draft data or null if not found/expired
 */
export const loadDraftMetadata = () => {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DRAFT_METADATA);
    if (!stored) {
      return null;
    }

    const draft = JSON.parse(stored);

    // Check if draft is too old
    if (Date.now() - draft.timestamp > MAX_DRAFT_AGE_MS) {
      clearDraftMetadata();
      return null;
    }

    return draft;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to load draft metadata:', error.message);
    }
    return null;
  }
};

/**
 * Clear draft metadata from localStorage
 */
export const clearDraftMetadata = () => {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.DRAFT_METADATA);
  } catch (error) {
    // Ignore errors
  }
};

/**
 * Check if there's a draft available
 * @returns {Object|null} Draft info or null
 */
export const hasDraft = () => {
  const draft = loadDraftMetadata();
  if (!draft) {
    return null;
  }

  return {
    count: draft.metadata?.length || 0,
    timestamp: draft.timestamp,
    age: Date.now() - draft.timestamp,
    imageNames: draft.imageNames || []
  };
};

/**
 * Save user preferences
 */
export const savePreferences = (preferences) => {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    if (preferences.platform !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PLATFORM, preferences.platform);
    }
    if (preferences.model !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, preferences.model);
    }
    if (preferences.darkMode !== undefined) {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(preferences.darkMode));
    }
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Load user preferences
 */
export const loadPreferences = () => {
  if (!isStorageAvailable()) {
    return {};
  }

  try {
    const preferences = {};

    const platform = localStorage.getItem(STORAGE_KEYS.SELECTED_PLATFORM);
    if (platform) {
      preferences.platform = platform;
    }

    const model = localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
    if (model) {
      preferences.model = model;
    }

    const darkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (darkMode !== null) {
      preferences.darkMode = JSON.parse(darkMode);
    }

    return preferences;
  } catch (error) {
    return {};
  }
};

/**
 * Clear all Stockify data from localStorage
 */
export const clearAllData = () => {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    // Ignore errors
  }
};

/**
 * Format relative time for display
 */
export const formatRelativeTime = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};
