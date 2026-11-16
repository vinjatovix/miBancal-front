import {
  A4_LONG_SIDE_MM,
  A4_SHORT_SIDE_MM,
  MM_PER_CM,
  PAGE_MARGIN_MM,
  fitBox,
  getContentArea,
  getPageSize,
  resolveOrientation
} from '../../../../src/services/pdf/utils/pdfGeometry';

describe('pdfGeometry', () => {
  describe('getPageSize', () => {
    it('returns A4 portrait dimensions', () => {
      const size = getPageSize('portrait');

      expect(size).toEqual({
        widthMm: A4_SHORT_SIDE_MM,
        heightMm: A4_LONG_SIDE_MM
      });
    });

    it('returns A4 landscape dimensions with swapped sides', () => {
      const size = getPageSize('landscape');

      expect(size).toEqual({
        widthMm: A4_LONG_SIDE_MM,
        heightMm: A4_SHORT_SIDE_MM
      });
    });
  });

  describe('getContentArea', () => {
    it('insets the page by the safety margin on every side', () => {
      const area = getContentArea('portrait');

      expect(area).toEqual({
        xMm: PAGE_MARGIN_MM,
        yMm: PAGE_MARGIN_MM,
        widthMm: A4_SHORT_SIDE_MM - PAGE_MARGIN_MM * 2,
        heightMm: A4_LONG_SIDE_MM - PAGE_MARGIN_MM * 2
      });
    });

    it('keeps the safety margin above the required minimum of 12 mm', () => {
      expect(PAGE_MARGIN_MM).toBeGreaterThanOrEqual(12);
    });
  });

  describe('resolveOrientation', () => {
    it('chooses landscape when width is greater than or equal to height', () => {
      expect(resolveOrientation(400, 200)).toBe('landscape');
      expect(resolveOrientation(300, 300)).toBe('landscape');
    });

    it('chooses portrait when height is greater than width', () => {
      expect(resolveOrientation(120, 400)).toBe('portrait');
    });
  });

  describe('fitBox', () => {
    it('scales content to fit the area preserving aspect ratio', () => {
      const area = { xMm: 0, yMm: 0, widthMm: 100, heightMm: 100 };

      const box = fitBox(400, 200, area);

      expect(box.scale).toBeCloseTo(0.25, 5);
      expect(box.widthMm).toBeCloseTo(100, 5);
      expect(box.heightMm).toBeCloseTo(50, 5);
    });

    it('centers the scaled content inside the area', () => {
      const area = { xMm: 10, yMm: 20, widthMm: 100, heightMm: 100 };

      const box = fitBox(400, 200, area);

      expect(box.offsetXMm).toBeCloseTo(10, 5);
      expect(box.offsetYMm).toBeCloseTo(20 + (100 - 50) / 2, 5);
    });

    it('never upscales content beyond its metric size', () => {
      const area = { xMm: 0, yMm: 0, widthMm: 1000, heightMm: 1000 };

      const box = fitBox(10, 10, area);

      expect(box.scale).toBeLessThanOrEqual(MM_PER_CM);
      expect(box.widthMm).toBeCloseTo(100, 5);
    });

    it('returns a zero-scale centered box for empty content', () => {
      const area = { xMm: 0, yMm: 0, widthMm: 100, heightMm: 80 };

      const box = fitBox(0, 0, area);

      expect(box.scale).toBe(0);
      expect(box.widthMm).toBe(0);
      expect(box.heightMm).toBe(0);
      expect(box.offsetXMm).toBeCloseTo(50, 5);
      expect(box.offsetYMm).toBeCloseTo(40, 5);
    });
  });
});
