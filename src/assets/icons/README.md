# 🎨 Custom Icons Directory

This directory contains custom SVG icons and React icon components for the Stockify application.

## 📁 File Structure

```
src/assets/icons/
├── README.md           # This file
├── upload-icon.svg     # File upload icon
├── download-icon.svg   # Download icon
├── settings-icon.svg   # Settings icon
├── help-icon.svg       # Help icon
├── theme-icon.svg      # Theme toggle icon
├── platform-icon.svg   # Platform selection icon
└── custom-icon.jsx     # Example React icon component
```

## 🎯 Usage Examples

### **SVG Icons:**
```javascript
import UploadIcon from '../assets/icons/upload-icon.svg';

// Use in JSX
<img src={UploadIcon} alt="Upload" className="w-5 h-5" />
```

### **React Icon Components:**
```javascript
import CustomIcon from '../assets/icons/custom-icon.jsx';

// Use as component
<CustomIcon className="w-5 h-5 text-blue-500" />
```

## 📋 Icon Checklist

- [ ] Upload icon
- [ ] Download icon
- [ ] Settings icon
- [ ] Help icon
- [ ] Theme toggle icon
- [ ] Platform selection icon
- [ ] Success icon
- [ ] Error icon
- [ ] Warning icon
- [ ] Info icon
