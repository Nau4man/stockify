/**
 * Storage Manager Tests
 */

import {
  saveDraftMetadata,
  loadDraftMetadata,
  clearDraftMetadata,
  hasDraft,
  savePreferences,
  loadPreferences,
  formatRelativeTime
} from '../utils/storageManager';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('storageManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('saveDraftMetadata', () => {
    it('should save metadata to localStorage', () => {
      const metadata = [{ filename: 'test.jpg', description: 'Test' }];
      const imageNames = ['test.jpg'];

      const result = saveDraftMetadata(metadata, imageNames);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should not save empty metadata', () => {
      jest.clearAllMocks(); // Clear mocks after isStorageAvailable check
      const result = saveDraftMetadata([], []);

      expect(result).toBe(false);
      // isStorageAvailable() calls setItem once for testing, so we check for only that call
      const draftSaveCalls = localStorageMock.setItem.mock.calls.filter(
        call => call[0] === 'stockify_draft_metadata'
      );
      expect(draftSaveCalls).toHaveLength(0);
    });

    it('should not save null metadata', () => {
      const result = saveDraftMetadata(null, []);

      expect(result).toBe(false);
    });
  });

  describe('loadDraftMetadata', () => {
    it('should load valid draft from localStorage', () => {
      const draft = {
        metadata: [{ filename: 'test.jpg' }],
        imageNames: ['test.jpg'],
        timestamp: Date.now(),
        version: 1
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(draft));

      const result = loadDraftMetadata();

      expect(result).toEqual(draft);
    });

    it('should return null for expired draft (over 24 hours)', () => {
      const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      const draft = {
        metadata: [{ filename: 'test.jpg' }],
        timestamp: oldTimestamp,
        version: 1
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(draft));

      const result = loadDraftMetadata();

      expect(result).toBeNull();
    });

    it('should return null when no draft exists', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = loadDraftMetadata();

      expect(result).toBeNull();
    });
  });

  describe('hasDraft', () => {
    it('should return draft info when draft exists', () => {
      const draft = {
        metadata: [{ filename: 'test.jpg' }, { filename: 'test2.jpg' }],
        imageNames: ['test.jpg', 'test2.jpg'],
        timestamp: Date.now(),
        version: 1
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(draft));

      const result = hasDraft();

      expect(result).not.toBeNull();
      expect(result.count).toBe(2);
    });

    it('should return null when no draft exists', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = hasDraft();

      expect(result).toBeNull();
    });
  });

  describe('savePreferences', () => {
    it('should save platform preference', () => {
      savePreferences({ platform: 'adobe_stock' });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stockify_selected_platform',
        'adobe_stock'
      );
    });

    it('should save dark mode preference', () => {
      savePreferences({ darkMode: true });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stockify_dark_mode',
        'true'
      );
    });

    it('should save multiple preferences', () => {
      jest.clearAllMocks(); // Clear mocks after isStorageAvailable check
      savePreferences({ platform: 'shutterstock', darkMode: false });

      // Check that both preferences were saved (not counting isStorageAvailable test call)
      const prefCalls = localStorageMock.setItem.mock.calls.filter(
        call => call[0].startsWith('stockify_')
      );
      expect(prefCalls.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('loadPreferences', () => {
    it('should load saved preferences', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('adobe_stock') // platform
        .mockReturnValueOnce('gemini-3-flash-preview') // model
        .mockReturnValueOnce('true'); // darkMode

      const result = loadPreferences();

      expect(result.platform).toBe('adobe_stock');
      expect(result.model).toBe('gemini-3-flash-preview');
      expect(result.darkMode).toBe(true);
    });

    it('should return empty object when no preferences saved', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadPreferences();

      expect(result).toEqual({});
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent time as "just now"', () => {
      const result = formatRelativeTime(Date.now() - 30000); // 30 seconds ago

      expect(result).toBe('just now');
    });

    it('should format minutes ago', () => {
      const result = formatRelativeTime(Date.now() - 5 * 60 * 1000); // 5 minutes ago

      expect(result).toBe('5 minutes ago');
    });

    it('should format single minute correctly', () => {
      const result = formatRelativeTime(Date.now() - 60 * 1000); // 1 minute ago

      expect(result).toBe('1 minute ago');
    });

    it('should format hours ago', () => {
      const result = formatRelativeTime(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago

      expect(result).toBe('3 hours ago');
    });

    it('should format days ago', () => {
      const result = formatRelativeTime(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

      expect(result).toBe('2 days ago');
    });
  });
});
