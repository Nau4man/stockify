import React from 'react';

const BaseModal = ({
  isOpen = true,
  onClose,
  isDarkMode,
  title,
  subtitle,
  icon,
  iconWrapperClassName = 'w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center',
  titleClassName,
  subtitleClassName,
  maxWidthClassName = 'max-w-4xl',
  maxHeightClassName = 'max-h-[90vh]',
  bodyClassName = 'p-6 overflow-y-auto max-h-[calc(90vh-120px)]',
  headerContent,
  footer,
  children
}) => {
  if (!isOpen) return null;

  const resolvedTitleClassName = titleClassName || `text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`;
  const resolvedSubtitleClassName = subtitleClassName || `text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl ${maxWidthClassName} w-full ${maxHeightClassName} overflow-hidden`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {headerContent ? (
            headerContent
          ) : (
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${icon ? 'space-x-3' : ''}`}>
                {icon && (
                  <div className={iconWrapperClassName}>
                    {icon}
                  </div>
                )}
                <div>
                  {title && <h2 className={resolvedTitleClassName}>{title}</h2>}
                  {subtitle && <p className={resolvedSubtitleClassName}>{subtitle}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors duration-200`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className={bodyClassName}>{children}</div>
        {footer}
      </div>
    </div>
  );
};

export default BaseModal;
