import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 4000, onClose, isDarkMode = false }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return isDarkMode 
          ? 'bg-green-600 text-white border-green-500' 
          : 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return isDarkMode 
          ? 'bg-red-600 text-white border-red-500' 
          : 'bg-red-50 text-red-800 border-red-200';
      case 'warning':
        return isDarkMode 
          ? 'bg-yellow-600 text-white border-yellow-500' 
          : 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'info':
      default:
        return isDarkMode 
          ? 'bg-blue-600 text-white border-blue-500' 
          : 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  const getIcon = () => {
    const iconClass = isDarkMode ? "w-5 h-5 brightness-0 invert" : "w-5 h-5";
    switch (type) {
      case 'success':
        return <img src="/assets/icons/tick-circle.svg" alt="Success" className={`${iconClass} ${!isDarkMode ? 'text-green-600' : ''}`} />;
      case 'error':
        return <img src="/assets/icons/x-circle.svg" alt="Error" className={`${iconClass} ${!isDarkMode ? 'text-red-600' : ''}`} />;
      case 'warning':
        return <img src="/assets/icons/alert-circle.svg" alt="Warning" className={`${iconClass} ${!isDarkMode ? 'text-yellow-600' : ''}`} />;
      case 'info':
      default:
        return <img src="/assets/icons/help-circle.svg" alt="Info" className={`${iconClass} ${!isDarkMode ? 'text-blue-600' : ''}`} />;
    }
  };

  return (
    <div
      className={`max-w-sm w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border-l-4 ${getToastStyles()} transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-center p-4">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose && onClose(), 300);
            }}
            className={`inline-flex ${isDarkMode ? 'text-white hover:text-gray-200 focus:text-gray-200' : 'text-gray-500 hover:text-gray-700 focus:text-gray-700'} focus:outline-none transition-colors duration-200`}
          >
            <img src="/assets/icons/x.svg" alt="Close" className={`w-4 h-4 ${isDarkMode ? 'brightness-0 invert' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
