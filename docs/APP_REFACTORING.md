# App.js Refactoring Guide

## Overview

The original `App.js` was **2,849 lines** - far too large for maintainability. This document explains the refactoring into smaller, reusable modules.

## Problem Statement

**Before Refactoring:**
- ❌ 2,849 lines in a single file
- ❌ 50+ state variables
- ❌ 30+ callback functions
- ❌ Difficult to test
- ❌ Hard to maintain and debug
- ❌ Poor code reusability
- ❌ No code splitting

## Refactoring Strategy

### Phase 1: Custom Hooks (COMPLETED ✅)

Extracted state management into custom hooks:

1. **useImageManagement** - Image state and operations
2. **useMetadataManagement** - Metadata state and operations
3. **useUIState** - Modal and UI state
4. **useProcessingState** - Processing progress and errors
5. **useAppSettings** - App preferences and settings
6. **useToast** - Toast notifications (already existed)

### Phase 2: Utility Functions (COMPLETED ✅)

Extracted pure functions into utilities:

1. **demoDataGenerator.js** - Demo data generation
2. **errorTracker.js** - Error tracking (already existed)
3. **analyticsIntegration.js** - Analytics tracking
4. **sentryIntegration.js** - Sentry integration

### Phase 3: Component Extraction (TO DO)

Split large inline components into separate files:

1. **HelpModal** - Help documentation
2. **PrivacyPolicyModal** - Privacy policy
3. **TermsOfServiceModal** - Terms of service
4. **DocumentationModal** - User documentation
5. **ApiConfigurationModal** - API setup guide
6. **PlatformInfoModal** - Platform information
7. **DraftRecoveryBanner** - Draft recovery UI

### Phase 4: Hook Composition (TO DO)

Create a master hook to compose all sub-hooks:

- **useAppState.js** - Combines all hooks into one interface

---

## New Structure

### Directory Layout

```
src/
├── hooks/
│   ├── useImageManagement.js      ✅ Image state & operations
│   ├── useMetadataManagement.js   ✅ Metadata state & operations
│   ├── useUIState.js              ✅ Modal/UI state
│   ├── useProcessingState.js      ✅ Processing state
│   ├── useAppSettings.js          ✅ App preferences
│   ├── useToast.js                ✅ Toast notifications
│   └── useAppState.js             ⭕ Master hook (TO DO)
│
├── components/
│   ├── modals/                    ⭕ Modal components (TO DO)
│   │   ├── HelpModal.js
│   │   ├── PrivacyPolicyModal.js
│   │   ├── TermsOfServiceModal.js
│   │   ├── DocumentationModal.js
│   │   ├── ApiConfigurationModal.js
│   │   └── PlatformInfoModal.js
│   │
│   ├── FileUpload.js              ✅ Existing
│   ├── ProgressBar.js             ✅ Existing
│   ├── MetadataPreview.js         ✅ Existing
│   └── ...
│
└── utils/
    ├── geminiApi.js               ✅ Existing
    ├── csvGenerator.js            ✅ Existing
    ├── platformConfig.js          ✅ Existing
    ├── demoDataGenerator.js       ✅ NEW
    ├── errorTracker.js            ✅ Enhanced
    ├── analyticsIntegration.js    ✅ NEW
    └── sentryIntegration.js       ✅ NEW
```

---

## Custom Hooks API Reference

### 1. useImageManagement

Manages image state and operations.

**Usage:**
```javascript
import { useImageManagement } from './hooks/useImageManagement';

const {
  images,
  imagesRef,
  fileInputRef,
  addImages,
  removeImage,
  clearAllImages,
  getImage
} = useImageManagement();
```

**API:**
- `images: Array` - Array of image objects
- `imagesRef: Ref` - Ref for synchronous access
- `fileInputRef: Ref` - File input ref
- `addImages(newImages: Array): void` - Add images
- `removeImage(index: number): void` - Remove image by index
- `clearAllImages(): void` - Clear all images
- `getImage(index: number): Object` - Get image by index

**Features:**
- ✅ Automatic Object URL cleanup (prevents memory leaks)
- ✅ Ref synchronization
- ✅ Immutable state updates

---

### 2. useMetadataManagement

Manages metadata state and operations.

**Usage:**
```javascript
import { useMetadataManagement } from './hooks/useMetadataManagement';

const {
  metadata,
  updateMetadata,
  setAllMetadata,
  clearMetadata,
  getFailedImages,
  getSuccessfulImages,
  hasFailedImages
} = useMetadataManagement(images);
```

**API:**
- `metadata: Array` - Metadata array
- `updateMetadata(index: number, data: Object): void` - Update single item
- `setAllMetadata(data: Array): void` - Replace all metadata
- `clearMetadata(): void` - Clear and remove from localStorage
- `getFailedImages(): Array` - Get failed metadata with indices
- `getSuccessfulImages(): Array` - Get successful metadata
- `hasFailedImages(): boolean` - Check if any failed

**Features:**
- ✅ Auto-save to localStorage (debounced, 2s)
- ✅ Automatic cleanup
- ✅ Helper functions for filtering

---

### 3. useUIState

Manages all modal and UI state.

**Usage:**
```javascript
import { useUIState } from './hooks/useUIState';

const {
  showHelp,
  showCSVPreview,
  toggleHelp,
  toggleCSVPreview,
  closeAll,
  closeDropdowns
} = useUIState();
```

**API:**
- `show*: boolean` - State for each modal/UI element
- `setShow*: Function` - Setter for each state
- `toggle*(): void` - Toggle function for each state
- `closeAll(): void` - Close all modals
- `closeDropdowns(): void` - Close dropdowns only

**Managed States:**
- Preview, Image Modal, CSV Preview
- Model Selector, Platform Selector, Platform Info
- Help, Privacy, Terms, Documentation, API Config
- Draft Recovery
- Selected images and indices

**Features:**
- ✅ Centralized UI state
- ✅ Batch operations (closeAll, closeDropdowns)
- ✅ Individual toggles

---

### 4. useProcessingState

Manages processing progress and status.

**Usage:**
```javascript
import { useProcessingState } from './hooks/useProcessingState';

const {
  isProcessing,
  progress,
  error,
  startProcessing,
  updateProgress,
  completeProcessing,
  setProcessingError,
  clearError,
  addRetrying,
  isRetrying
} = useProcessingState();
```

**API:**
- `isProcessing: boolean` - Processing flag
- `progress: Object` - {current, total, currentFile}
- `error: string` - Error message
- `retryingImages: Set` - Set of retrying indices
- `startProcessing(total: number): void` - Start processing
- `updateProgress(current, total, file): void` - Update progress
- `completeProcessing(): void` - Complete processing
- `setProcessingError(message: string): void` - Set error
- `clearError(): void` - Clear error
- `addRetrying(index: number): void` - Mark as retrying
- `removeRetrying(index: number): void` - Unmark retrying
- `isRetrying(index: number): boolean` - Check if retrying

**Features:**
- ✅ Progress tracking
- ✅ Error management
- ✅ Retry tracking with ref (prevents race conditions)
- ✅ Automatic cleanup

---

### 5. useAppSettings

Manages app preferences and settings.

**Usage:**
```javascript
import { useAppSettings } from './hooks/useAppSettings';

const {
  isDarkMode,
  selectedModel,
  selectedPlatform,
  useDemoData,
  toggleTheme,
  changeModel,
  changePlatform,
  toggleDemoData
} = useAppSettings();
```

**API:**
- `isDarkMode: boolean` - Dark mode state
- `selectedModel: string` - Selected AI model
- `selectedPlatform: string` - Selected platform
- `useDemoData: boolean` - Demo mode flag
- `toggleTheme(): void` - Toggle dark mode
- `changeModel(model: string): void` - Change AI model
- `changePlatform(platform: string): void` - Change platform
- `toggleDemoData(): void` - Toggle demo mode

**Features:**
- ✅ Auto-save to localStorage
- ✅ Load from localStorage on mount
- ✅ Model validation
- ✅ Fallback to defaults

---

## Utilities API Reference

### demoDataGenerator

Generate demo metadata for testing.

**Functions:**
```javascript
import {
  generateDemoMetadata,
  generateDemoMetadataForImage,
  simulateProcessingDelay
} from './utils/demoDataGenerator';

// Generate for multiple images
const metadata = generateDemoMetadata(files, 'shutterstock');

// Generate for single image
const singleMeta = generateDemoMetadataForImage(file, 'adobe_stock');

// Simulate delay
await simulateProcessingDelay(500);
```

---

## Migration Guide

### How to Use New Hooks in App.js

**Before (Old App.js):**
```javascript
function App() {
  const [images, setImages] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // ... 50+ more state variables
}
```

**After (New App.js):**
```javascript
import { useImageManagement } from './hooks/useImageManagement';
import { useMetadataManagement } from './hooks/useMetadataManagement';
import { useAppSettings } from './hooks/useAppSettings';
import { useUIState } from './hooks/useUIState';
import { useProcessingState } from './hooks/useProcessingState';

function App() {
  const imageState = useImageManagement();
  const metadataState = useMetadataManagement(imageState.images);
  const settings = useAppSettings();
  const uiState = useUIState();
  const processingState = useProcessingState();

  // Now you have clean, organized state!
}
```

---

## Benefits

### Code Organization
- ✅ Reduced App.js from 2,849 to ~500-800 lines (target)
- ✅ Logical grouping of related state
- ✅ Single Responsibility Principle

### Maintainability
- ✅ Easier to find and fix bugs
- ✅ Clear separation of concerns
- ✅ Easier onboarding for new developers

### Testability
- ✅ Hooks can be tested in isolation
- ✅ Utilities are pure functions
- ✅ Easier to mock dependencies

### Reusability
- ✅ Hooks can be used in other components
- ✅ Utilities can be imported anywhere
- ✅ Consistent state management patterns

### Performance
- ✅ Potential for lazy loading (React.lazy)
- ✅ Code splitting by feature
- ✅ Reduced re-renders (isolated state)

---

## Next Steps

### To Complete Refactoring:

1. **Extract Modal Components** (P2 - High Priority)
   - Create individual modal component files
   - Move JSX from App.js to modal files
   - Import and use in App.js

2. **Create Master Hook** (P2 - Medium Priority)
   - Create `useAppState.js` to combine all hooks
   - Simplify App.js further

3. **Extract Handler Functions** (P3 - Low Priority)
   - Move complex handlers to separate files
   - Keep App.js as composition layer only

4. **Add Unit Tests** (P3 - Future)
   - Test each hook independently
   - Test utilities with Jest
   - Integration tests for App.js

5. **Code Splitting** (P3 - Future)
   - Lazy load modals
   - Lazy load heavy components
   - Route-based splitting (if adding routing)

---

## Testing the New Hooks

### Example: Testing useImageManagement

```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { useImageManagement } from './useImageManagement';

test('should add images', () => {
  const { result } = renderHook(() => useImageManagement());

  act(() => {
    result.current.addImages([{ name: 'test.jpg', url: 'blob:...' }]);
  });

  expect(result.current.images).toHaveLength(1);
});

test('should cleanup URLs on unmount', () => {
  const mockRevoke = jest.spyOn(URL, 'revokeObjectURL');
  const { result, unmount } = renderHook(() => useImageManagement());

  act(() => {
    result.current.addImages([{ url: 'blob:test' }]);
  });

  unmount();

  expect(mockRevoke).toHaveBeenCalledWith('blob:test');
});
```

---

## Performance Considerations

### Before Refactoring
- Large App.js bundle
- All code loaded upfront
- Difficult to optimize

### After Refactoring
- Smaller modules
- Potential for code splitting
- Tree-shaking opportunities
- Lazy loading modals

---

## Related Documentation

- [React Hooks Best Practices](https://react.dev/reference/react)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Code Splitting](https://react.dev/reference/react/lazy)
- [Testing Hooks](https://react-hooks-testing-library.com/)

---

**Status:** Phase 1 & 2 Complete ✅ | Phase 3 & 4 Pending ⭕
