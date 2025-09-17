# 🏢 Platform Logos Directory

This directory contains official logos for stock photo platforms supported by Stockify.

## 📁 File Structure

```
src/assets/logos/
├── README.md                    # This file
├── shutterstock-logo.svg        # Shutterstock official logo
├── adobe-stock-logo.svg         # Adobe Stock official logo
├── getty-images-logo.svg        # Getty Images logo (future)
├── unsplash-logo.svg            # Unsplash logo (future)
└── stockify-logo.svg            # Stockify app logo
```

## 🎯 Platform Logos Needed

### **Current Platforms:**
- [ ] **Shutterstock Logo** (`shutterstock-logo.svg`)
  - Format: SVG preferred
  - Size: 24x24 to 32x32 pixels
  - Color: Official Shutterstock blue (#0084FF)

- [ ] **Adobe Stock Logo** (`adobe-stock-logo.svg`)
  - Format: SVG preferred
  - Size: 24x24 to 32x32 pixels
  - Color: Official Adobe red (#FF0000)

### **Future Platforms:**
- [ ] **Getty Images Logo** (`getty-images-logo.svg`)
- [ ] **Unsplash Logo** (`unsplash-logo.svg`)
- [ ] **Pexels Logo** (`pexels-logo.svg`)
- [ ] **Depositphotos Logo** (`depositphotos-logo.svg`)

## 🚀 Usage Examples

### **Import and Use:**
```javascript
import ShutterstockLogo from '../assets/logos/shutterstock-logo.svg';
import AdobeStockLogo from '../assets/logos/adobe-stock-logo.svg';

// In component
<img src={ShutterstockLogo} alt="Shutterstock" className="w-6 h-6" />
<img src={AdobeStockLogo} alt="Adobe Stock" className="w-6 h-6" />
```

### **Dynamic Logo Selection:**
```javascript
const getPlatformLogo = (platformId) => {
  const logos = {
    shutterstock: ShutterstockLogo,
    adobe_stock: AdobeStockLogo,
    // Add more platforms as needed
  };
  return logos[platformId];
};
```

## 📝 Logo Guidelines

### **Requirements:**
- **Format**: SVG preferred for scalability
- **Size**: 24x24 to 32x32 pixels
- **Background**: Transparent
- **Quality**: High resolution, crisp edges
- **Branding**: Official brand colors and design

### **Best Practices:**
- Use official logos from brand guidelines
- Maintain aspect ratios
- Ensure readability at small sizes
- Test in both light and dark themes
- Optimize file sizes

## 🔧 Integration with PlatformSelector

The logos will be integrated into the PlatformSelector component:

```javascript
// PlatformSelector.js
import ShutterstockLogo from '../assets/logos/shutterstock-logo.svg';
import AdobeStockLogo from '../assets/logos/adobe-stock-logo.svg';

const PlatformSelector = ({ selectedPlatform, isDarkMode }) => {
  const getLogo = (platformId) => {
    switch(platformId) {
      case 'shutterstock': return ShutterstockLogo;
      case 'adobe_stock': return AdobeStockLogo;
      default: return null;
    }
  };

  return (
    <div className="platform-selector">
      <img 
        src={getLogo(selectedPlatform)} 
        alt={selectedPlatform}
        className="w-6 h-6"
      />
    </div>
  );
};
```
