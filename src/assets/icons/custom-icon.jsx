import React from 'react';

/**
 * Custom Icon Component Example
 * 
 * This is an example of how to create custom React icon components
 * that can be easily styled and reused throughout the application.
 */

const CustomIcon = ({ 
  className = "w-5 h-5", 
  color = "currentColor",
  strokeWidth = 2,
  ...props 
}) => {
  return (
    <svg
      className={className}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Example: Upload icon */}
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
};

export default CustomIcon;
