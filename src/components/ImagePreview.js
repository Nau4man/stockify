import React, { useState, useMemo, useEffect, useRef } from 'react';

const ImagePreview = ({ images, onRemoveImage, onImageClick, onImageSelect, selectedImageIndex, isDarkMode = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage] = useState(12); // Show 12 images per page

  // Use ref to track created URLs for proper cleanup (prevents memory leaks)
  const urlsRef = useRef(new Map());

  // Calculate pagination
  const totalPages = images ? Math.ceil(images.length / imagesPerPage) : 0;
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;

  // Memoize currentImages to prevent unnecessary re-renders
  const currentImages = useMemo(() => {
    return images ? images.slice(startIndex, endIndex) : [];
  }, [images, startIndex, endIndex]);

  // Create stable image URLs - only create new URLs when images actually change
  const imageUrls = useMemo(() => {
    if (!currentImages.length) return new Map();

    const newUrls = new Map();
    const oldUrls = urlsRef.current;

    currentImages.forEach((image, index) => {
      const actualIndex = startIndex + index;
      // Use existing URL if the image object is the same (by reference)
      // This prevents creating duplicate URLs for the same image
      const existingEntry = Array.from(oldUrls.entries()).find(
        ([, data]) => data.image === image
      );

      if (existingEntry) {
        newUrls.set(actualIndex, { url: existingEntry[1].url, image });
      } else {
        // Create new URL only for new images
        const url = URL.createObjectURL(image);
        newUrls.set(actualIndex, { url, image });
      }
    });

    // Revoke URLs that are no longer needed
    oldUrls.forEach((data, key) => {
      const stillInUse = Array.from(newUrls.values()).some(
        newData => newData.url === data.url
      );
      if (!stillInUse) {
        URL.revokeObjectURL(data.url);
      }
    });

    // Update ref with current URLs
    urlsRef.current = newUrls;

    return newUrls;
  }, [currentImages, startIndex]);

  // Cleanup all URLs on unmount
  useEffect(() => {
    return () => {
      urlsRef.current.forEach(data => URL.revokeObjectURL(data.url));
      urlsRef.current.clear();
    };
  }, []);

  // Helper to get URL from the map
  const getImageUrl = (index) => {
    const data = imageUrls.get(index);
    return data ? data.url : null;
  };

  if (!images || images.length === 0) {
    return null;
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleShowAll = () => {
    setCurrentPage(totalPages);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Uploaded Images ({images.length})
        </h3>
        {totalPages > 1 && (
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {currentImages.length === 0 ? (
          <div className={`col-span-full text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No images to display on this page.
          </div>
        ) : (
          currentImages.map((image, index) => {
            const actualIndex = startIndex + index;
            const imageUrl = getImageUrl(actualIndex);
            
            return (
            <div key={actualIndex} className="relative group">
              <div 
                className={`aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:shadow-lg transition-all duration-200 ${
                  selectedImageIndex === actualIndex 
                    ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => {
                  onImageSelect && onImageSelect(actualIndex);
                }}
              >
                <img
                  src={getImageUrl(actualIndex)}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {/* Selection Indicator */}
              {selectedImageIndex === actualIndex && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Action Buttons - Top Right */}
              <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Preview Icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageClick && onImageClick(image);
                  }}
                  className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors duration-200 shadow-lg"
                  title="Preview image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                
                {/* Remove Icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage && onRemoveImage(actualIndex);
                  }}
                  className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-2">
                <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} truncate`} title={image.name}>
                  {image.name}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {(image.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center space-x-4">
          {currentPage > 1 && (
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Previous
            </button>
          )}
          
          {/* Page Numbers */}
          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                    currentPage === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {currentPage < totalPages && (
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Next
            </button>
          )}
        </div>
      )}

      {/* Load More / Show All Options */}
      {currentPage < totalPages && (
        <div className="mt-4 flex items-center justify-center space-x-4">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Load More ({imagesPerPage} more)
          </button>
          
          {totalPages > 2 && (
            <button
              onClick={handleShowAll}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Show All ({images.length - (currentPage * imagesPerPage)} remaining)
            </button>
          )}
        </div>
      )}

      {/* Performance Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Showing {currentImages.length} of {images.length} images
          {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
        </p>
      </div>
    </div>
  );
};

export default ImagePreview;
