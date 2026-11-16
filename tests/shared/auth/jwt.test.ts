import { describe, expect, it } from 'vitest';

import { isTokenExpired, parseJwtPayload } from '../../../src/shared/auth/jwt';
import { createTestJwt } from '../../fixtures/auth/authFixtures';

describe('parseJwtPayload', () => {
  it('extracts payload from a valid JWT', () => {
    const token = createTestJwt({
      iat: 1700000000,
      exp: 2500000000
    });

    const payload = parseJwtPayload(token);

    expect(payload).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      email: 'hortelano@example.com',
      username: 'hortelano',
      roles: ['user'],
      iat: 1700000000,
      exp: 2500000000
    });
  });

  it('handles UTF-8 characters correctly', () => {
    const token = createTestJwt({ username: 'Hortelano Ñandú' });

    const payload = parseJwtPayload(token);

    expect(payload?.username).toBe('Hortelano Ñandú');
  });

  it('parses token with collaborator role correctly', () => {
    const token = createTestJwt({ roles: ['collaborator'] });

    const payload = parseJwtPayload(token);

    expect(payload?.roles).toEqual(['collaborator']);
  });

  it.each([
    ['not-a-jwt'],
    ['header.payload'],
    ['header.payload.signature.extra'],
    [''],
    ['a.invalid_base64!?.c'],
    ['a.bm90LWpzb24.c']
  ])('returns null for malformed token format %s', (invalidToken) => {
    const result = parseJwtPayload(invalidToken);

    expect(result).toBeNull();
  });

  it.each([
    ['missing id', { id: undefined }],
    ['missing email', { email: undefined }],
    ['missing username', { username: undefined }],
    ['missing roles', { roles: undefined }],
    ['invalid roles type', { roles: 'admin' }],
    ['missing iat', { iat: undefined }],
    ['missing exp', { exp: undefined }],
    ['non-numeric exp', { exp: '1700007200' }]
  ])(
    'returns null when payload structure is invalid (%s)',
    (_, payloadOverride) => {
      const token = createTestJwt(payloadOverride as never);

      const result = parseJwtPayload(token);

      expect(result).toBeNull();
    }
  );
});

describe('isTokenExpired', () => {
  it('returns true when current timestamp is greater than exp', () => {
    const result = isTokenExpired(1700000000, 1700000001);

    expect(result).toBe(true);
  });

  it('returns true when current timestamp equals exp', () => {
    const result = isTokenExpired(1700000000, 1700000000);

    expect(result).toBe(true);
  });

  it('returns false when current timestamp is less than exp', () => {
    const result = isTokenExpired(1700000000, 1699999999);

    expect(result).toBe(false);
  });

  it('identifies expired token correctly with default time', () => {
    const result = isTokenExpired(1000000000);

    expect(result).toBe(true);
  });
});
