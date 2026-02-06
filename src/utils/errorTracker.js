/**
 * Error Tracker Utility
 *
 * Lightweight error tracking for production monitoring.
 * Buffers errors and flushes to /api/log-error in production.
 */

// Error severity levels
export const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Error categories
export const ErrorCategory = {
  API: 'api',
  UI: 'ui',
  NETWORK: 'network',
  VALIDATION: 'validation',
  STORAGE: 'storage',
  UNKNOWN: 'unknown'
};

// In-memory error buffer for batching
const errorBuffer = [];
const MAX_BUFFER_SIZE = 10;
const MAX_BUFFER_HARD_LIMIT = 100;
const FLUSH_INTERVAL_MS = 30000; // 30 seconds
const ERROR_TRACKER_STATE_KEY = '__stockifyErrorTrackerState__';

// Session ID for correlating errors
const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Get browser and environment info
 */
const getEnvironmentInfo = () => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    url: window.location.href,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
    sessionId
  };
};

/**
 * Track an error
 * @param {Error|string} error - The error to track
 * @param {Object} options - Additional options
 */
export const trackError = (error, options = {}) => {
  const {
    severity = ErrorSeverity.ERROR,
    category = ErrorCategory.UNKNOWN,
    context = {},
    tags = []
  } = options;

  // Don't track in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_TRACK_ERRORS_DEV) {
    console.error('[ErrorTracker]', error, { severity, category, context });
    return;
  }

  const errorData = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : null,
    severity,
    category,
    context: { ...userContext, ...context },
    tags,
    environment: getEnvironmentInfo()
  };

  // Add to buffer for Vercel logging
  if (errorBuffer.length >= MAX_BUFFER_HARD_LIMIT) {
    errorBuffer.shift();
  }
  errorBuffer.push(errorData);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[ErrorTracker]', errorData);
  }

  // Flush if buffer is full
  if (errorBuffer.length >= MAX_BUFFER_SIZE) {
    flushErrors();
  }
};

/**
 * Track an API error with additional context
 */
export const trackApiError = (error, endpoint, requestData = {}) => {
  trackError(error, {
    severity: ErrorSeverity.ERROR,
    category: ErrorCategory.API,
    context: {
      endpoint,
      requestData: sanitizeData(requestData)
    },
    tags: ['api', 'gemini']
  });
};

/**
 * Track a UI error (from Error Boundary)
 */
export const trackUIError = (error, componentStack) => {
  trackError(error, {
    severity: ErrorSeverity.CRITICAL,
    category: ErrorCategory.UI,
    context: {
      componentStack
    },
    tags: ['ui', 'crash']
  });
};

/**
 * Sanitize data to remove sensitive information
 */
const sanitizeData = (data) => {
  if (!data) return data;

  const sensitiveKeys = ['apiKey', 'key', 'token', 'password', 'secret', 'auth'];
  const sanitized = { ...data };

  Object.keys(sanitized).forEach(key => {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    }
    // Truncate large values (like base64 images)
    if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
      sanitized[key] = sanitized[key].substring(0, 100) + '...[truncated]';
    }
  });

  return sanitized;
};

/**
 * Flush errors to the server
 */
const flushErrors = async () => {
  if (errorBuffer.length === 0) return;

  const errors = [...errorBuffer];
  errorBuffer.length = 0; // Clear buffer

  // In production, you would send this to an error tracking service
  // For now, we'll send to our serverless function
  try {
    // Only send in production or if endpoint is configured
    if (process.env.NODE_ENV === 'production') {
      await fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors })
      }).catch(() => {
        // Silently fail - don't want error tracking to cause errors
      });
    }
  } catch (e) {
    // Silently fail
  }
};

const startErrorTracking = () => {
  if (typeof window === 'undefined') return;
  const scope = window;
  if (scope[ERROR_TRACKER_STATE_KEY]?.intervalId) {
    return;
  }
  const intervalId = setInterval(flushErrors, FLUSH_INTERVAL_MS);
  window.addEventListener('beforeunload', flushErrors);
  scope[ERROR_TRACKER_STATE_KEY] = { intervalId };
};

startErrorTracking();

/**
 * Set user context for error tracking.
 * Context is merged into every error report.
 */
let userContext = {};

export const setUserContext = (context) => {
  userContext = { ...userContext, ...context };
};

/**
 * Manual flush (for critical errors or before unmount)
 */
export const flush = flushErrors;
