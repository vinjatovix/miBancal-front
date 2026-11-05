import { describe, expect, it } from 'vitest';

import { assertContractRequest, validateRequest } from './openApiContract';

describe('OpenAPI auth contract', () => {
  it.each([
    '/api/v1/auth/register',
    '/api/v1/auth/activate',
    '/api/v1/auth/login',
    '/api/v1/auth/google',
    '/api/v1/auth/github',
    '/api/v1/auth/refresh',
    '/api/v1/auth/update'
  ])('validates contract route for POST %s', (path) => {
    expect(validateRequest('post', path)).toEqual([]);
  });

  it('accepts POST /api/v1/auth/refresh without request body', async () => {
    const assertion = assertContractRequest({
      path: '/api/v1/auth/refresh',
      method: 'POST'
    });

    await expect(assertion).resolves.toBeUndefined();
  });

  describe('RegisterUserRequest', () => {
    it('accepts a valid registration payload', async () => {
      const payload = {
        id: '00000000-0000-4000-8000-000000000001',
        email: 'hortelano@example.com',
        username: 'hortelano',
        password: 'Password1!',
        repeatPassword: 'Password1!'
      };

      const assertion = assertContractRequest({
        path: '/api/v1/auth/register',
        method: 'POST',
        body: payload
      });

      await expect(assertion).resolves.toBeUndefined();
    });

    it('rejects payload with missing required fields', async () => {
      const payload = {
        email: 'hortelano@example.com'
      };

      const assertion = assertContractRequest({
        path: '/api/v1/auth/register',
        method: 'POST',
        body: payload
      });

      await expect(assertion).rejects.toThrow();
    });

    it('rejects payload with invalid uuid format', async () => {
      const payload = {
        id: 'not-a-uuid',
        email: 'hortelano@example.com',
        username: 'hortelano',
        password: 'Password1!',
        repeatPassword: 'Password1!'
      };

      const assertion = assertContractRequest({
        path: '/api/v1/auth/register',
        method: 'POST',
        body: payload
      });

      await expect(assertion).rejects.toThrow();
    });
  });

  describe('ActivateAccountRequest', () => {
    it('accepts a valid activation payload', async () => {
      const payload = {
        token: 'valid-activation-token-string'
      };

      const assertion = assertContractRequest({
        path: '/api/v1/auth/activate',
        method: 'POST',
        body: payload
      });

      await expect(assertion).resolves.toBeUndefined();
    });

    it('rejects empty token in activation payload', async () => {
      const payload = {
        token: ''
      };

      const assertion = assertContractRequest({
        path: '/api/v1/auth/activate',
        method: 'POST',
        body: payload
      });

      await expect(assertion).rejects.toThrow();
    });
  });

  describe('LoginUserRequest', () => {
    it('accepts a valid login payload', async () => {
      const payload = {
        email: 'hortelano@example.com',
        password: 'SecretPassword123'
      };

      const assertion = assertContractRequest({
        path: '/api/v1/auth/login',
        method: 'POST',
        body: payload
      });

      await expect(assertion).resolves.toBeUndefined();
    });

    it('rejects invalid email format in login payload', async () => {
      const payload = {
        email: 'not-an-email',
        password: 'SecretPassword123'
      };

      const assertion = assertContractRequest({
        path: '/api/v1/auth/login',
        method: 'POST',
        body: payload
      });

      await expect(assertion).rejects.toThrow();
    });
  });

  describe('AuthenticateWithGoogleRequest', () => {
    it('accepts a valid google authentication payload', async () => {
      const payload = {
        idToken: 'google-id-token-credential'
      };

      const assertion = assertContractRequest({
        path: '/api/v1/auth/google',
        method: 'POST',
        body: payload
      });

      await expect(assertion).resolves.toBeUndefined();
    });

    it('rejects payload missing idToken', async () => {
      const payload = {};

      const assertion = assertContractRequest({
        path: '/api/v1/auth/google',
        method: 'POST',
        body: payload
      });

      await expect(assertion).rejects.toThrow();
    });
  });

  describe('AuthenticateWithGithubRequest', () => {
    it('accepts a valid github authentication payload', async () => {
      const payload = {
        code: 'github-auth-code-12345',
        codeVerifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
      };

      const assertion = assertContractRequest({
        path: '/api/v1/auth/github',
        method: 'POST',
        body: payload
      });

      await expect(assertion).resolves.toBeUndefined();
    });

    it.each([
      ['code', { codeVerifier: 'verifier-string' }],
      ['codeVerifier', { code: 'github-code' }]
    ])('rejects payload missing %s', async (_field, payload) => {
      const assertion = assertContractRequest({
        path: '/api/v1/auth/github',
        method: 'POST',
        body: payload
      });

      await expect(assertion).rejects.toThrow();
    });

    it('rejects additional properties in payload', async () => {
      const payload = {
        code: 'github-auth-code',
        codeVerifier: 'verifier-string',
        unexpectedField: 'not-allowed'
      };

      const assertion = assertContractRequest({
        path: '/api/v1/auth/github',
        method: 'POST',
        body: payload
      });

      await expect(assertion).rejects.toThrow();
    });
  });

  describe('UpdatePasswordRequest', () => {
    it('accepts a valid update password payload', async () => {
      const payload = {
        oldPassword: 'CurrentPassword123!',
        password: 'NewPassword123!',
        repeatPassword: 'NewPassword123!'
      };

      const assertion = assertContractRequest({
        path: '/api/v1/auth/update',
        method: 'POST',
        body: payload
      });

      await expect(assertion).resolves.toBeUndefined();
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
    ])('rejects payload missing %s', async (_field, payload) => {
      const assertion = assertContractRequest({
        path: '/api/v1/auth/update',
        method: 'POST',
        body: payload
      });

      await expect(assertion).rejects.toThrow();
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
    ])('rejects payload with %s', async (_desc, payload) => {
      const assertion = assertContractRequest({
        path: '/api/v1/auth/update',
        method: 'POST',
        body: payload
      });

      await expect(assertion).rejects.toThrow();
    });
  });
});
