import React, { useState, useEffect, useCallback } from 'react';

const ImageModal = ({ image, isOpen, onClose, images = [], currentIndex = 0, onNavigate, isDarkMode = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen && image) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [isOpen, image]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || !images.length) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (currentIndex > 0 && onNavigate) {
          onNavigate(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentIndex < images.length - 1 && onNavigate) {
          onNavigate(currentIndex + 1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      default:
        break;
    }
  }, [isOpen, images.length, currentIndex, onNavigate, onClose]);

  // Click outside to close
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !image) return null;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className={`relative w-full h-full max-w-7xl max-h-full flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl overflow-hidden shadow-2xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-2xl px-6 py-4 border shadow-sm`}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate max-w-lg`}>
                    {image.name}
                  </h3>
                  <div className={`flex items-center space-x-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {images.length > 1 && (
                  <span className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>{currentIndex + 1} of {images.length}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                  </svg>
                  <span>{(image.size / 1024 / 1024).toFixed(1)} MB</span>
                </span>
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{image.type.split('/')[1].toUpperCase()}</span>
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className={`p-4 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'} rounded-2xl transition-all duration-200 border ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'} shadow-sm group`}
          >
            <img src="/assets/icons/x.svg" alt="Close" className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
      </div>
      
      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          {/* Left Arrow */}
          {currentIndex > 0 && (
            <button
              onClick={() => onNavigate && onNavigate(currentIndex - 1)}
                  className={`absolute left-6 top-1/2 transform -translate-y-1/2 z-20 p-4 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'} rounded-2xl transition-all duration-200 border ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'} shadow-sm group`}
            >
              <img src="/assets/icons/arrow-upload.svg" alt="Previous" className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-200 rotate-90" />
            </button>
          )}
          
          {/* Right Arrow */}
          {currentIndex < images.length - 1 && (
            <button
              onClick={() => onNavigate && onNavigate(currentIndex + 1)}
                  className={`absolute right-6 top-1/2 transform -translate-y-1/2 z-20 p-4 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'} rounded-2xl transition-all duration-200 border ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'} shadow-sm group`}
            >
              <img src="/assets/icons/arrow-download.svg" alt="Next" className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200 rotate-90" />
            </button>
          )}
        </>
      )}

      {/* Full-Screen Image Container */}
      <div className="flex-1 relative overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className={`absolute inset-0 flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'} text-lg font-medium`}>Loading image...</p>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>Preparing high-quality preview</p>
              </div>
            </div>
          </div>
        )}
        
        {imageError ? (
          <div className={`absolute inset-0 flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-200">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} text-xl font-semibold`}>Failed to load image</p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mt-2`}>The image file may be corrupted or unsupported</p>
            </div>
          </div>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <img
              src={URL.createObjectURL(image)}
              alt={image.name}
              className="max-w-full max-h-full object-contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ 
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
                filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))'
              }}
            />
          </div>
        )}
      </div>
      
      {/* Floating Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-center">
              <div className={`flex items-center space-x-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-2xl px-6 py-4 border shadow-sm`}>
                <button className={`p-3 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'} rounded-xl transition-all duration-200 group`}>
                  <img src="/assets/icons/arrow-download.svg" alt="Download" className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </button>
                <button className={`p-3 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'} rounded-xl transition-all duration-200 group`}>
                  <img src="/assets/icons/refresh.svg" alt="Share" className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </button>
                <button className={`p-3 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'} rounded-xl transition-all duration-200 group`}>
                  <img src="/assets/icons/love.svg" alt="Like" className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ImageModal;
