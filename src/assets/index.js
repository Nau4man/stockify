/**
 * Assets Index File
 * 
 * This file provides a centralized way to import and manage all assets
 * in the Stockify application. It makes it easier to import assets
 * and provides a single source of truth for asset management.
 */

// Platform Logos
export { default as ShutterstockLogo } from './logos/shutterstock-logo.svg';
export { default as AdobeStockLogo } from './logos/adobe-stock-logo.svg';
export { default as GettyImagesLogo } from './logos/getty-images-logo.svg';
export { default as UnsplashLogo } from './logos/unsplash-logo.svg';

// Custom Icons
export { default as UploadIcon } from './icons/upload-icon.svg';
export { default as DownloadIcon } from './icons/download-icon.svg';
export { default as SettingsIcon } from './icons/settings-icon.svg';
export { default as HelpIcon } from './icons/help-icon.svg';
export { default as ThemeIcon } from './icons/theme-icon.svg';
export { default as PlatformIcon } from './icons/platform-icon.svg';

// React Icon Components
export { default as CustomIcon } from './icons/custom-icon.jsx';

// General Images
export { default as HeroBackground } from './images/hero-background.jpg';
export { default as PlaceholderImage } from './images/placeholder-image.jpg';
export { default as LoadingSpinner } from './images/loading-spinner.gif';

/**
 * Platform Logo Mapping
 * 
 * This object maps platform IDs to their corresponding logo assets.
 * Use this for dynamic logo selection in components.
 */
export const PLATFORM_LOGOS = {
  shutterstock: ShutterstockLogo,
  adobe_stock: AdobeStockLogo,
  getty_images: GettyImagesLogo,
  unsplash: UnsplashLogo,
};

/**
 * Get Platform Logo
 * 
 * Utility function to get the logo for a specific platform.
 * 
 * @param {string} platformId - The platform identifier
 * @returns {string|null} - The logo asset or null if not found
 */
export const getPlatformLogo = (platformId) => {
  return PLATFORM_LOGOS[platformId] || null;
};

/**
 * Icon Size Presets
 * 
 * Common icon sizes used throughout the application.
 */
export const ICON_SIZES = {
  xs: 'w-3 h-3',      // 12px
  sm: 'w-4 h-4',      // 16px
  md: 'w-5 h-5',      // 20px
  lg: 'w-6 h-6',      // 24px
  xl: 'w-8 h-8',      // 32px
  '2xl': 'w-10 h-10', // 40px
};

/**
 * Logo Size Presets
 * 
 * Common logo sizes used throughout the application.
 */
export const LOGO_SIZES = {
  sm: 'w-4 h-4',      // 16px
  md: 'w-6 h-6',      // 24px
  lg: 'w-8 h-8',      // 32px
  xl: 'w-10 h-10',    // 40px
  '2xl': 'w-12 h-12', // 48px
};
