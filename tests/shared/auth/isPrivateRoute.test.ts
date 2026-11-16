import { describe, expect, it } from 'vitest';

import { isPrivateRoute } from '../../../src/shared/auth/isPrivateRoute';

describe('isPrivateRoute', () => {
  it.each([
    '/admin',
    '/admin/',
    '/admin/users',
    '/settings',
    '/settings/',
    '/settings/profile',
    '/plants/new',
    '/plants/new/',
    '/families/new',
    '/families/new/',
    '/anomalies/new',
    '/anomalies/new/',
    '/garden-inputs/new',
    '/garden-inputs/new/'
  ])('returns true for private route %s', (path) => {
    const result = isPrivateRoute(path);

    expect(result).toBe(true);
  });

  it.each([
    '/',
    '/plants',
    '/plants/',
    '/plants/tomate',
    '/families',
    '/families/',
    '/families/123',
    '/anomalies',
    '/anomalies/mildiu',
    '/garden-inputs',
    '/garden-inputs/humus',
    '/plant-relations',
    '/login',
    '/register',
    '/offline'
  ])('returns false for public route %s', (path) => {
    const result = isPrivateRoute(path);

    expect(result).toBe(false);
  });
});
