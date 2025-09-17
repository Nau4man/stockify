import React, { useCallback, useState } from 'react';

const FileUpload = ({ onFilesSelected, isProcessing, isDarkMode = false }) => {
  const [isDragActive, setDragActive] = useState(false);
  const [dragReject, setDragReject] = useState(false);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
      setDragReject(false);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setDragReject(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setDragReject(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        setDragReject(true);
        return;
      }
      
      onFilesSelected(imageFiles);
    }
  }, [onFilesSelected]);

  // Handle file input change
  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    const validFiles = [];
    const errors = [];
    
    files.forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Not an image file`);
        return;
      }
      
      // Check file size (max 20MB)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large (max 20MB)`);
        return;
      }
      
      // Check if file is empty
      if (file.size === 0) {
        errors.push(`${file.name}: Empty file`);
        return;
      }
      
      validFiles.push(file);
    });
    
    // Show errors if any
    if (errors.length > 0) {
      console.warn('File validation errors:', errors);
      // You could show these errors to the user if needed
    }
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    } else if (files.length > 0) {
      // All files were invalid
      console.error('No valid image files selected');
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50/50 scale-105 shadow-lg' 
            : dragReject 
            ? 'border-red-500 bg-red-50/50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:shadow-lg'}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-6">
          <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragActive 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 scale-110' 
              : 'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}>
            <svg
              className={`w-10 h-10 transition-colors duration-300 ${
                isDragActive ? 'text-white' : (isDarkMode ? 'text-gray-500' : 'text-gray-400')
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          
          <div>
            <p className={`text-xl font-bold transition-colors duration-300 ${
              isDragActive ? 'text-blue-600' : (isDarkMode ? 'text-white' : 'text-gray-900')
            }`}>
              {isDragActive 
                ? 'Drop your images here' 
                : 'Upload images or drag and drop'}
            </p>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-2 text-base`}>
              Supports JPG, PNG, GIF, and other image formats
            </p>
            {dragReject && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-red-100 rounded-full">
                <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-red-600 font-medium">Please select only image files</span>
              </div>
            )}
          </div>
          
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
            <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-600 font-medium">Perfect for generating stock photo metadata</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
