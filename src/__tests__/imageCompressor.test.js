/**
 * Image Compressor Tests
 */

import { checkPayloadSize, estimateBase64Size, formatBytes } from '../utils/imageCompressor';

describe('imageCompressor', () => {
  describe('estimateBase64Size', () => {
    it('should estimate base64 size with 37% overhead', () => {
      const blobSize = 1000000; // 1MB
      const estimated = estimateBase64Size(blobSize);

      // Base64 adds ~33% overhead, we use 37% for safety margin
      expect(estimated).toBeGreaterThan(blobSize);
      expect(estimated).toBeLessThan(blobSize * 1.5);
    });

    it('should handle zero size', () => {
      const estimated = estimateBase64Size(0);

      expect(estimated).toBe(0);
    });
  });

  describe('checkPayloadSize', () => {
    it('should indicate file will exceed limit for large files', () => {
      const largeFile = { size: 4 * 1024 * 1024 }; // 4MB

      const result = checkPayloadSize(largeFile);

      expect(result.willExceed).toBe(true);
      expect(result.recommendation).toBeTruthy();
    });

    it('should indicate file is within limits for small files', () => {
      const smallFile = { size: 1 * 1024 * 1024 }; // 1MB

      const result = checkPayloadSize(smallFile);

      expect(result.willExceed).toBe(false);
      expect(result.recommendation).toBeNull();
    });

    it('should return limit as 4.5MB', () => {
      const file = { size: 1000 };

      const result = checkPayloadSize(file);

      expect(result.limit).toBe(4.5 * 1024 * 1024);
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('should format fractional values', () => {
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(2621440)).toBe('2.5 MB');
    });
  });
});
