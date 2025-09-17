# 📁 Assets Directory Structure

This directory contains all the static assets for the Stockify application.

## 📂 Directory Structure

```
src/assets/
├── icons/           # Custom SVG icons and icon components
├── logos/           # Platform logos (Shutterstock, Adobe Stock, etc.)
├── images/          # General images, illustrations, backgrounds
├── fonts/           # Custom fonts (if any)
└── README.md        # This file
```

## 🎯 Usage Guidelines

### **Icons (`src/assets/icons/`)**
- **Purpose**: Custom SVG icons and React icon components
- **Format**: `.svg` files or `.jsx` components
- **Naming**: `kebab-case` (e.g., `upload-icon.svg`, `download-icon.jsx`)
- **Import**: `import UploadIcon from '../assets/icons/upload-icon.svg';`

### **Logos (`src/assets/logos/`)**
- **Purpose**: Platform logos and brand assets
- **Format**: `.svg` (preferred) or `.png` files
- **Naming**: `platform-name-logo.svg` (e.g., `shutterstock-logo.svg`)
- **Import**: `import ShutterstockLogo from '../assets/logos/shutterstock-logo.svg';`

### **Images (`src/assets/images/`)**
- **Purpose**: General images, illustrations, backgrounds
- **Format**: `.png`, `.jpg`, `.webp` files
- **Naming**: `kebab-case` (e.g., `hero-background.jpg`)
- **Import**: `import HeroBg from '../assets/images/hero-background.jpg';`

### **Fonts (`src/assets/fonts/`)**
- **Purpose**: Custom fonts and font files
- **Format**: `.woff2`, `.woff`, `.ttf` files
- **Naming**: `font-name.woff2` (e.g., `inter-regular.woff2`)

## 🚀 Best Practices

### **1. File Organization**
- Use descriptive, kebab-case names
- Group related assets in subdirectories
- Keep file sizes optimized

### **2. Import Methods**
```javascript
// For SVG files
import Logo from '../assets/logos/logo.svg';

// For images
import Image from '../assets/images/image.jpg';

// For React components
import CustomIcon from '../assets/icons/custom-icon.jsx';
```

### **3. Public vs Src Assets**
- **`src/assets/`**: For assets that need processing/bundling
- **`public/assets/`**: For assets that should be served directly

### **4. Optimization**
- Use SVG for icons and logos when possible
- Optimize images for web (WebP format preferred)
- Use appropriate sizes (24x24 for icons, 32x32 for logos)

## 📋 Asset Checklist

### **Platform Logos Needed:**
- [ ] `shutterstock-logo.svg` - Shutterstock official logo
- [ ] `adobe-stock-logo.svg` - Adobe Stock official logo
- [ ] `getty-images-logo.svg` - Getty Images logo (future)
- [ ] `unsplash-logo.svg` - Unsplash logo (future)

### **Custom Icons Needed:**
- [ ] `upload-icon.svg` - File upload icon
- [ ] `download-icon.svg` - Download icon
- [ ] `settings-icon.svg` - Settings icon
- [ ] `help-icon.svg` - Help icon
- [ ] `theme-icon.svg` - Theme toggle icon

### **General Images:**
- [ ] `hero-background.jpg` - Hero section background
- [ ] `placeholder-image.jpg` - Placeholder for missing images
- [ ] `loading-spinner.gif` - Loading animation

## 🔧 Integration Examples

### **Using SVG Icons:**
```javascript
import React from 'react';
import UploadIcon from '../assets/icons/upload-icon.svg';

const UploadButton = () => (
  <button className="flex items-center gap-2">
    <img src={UploadIcon} alt="Upload" className="w-5 h-5" />
    Upload Files
  </button>
);
```

### **Using Logo Assets:**
```javascript
import React from 'react';
import ShutterstockLogo from '../assets/logos/shutterstock-logo.svg';

const PlatformSelector = () => (
  <div className="flex items-center gap-2">
    <img src={ShutterstockLogo} alt="Shutterstock" className="w-6 h-6" />
    <span>Shutterstock</span>
  </div>
);
```

### **Using Image Assets:**
```javascript
import React from 'react';
import HeroBg from '../assets/images/hero-background.jpg';

const HeroSection = () => (
  <div 
    className="hero-section"
    style={{ backgroundImage: `url(${HeroBg})` }}
  >
    {/* Hero content */}
  </div>
);
```

## 📝 Notes

- Always use relative imports from the assets directory
- Keep assets organized and well-named
- Optimize file sizes for better performance
- Use appropriate formats for different use cases
- Consider using a build tool like Webpack for asset optimization
