import React, { useState, useEffect } from 'react';
import { isModelRateLimited, getTimeUntilReset, formatTimeRemaining } from '../utils/rateLimitTracker';

const RateLimitIndicator = ({ modelKey, className = "", isDarkMode = false }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    const checkRateLimit = () => {
      const rateLimited = isModelRateLimited(modelKey);
      const timeUntilReset = getTimeUntilReset(modelKey);
      
      setIsRateLimited(rateLimited);
      setTimeRemaining(timeUntilReset);
    };

    // Check immediately
    checkRateLimit();

    // Update every second if rate limited
    let interval;
    if (isModelRateLimited(modelKey)) {
      interval = setInterval(checkRateLimit, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
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
