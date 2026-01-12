import React, { useState, useEffect, useRef } from 'react';
import { isModelRateLimited, getTimeUntilReset, formatTimeRemaining } from '../utils/rateLimitTracker';

const RateLimitIndicator = ({ modelKey, className = "", isDarkMode = false }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Use ref to store the current modelKey for the interval callback
  const modelKeyRef = useRef(modelKey);

  // Keep ref in sync with prop
  useEffect(() => {
    modelKeyRef.current = modelKey;
  }, [modelKey]);

  useEffect(() => {
    const checkRateLimit = () => {
      const currentModelKey = modelKeyRef.current;
      const rateLimited = isModelRateLimited(currentModelKey);
      const timeUntilReset = getTimeUntilReset(currentModelKey);

      setIsRateLimited(rateLimited);
      setTimeRemaining(timeUntilReset);
    };

    // Check immediately
    checkRateLimit();

    // Always set up interval to check periodically (handles dynamic rate limit changes)
    const interval = setInterval(checkRateLimit, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [modelKey]);

  if (!isRateLimited) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="w-2 h-2 bg-green-400 rounded-full mr-2" title="Available"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div 
        className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" 
        title={`Rate limited - Resets in ${formatTimeRemaining(timeRemaining)}`}
      ></div>
      <span className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-600'} font-medium`}>
        {formatTimeRemaining(timeRemaining)}
      </span>
    </div>
  );
};

export default RateLimitIndicator;
