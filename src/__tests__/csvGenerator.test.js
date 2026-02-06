/**
 * CSV Generator Tests
 */

import { generateCSV, validateMetadata, fixCategoryMappings } from '../utils/csvGenerator';

describe('csvGenerator', () => {
  describe('generateCSV', () => {
    it('should generate valid CSV for Shutterstock format', () => {
      const metadata = [
        {
          filename: 'test.jpg',
          description: 'A test image',
          keywords: 'test, image, sample',
          categories: 'Nature',
          editorial: 'no',
          matureContent: 'no',
          illustration: 'no'
        }
      ];

      const csv = generateCSV(metadata, 'shutterstock');

      expect(csv).toContain('Filename');
      expect(csv).toContain('Description');
      expect(csv).toContain('Keywords');
      expect(csv).toContain('test.jpg');
      expect(csv).toContain('A test image');
    });

    it('should generate valid CSV for Adobe Stock format', () => {
      const metadata = [
        {
          filename: 'test.jpg',
          title: 'A test image title',
          keywords: 'test, image, sample',
          category: '1',
          releases: ''
        }
      ];

      const csv = generateCSV(metadata, 'adobe_stock');

      expect(csv).toContain('Filename');
      expect(csv).toContain('Title');
      expect(csv).toContain('Keywords');
      expect(csv).toContain('test.jpg');
      expect(csv).toContain('A test image title');
    });

    it('should handle empty metadata array', () => {
      const csv = generateCSV([], 'shutterstock');

      // Should still have headers
      expect(csv).toContain('Filename');
    });
  });

  describe('validateMetadata', () => {
    it('should validate valid Shutterstock metadata', () => {
      const metadata = {
        filename: 'test.jpg',
        description: 'A test image description',
        keywords: 'test, image, sample',
        categories: 'Nature'
      };

      const result = validateMetadata(metadata, 'shutterstock');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject Shutterstock metadata without filename', () => {
      const metadata = {
        description: 'A test image description',
        keywords: 'test, image, sample',
        categories: 'Nature'
      };

      const result = validateMetadata(metadata, 'shutterstock');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Filename is required');
    });

    it('should reject Shutterstock metadata without description', () => {
      const metadata = {
        filename: 'test.jpg',
        keywords: 'test, image, sample',
        categories: 'Nature'
      };

      const result = validateMetadata(metadata, 'shutterstock');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Description'))).toBe(true);
    });

    it('should validate Adobe Stock metadata with keyword limit', () => {
      const tooManyKeywords = Array(50).fill('keyword').join(', ');
      const metadata = {
        filename: 'test.jpg',
        title: 'Test title',
        keywords: tooManyKeywords,
        category: '1'
      };

      const result = validateMetadata(metadata, 'adobe_stock');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('49 keywords'))).toBe(true);
    });
  });

  describe('fixCategoryMappings', () => {
    it('should map common category aliases to Shutterstock categories', () => {
      const metadata = {
        filename: 'test.jpg',
        categories: 'Landscapes, Wildlife'
      };

      const fixed = fixCategoryMappings(metadata, 'shutterstock');

      expect(fixed.categories).toContain('Nature');
      expect(fixed.categories).toContain('Animals/Wildlife');
    });

    it('should not modify Adobe Stock metadata', () => {
      const metadata = {
        filename: 'test.jpg',
        category: '1'
      };

      const fixed = fixCategoryMappings(metadata, 'adobe_stock');

      expect(fixed).toEqual(metadata);
    });

    it('should handle array categories', () => {
      const metadata = {
        filename: 'test.jpg',
        categories: ['Landscapes', 'Nature']
      };

      const fixed = fixCategoryMappings(metadata, 'shutterstock');

      expect(fixed.categories).toContain('Nature');
    });
  });
});
