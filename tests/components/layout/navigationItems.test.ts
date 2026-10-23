import { describe, expect, it } from 'vitest';

import { NAVIGATION_ITEMS } from '../../../src/components/layout/navigationItems';

describe('navigationItems', () => {
  it('contains at least one navigation item and specifically plants and families in order', () => {
    const ids = NAVIGATION_ITEMS.map((item) => item.id);

    expect(ids).toEqual(['plants', 'families']);
  });

  it.each([
    ['plants', 'app.nav.plants', '/plants', 'eco'],
    ['families', 'app.nav.families', '/families', 'biotech']
  ] as const)(
    'configures %s with correct labelKey, path, and icon',
    (id, expectedLabelKey, expectedPath, expectedIcon) => {
      const item = NAVIGATION_ITEMS.find((entry) => entry.id === id);

      expect(item).toBeDefined();
      expect(item?.labelKey).toBe(expectedLabelKey);
      expect(item?.path).toBe(expectedPath);
      expect(item?.icon).toBe(expectedIcon);
    }
  );

  describe('isMatch matching rules', () => {
    it.each([
      ['/plants', true],
      ['/plants/', true],
      ['/plants/123', true],
      ['/plants/crear', true],
      ['/', false],
      ['/families', false],
      ['/settings', false],
      ['/login', false],
      ['/register', false],
      ['/admin', false],
      ['/admin/plants', false],
      ['/plants-other', false]
    ] as const)(
      'evaluates plants.isMatch(%s) to %s',
      (pathname, expectedResult) => {
        const plantsItem = NAVIGATION_ITEMS.find(
          (item) => item.id === 'plants'
        );

        const result = plantsItem?.isMatch(pathname);

        expect(result).toBe(expectedResult);
      }
    );

    it.each([
      ['/families', true],
      ['/families/', true],
      ['/families/456', true],
      ['/families/crear', true],
      ['/', false],
      ['/plants', false],
      ['/settings', false],
      ['/login', false],
      ['/register', false],
      ['/admin', false],
      ['/admin/families', false],
      ['/families-other', false]
    ] as const)(
      'evaluates families.isMatch(%s) to %s',
      (pathname, expectedResult) => {
        const familiesItem = NAVIGATION_ITEMS.find(
          (item) => item.id === 'families'
        );

        const result = familiesItem?.isMatch(pathname);

        expect(result).toBe(expectedResult);
      }
    );
  });
});
