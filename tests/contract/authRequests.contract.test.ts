import { describe, expect, it } from 'vitest';

import { validateRequest, validateSchema } from './openApiContract';

describe('OpenAPI auth contract', () => {
  it.each([
    '/api/v1/auth/register',
    '/api/v1/auth/activate',
    '/api/v1/auth/login',
    '/api/v1/auth/google',
    '/api/v1/auth/github',
    '/api/v1/auth/refresh',
    '/api/v1/auth/update'
  ])('validates openapi path for %s', (path) => {
    const violations = validateRequest('post', path);

    expect(violations).toEqual([]);
  });

  describe('RegisterUserRequest', () => {
    it('accepts a valid registration payload', () => {
      const payload = {
        id: '00000000-0000-4000-8000-000000000001',
        email: 'hortelano@example.com',
        username: 'hortelano',
        password: 'Password1!',
        repeatPassword: 'Password1!'
      };

      const violations = validateSchema('RegisterUserRequest', payload);

      expect(violations).toEqual([]);
    });

    it('rejects payload with missing required fields', () => {
      const payload = {
        email: 'hortelano@example.com'
      };

      const violations = validateSchema('RegisterUserRequest', payload);

      expect(violations.length).toBeGreaterThan(0);
    });

    it('rejects payload with invalid uuid format', () => {
      const payload = {
        id: 'not-a-uuid',
        email: 'hortelano@example.com',
        username: 'hortelano',
        password: 'Password1!',
        repeatPassword: 'Password1!'
      };

      const violations = validateSchema('RegisterUserRequest', payload);

      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('ActivateAccountRequest', () => {
    it('accepts a valid activation payload', () => {
      const payload = {
        token: 'valid-activation-token-string'
      };

      const violations = validateSchema('ActivateAccountRequest', payload);

      expect(violations).toEqual([]);
    });

    it('rejects empty token in activation payload', () => {
      const payload = {
        token: ''
      };

      const violations = validateSchema('ActivateAccountRequest', payload);

      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('LoginUserRequest', () => {
    it('accepts a valid login payload', () => {
      const payload = {
        email: 'hortelano@example.com',
        password: 'SecretPassword123'
      };

      const violations = validateSchema('LoginUserRequest', payload);

      expect(violations).toEqual([]);
    });

    it('rejects invalid email format in login payload', () => {
      const payload = {
        email: 'not-an-email',
        password: 'SecretPassword123'
      };

      const violations = validateSchema('LoginUserRequest', payload);

      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('AuthenticateWithGoogleRequest', () => {
    it('accepts a valid google authentication payload', () => {
      const payload = {
        idToken: 'google-id-token-credential'
      };

      const violations = validateSchema(
        'AuthenticateWithGoogleRequest',
        payload
      );

      expect(violations).toEqual([]);
    });

    it('rejects payload missing idToken', () => {
      const payload = {};

      const violations = validateSchema(
        'AuthenticateWithGoogleRequest',
        payload
      );

      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('AuthenticateWithGithubRequest', () => {
    it('accepts a valid github authentication payload', () => {
      const payload = {
        code: 'github-auth-code-12345',
        codeVerifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
      };

      const violations = validateSchema(
        'AuthenticateWithGithubRequest',
        payload
      );

      expect(violations).toEqual([]);
    });

    it.each([
      ['code', { codeVerifier: 'verifier-string' }],
      ['codeVerifier', { code: 'github-code' }]
    ])('rejects payload missing %s', (_field, payload) => {
      const violations = validateSchema(
        'AuthenticateWithGithubRequest',
        payload
      );

      expect(violations.length).toBeGreaterThan(0);
    });

    it('rejects additional properties in payload', () => {
      const payload = {
        code: 'github-auth-code',
        codeVerifier: 'verifier-string',
        unexpectedField: 'not-allowed'
      };

      const violations = validateSchema(
        'AuthenticateWithGithubRequest',
        payload
      );

      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('UpdatePasswordRequest', () => {
    it('accepts a valid update password payload', () => {
      const payload = {
        oldPassword: 'CurrentPassword123!',
        password: 'NewPassword123!',
        repeatPassword: 'NewPassword123!'
      };

      const violations = validateSchema('UpdatePasswordRequest', payload);

      expect(violations).toEqual([]);
    });

    it.each([
      [
        'oldPassword',
        { password: 'NewPassword123!', repeatPassword: 'NewPassword123!' }
      ],
      [
        'password',
        {
          oldPassword: 'CurrentPassword123!',
          repeatPassword: 'NewPassword123!'
        }
      ],
      [
        'repeatPassword',
        { oldPassword: 'CurrentPassword123!', password: 'NewPassword123!' }
      ]
    ])('rejects payload missing %s', (_field, payload) => {
      const violations = validateSchema('UpdatePasswordRequest', payload);

      expect(violations.length).toBeGreaterThan(0);
    });

    it.each([
      [
        'password too short',
        {
          oldPassword: 'CurrentPassword123!',
          password: 'Short1!',
          repeatPassword: 'Short1!'
        }
      ],
      [
        'password too long',
        {
          oldPassword: 'CurrentPassword123!',
          password: `${'A'.repeat(65)}1!`,
          repeatPassword: `${'A'.repeat(65)}1!`
        }
      ],
      [
        'additional property',
        {
          oldPassword: 'CurrentPassword123!',
          password: 'NewPassword123!',
          repeatPassword: 'NewPassword123!',
          extra: 'unexpected'
        }
      ]
    ])('rejects payload with %s', (_desc, payload) => {
      const violations = validateSchema('UpdatePasswordRequest', payload);

      expect(violations.length).toBeGreaterThan(0);
    });
  });
});
