import { act, render, renderHook, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as authServiceModule from '../../../src/services/auth.service';
import { AuthProvider } from '../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  getStoredToken,
  notifySessionPurged,
  setStoredToken
} from '../../../src/shared/auth/session';
import { useAuth } from '../../../src/shared/auth/useAuth';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { NetworkError } from '../../../src/shared/errors/NetworkError';
import {
  ADMIN_TEST_TOKEN,
  createTestJwt,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';
import { createTestQueryClient } from '../../test-utils/createTestQueryClient';

describe('useAuth & AuthProvider', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it('throws an error when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });

  it('initializes with unauthenticated state when no token is stored', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it('restores authenticated state from valid stored token', () => {
    setStoredToken(VALID_TEST_TOKEN);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('hortelano');
    expect(result.current.isAdmin).toBe(false);
  });

  it('identifies admin role correctly from token', () => {
    setStoredToken(ADMIN_TEST_TOKEN);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.isAdmin).toBe(true);
  });

  it('authenticates user and stores token on login', async () => {
    const loginSpy = vi
      .spyOn(authServiceModule, 'login')
      .mockResolvedValueOnce({ token: VALID_TEST_TOKEN });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.login({
        email: 'hortelano@example.com',
        password: 'Password1!'
      });
    });

    expect(loginSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('hortelano');
  });

  it('authenticates user on googleLogin', async () => {
    const googleSpy = vi
      .spyOn(authServiceModule, 'authenticateWithGoogle')
      .mockResolvedValueOnce({ token: VALID_TEST_TOKEN });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.googleLogin({ idToken: 'test-google-id-token' });
    });

    expect(googleSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('authenticates user on githubLogin, storing token and decoding user', async () => {
    const githubSpy = vi
      .spyOn(authServiceModule, 'authenticateWithGithub')
      .mockResolvedValueOnce({ token: VALID_TEST_TOKEN });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.githubLogin({
        code: 'test-github-code',
        codeVerifier: 'test-pkce-verifier-string-43-chars-long-minimum'
      });
    });

    expect(githubSpy).toHaveBeenCalledWith({
      code: 'test-github-code',
      codeVerifier: 'test-pkce-verifier-string-43-chars-long-minimum'
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('hortelano');
    expect(getStoredToken()).toBe(VALID_TEST_TOKEN);
    expect(result.current.isLoading).toBe(false);
  });

  it('resets isLoading to false when githubLogin fails', async () => {
    vi.spyOn(authServiceModule, 'authenticateWithGithub').mockRejectedValueOnce(
      new ApiError('Invalid GitHub authorization', 401)
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await expect(
        result.current.githubLogin({
          code: 'invalid-code',
          codeVerifier: 'verifier'
        })
      ).rejects.toThrow();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('clears session and storage on logout', () => {
    setStoredToken(VALID_TEST_TOKEN);
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('clears session when session purge is notified', () => {
    setStoredToken(VALID_TEST_TOKEN);
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    act(() => {
      notifySessionPurged();
    });

    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('renders children passed to AuthProvider', () => {
    render(
      <AuthProvider>
        <div data-testid="child-content">App content</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('child-content')).toHaveTextContent(
      'App content'
    );
  });

  it('refreshes token proactively before expiration', async () => {
    vi.useFakeTimers();
    const nowSeconds = Math.floor(Date.now() / 1000);
    const initialToken = createTestJwt({
      exp: nowSeconds + 400
    });
    const refreshedToken = createTestJwt({
      exp: nowSeconds + 7200
    });
    setStoredToken(initialToken);

    const refreshSpy = vi
      .spyOn(authServiceModule, 'refreshToken')
      .mockResolvedValueOnce({ token: refreshedToken });

    renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      vi.advanceTimersByTime(105000);
    });

    expect(refreshSpy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('keeps session active when proactive refresh fails with a network error', async () => {
    vi.useFakeTimers();
    const nowSeconds = Math.floor(Date.now() / 1000);
    const initialToken = createTestJwt({
      exp: nowSeconds + 400
    });
    setStoredToken(initialToken);

    vi.spyOn(authServiceModule, 'refreshToken').mockRejectedValueOnce(
      new NetworkError('Network unreachable')
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      vi.advanceTimersByTime(105000);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.session).not.toBeNull();
    vi.useRealTimers();
  });

  it('logs out when proactive refresh fails with an unauthorized error', async () => {
    vi.useFakeTimers();
    const nowSeconds = Math.floor(Date.now() / 1000);
    const initialToken = createTestJwt({
      exp: nowSeconds + 400
    });
    setStoredToken(initialToken);

    vi.spyOn(authServiceModule, 'refreshToken').mockRejectedValueOnce(
      new ApiError('Unauthorized', 401)
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      vi.advanceTimersByTime(105000);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.session).toBeNull();
    vi.useRealTimers();
  });

  it('throws an error and leaves storage empty when login returns an invalid token', async () => {
    vi.spyOn(authServiceModule, 'login').mockResolvedValueOnce({
      token: 'corrupted.jwt.payload'
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await expect(
        result.current.login({
          email: 'hortelano@example.com',
          password: 'Password1!'
        })
      ).rejects.toThrow('Token de sesión no válido');
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  it('delegates registration call to auth service', async () => {
    const registerSpy = vi
      .spyOn(authServiceModule, 'register')
      .mockResolvedValueOnce(undefined);
    const dto = {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'hortelano@example.com',
      username: 'hortelano',
      password: 'Password1!',
      repeatPassword: 'Password1!'
    };

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.register(dto);
    });

    expect(registerSpy).toHaveBeenCalledWith(dto);
  });

  it('delegates account activation call to auth service', async () => {
    const activateSpy = vi
      .spyOn(authServiceModule, 'activate')
      .mockResolvedValueOnce(undefined);
    const dto = { token: 'activation-token-string' };

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.activate(dto);
    });

    expect(activateSpy).toHaveBeenCalledWith(dto);
  });

  it('delegates forgotPassword to auth service without touching the session', async () => {
    const forgotSpy = vi
      .spyOn(authServiceModule, 'forgotPassword')
      .mockResolvedValueOnce(undefined);
    const dto = { email: 'hortelano@example.com' };

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.forgotPassword(dto);
    });

    expect(forgotSpy).toHaveBeenCalledWith(dto);
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  it('delegates resetPassword to auth service without creating a session', async () => {
    const resetSpy = vi
      .spyOn(authServiceModule, 'resetPassword')
      .mockResolvedValueOnce(undefined);
    const dto = {
      token: 'reset-token-string',
      password: 'Password123!',
      repeatPassword: 'Password123!'
    };

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.resetPassword(dto);
    });

    expect(resetSpy).toHaveBeenCalledWith(dto);
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  it('delegates updatePassword to auth service and manages loading state', async () => {
    const updateSpy = vi
      .spyOn(authServiceModule, 'updatePassword')
      .mockResolvedValueOnce({ message: 'Password updated' });
    const dto = {
      oldPassword: 'CurrentPassword123!',
      password: 'NewPassword123!',
      repeatPassword: 'NewPassword123!'
    };

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.updatePassword(dto);
    });

    expect(updateSpy).toHaveBeenCalledWith(dto);
    expect(result.current.isLoading).toBe(false);
  });

  it('propagates error from updatePassword while resetting loading state', async () => {
    vi.spyOn(authServiceModule, 'updatePassword').mockRejectedValueOnce(
      new Error('Update failed')
    );
    const dto = {
      oldPassword: 'CurrentPassword123!',
      password: 'NewPassword123!',
      repeatPassword: 'NewPassword123!'
    };

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await expect(result.current.updatePassword(dto)).rejects.toThrow(
        'Update failed'
      );
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe('AuthProvider: queryClient cache clearing', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it('clears query cache on logout', () => {
    const queryClient = createTestQueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');
    setStoredToken(VALID_TEST_TOKEN);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      )
    });

    act(() => {
      result.current.logout();
    });

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it('clears query cache on login', async () => {
    const queryClient = createTestQueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');
    vi.spyOn(authServiceModule, 'login').mockResolvedValueOnce({
      token: VALID_TEST_TOKEN
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      )
    });

    await act(async () => {
      await result.current.login({
        email: 'hortelano@example.com',
        password: 'Password1!'
      });
    });

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it('clears query cache on googleLogin', async () => {
    const queryClient = createTestQueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');
    vi.spyOn(authServiceModule, 'authenticateWithGoogle').mockResolvedValueOnce(
      {
        token: VALID_TEST_TOKEN
      }
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      )
    });

    await act(async () => {
      await result.current.googleLogin({ idToken: 'test-google-id-token' });
    });

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it('clears query cache on githubLogin', async () => {
    const queryClient = createTestQueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');
    vi.spyOn(authServiceModule, 'authenticateWithGithub').mockResolvedValueOnce(
      {
        token: VALID_TEST_TOKEN
      }
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      )
    });

    await act(async () => {
      await result.current.githubLogin({
        code: 'test-github-code',
        codeVerifier: 'test-pkce-verifier-string-43-chars-long-minimum'
      });
    });

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it('clears query cache on session purge', () => {
    const queryClient = createTestQueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');
    setStoredToken(VALID_TEST_TOKEN);

    renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      )
    });

    act(() => {
      notifySessionPurged();
    });

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it('clears query cache on logout when queryClient is provided directly via props', () => {
    const queryClient = createTestQueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');
    setStoredToken(VALID_TEST_TOKEN);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthProvider queryClient={queryClient}>{children}</AuthProvider>
      )
    });

    act(() => {
      result.current.logout();
    });

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });
});
