import { describe, it, expect } from 'vitest';
import { buildPaginationPages } from '../../../../src/shared/utils/pagination/buildPaginationPages';

describe('buildPaginationPages', () => {
  it('returns full range when total is small', () => {
    expect(buildPaginationPages(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('always includes first and last pages', () => {
    const result = buildPaginationPages(10, 20);

    expect(result[0]).toBe(1);
    expect(result[result.length - 1]).toBe(20);
  });

  it('includes current page', () => {
    const result = buildPaginationPages(10, 20);

    expect(result).toContain(10);
  });

  it('has no duplicates', () => {
    const result = buildPaginationPages(10, 20);

    expect(new Set(result).size).toBe(result.length - 1); // ... appears twice
  });

  it('limits ellipsis usage correctly', () => {
    const result = buildPaginationPages(10, 20);

    const ellipsisCount = result.filter((p) => p === '...').length;

    expect(ellipsisCount).toBeLessThanOrEqual(2);
  });

  it('uses ellipsis when needed', () => {
    const result = buildPaginationPages(10, 20);

    expect(result).toContain('...');
  });

  it('does not use ellipsis for small ranges', () => {
    const result = buildPaginationPages(3, 6);

    expect(result).not.toContain('...');
  });
});
