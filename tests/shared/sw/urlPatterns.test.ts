import { describe, expect, it } from 'vitest';

import { API_PUBLIC_PLANTS_PATTERN } from '../../../src/shared/sw/urlPatterns';

describe('urlPatterns', () => {
  describe('API_PUBLIC_PLANTS_PATTERN', () => {
    it.each([
      ['/api/v1/plants'],
      ['/api/v2/plants'],
      ['/api/v1/plants/tomato-1'],
      ['/api/v1/plants/550e8400-e29b-41d4-a716-446655440000'],
      ['/api/v1/plants?page=1&limit=10'],
      ['/api/v1/plants/tomato-1?fields=name'],
      ['http://localhost:3000/api/v1/plants'],
      ['http://localhost:3000/api/v1/plants/tomato-1'],
      ['https://api.mibancal.com/api/v1/plants?page=2'],
      [
        'https://api.mibancal.com/api/v2/plants/550e8400-e29b-41d4-a716-446655440000'
      ]
    ])('matches public plants endpoint %s', (path) => {
      const isMatched = API_PUBLIC_PLANTS_PATTERN.test(path);

      expect(isMatched).toBe(true);
    });

    it.each([
      ['/api/v1/beds'],
      ['/api/v1/admin/users'],
      ['/api/v1/plants/tomato-1/details'],
      ['/plants'],
      ['/plants/tomato-1'],
      ['http://localhost:3000/api/v1/beds'],
      ['http://localhost:3000/api/v1/plants/tomato-1/details'],
      ['https://api.mibancal.com/api/v1/plants/tomato-1/likes']
    ])('rejects non-public or non-plant endpoint %s', (path) => {
      const isMatched = API_PUBLIC_PLANTS_PATTERN.test(path);

      expect(isMatched).toBe(false);
    });

    it('handles limit input efficiently to avoid super-linear backtracking', () => {
      const maliciousInput = '/api/v1/plants/' + 'a'.repeat(5000) + '/';
      const start = performance.now();
      const isMatched = API_PUBLIC_PLANTS_PATTERN.test(maliciousInput);
      const duration = performance.now() - start;

      expect(isMatched).toBe(false);
      expect(duration).toBeLessThan(100);
    });
  });
});
