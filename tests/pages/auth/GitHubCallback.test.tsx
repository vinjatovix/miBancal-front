import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { t } from '../../../src/i18n/core/t';
import GitHubCallback from '../../../src/pages/auth/GitHubCallback';
import * as authServiceModule from '../../../src/services/auth.service';
import {
  clearGithubPkceSession,
  getGithubPkceSession,
  saveGithubPkceSession
} from '../../../src/shared/auth/pkce';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { NetworkError } from '../../../src/shared/errors/NetworkError';
import { VALID_TEST_TOKEN } from '../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

function LoginSpy() {
  const location = useLocation();
  const state = location.state as {
    ssoError?: string;
    error?: string;
    from?: unknown;
  } | null;

  return (
    <div>
      <div data-testid="current-path">{location.pathname}</div>
      <div data-testid="sso-error">{state?.ssoError}</div>
      <div data-testid="legacy-error">{state?.error}</div>
      <div data-testid="from-state">{JSON.stringify(state?.from)}</div>
    </div>
  );
}

function TestApp() {
  return (
    <Routes>
      <Route
        path="/"
        element={<div data-testid="home-page">Página principal</div>}
      />
      <Route
        path="/plants"
        element={<div data-testid="plants-page">Plantas</div>}
      />
      <Route path="/login" element={<LoginSpy />} />
      <Route path="/auth/github/callback" element={<GitHubCallback />} />
    </Routes>
  );
}

describe('GitHubCallback - User Story 1 (HTTP 429 Rate Limit)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    clearGithubPkceSession();
    vi.restoreAllMocks();
  });

  it('redirects to /login with rate limit notice and preserved from when receiving HTTP 429', async () => {
    saveGithubPkceSession({
      verifier: 'valid-verifier-123',
      state: 'valid-state-abc',
      returnUrl: '/plants'
    });
    vi.spyOn(authServiceModule, 'authenticateWithGithub').mockRejectedValueOnce(
      new ApiError('Too Many Requests', 429)
    );

    renderWithProviders(<TestApp />, {
      route: '/auth/github/callback?code=valid-code&state=valid-state-abc'
    });

    expect(await screen.findByTestId('current-path')).toHaveTextContent(
      '/login'
    );
    expect(screen.getByTestId('sso-error')).toHaveTextContent(
      t('auth.rate_limit_notice')
    );
    expect(screen.getByTestId('legacy-error')).toHaveTextContent(
      t('auth.rate_limit_notice')
    );
    expect(screen.getByTestId('from-state')).toHaveTextContent('"/plants"');
    expect(getGithubPkceSession().verifier).toBeNull();
  });
});

describe('GitHubCallback - User Story 2 (Authorization Errors & Re-navigation)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    clearGithubPkceSession();
    vi.restoreAllMocks();
  });

  it('redirects to /login with access_denied message without calling auth service when cancelled', async () => {
    saveGithubPkceSession({
      verifier: 'valid-verifier',
      state: 'expected-state',
      returnUrl: '/plants'
    });
    const authSpy = vi.spyOn(authServiceModule, 'authenticateWithGithub');

    renderWithProviders(<TestApp />, {
      route:
        '/auth/github/callback?error=access_denied&error_description=The+user+has+denied+your+application'
    });

    expect(await screen.findByTestId('current-path')).toHaveTextContent(
      '/login'
    );
    expect(screen.getByTestId('sso-error')).toHaveTextContent(
      t('auth.sso_access_denied')
    );
    expect(screen.getByTestId('legacy-error')).toHaveTextContent(
      t('auth.sso_access_denied')
    );
    expect(authSpy).not.toHaveBeenCalled();
    expect(getGithubPkceSession().verifier).toBeNull();
  });

  it('redirects to /login with security error without calling auth service when state does not match', async () => {
    saveGithubPkceSession({
      verifier: 'valid-verifier',
      state: 'expected-state',
      returnUrl: '/plants'
    });
    const authSpy = vi.spyOn(authServiceModule, 'authenticateWithGithub');

    renderWithProviders(<TestApp />, {
      route: '/auth/github/callback?code=valid-code&state=mismatched-state'
    });

    expect(await screen.findByTestId('current-path')).toHaveTextContent(
      '/login'
    );
    expect(screen.getByTestId('sso-error')).toHaveTextContent(
      t('auth.sso_security_error')
    );
    expect(screen.getByTestId('legacy-error')).toHaveTextContent(
      t('auth.sso_security_error')
    );
    expect(authSpy).not.toHaveBeenCalled();
    expect(getGithubPkceSession().verifier).toBeNull();
  });

  it('redirects to /login with security error without calling auth service when verifier is missing', async () => {
    saveGithubPkceSession({
      verifier: '',
      state: 'matching-state',
      returnUrl: '/plants'
    });
    const authSpy = vi.spyOn(authServiceModule, 'authenticateWithGithub');

    renderWithProviders(<TestApp />, {
      route: '/auth/github/callback?code=valid-code&state=matching-state'
    });

    expect(await screen.findByTestId('current-path')).toHaveTextContent(
      '/login'
    );
    expect(screen.getByTestId('sso-error')).toHaveTextContent(
      t('auth.sso_security_error')
    );
    expect(screen.getByTestId('legacy-error')).toHaveTextContent(
      t('auth.sso_security_error')
    );
    expect(authSpy).not.toHaveBeenCalled();
    expect(getGithubPkceSession().verifier).toBeNull();
  });

  it.each([400, 401])(
    'redirects to /login with sso_github_invalid notice on HTTP %i ApiError',
    async (status) => {
      saveGithubPkceSession({
        verifier: 'valid-verifier',
        state: 'valid-state',
        returnUrl: '/plants'
      });
      vi.spyOn(
        authServiceModule,
        'authenticateWithGithub'
      ).mockRejectedValueOnce(new ApiError('Invalid grant', status));

      renderWithProviders(<TestApp />, {
        route: '/auth/github/callback?code=valid-code&state=valid-state'
      });

      expect(await screen.findByTestId('current-path')).toHaveTextContent(
        '/login'
      );
      expect(screen.getByTestId('sso-error')).toHaveTextContent(
        t('auth.sso_github_invalid')
      );
      expect(screen.getByTestId('legacy-error')).toHaveTextContent(
        t('auth.sso_github_invalid')
      );
      expect(getGithubPkceSession().verifier).toBeNull();
    }
  );

  it.each([
    [new ApiError('Internal Server Error', 500)],
    [new NetworkError(new Error('Network failure'))]
  ])(
    'redirects to /login with sso_unavailable on 5xx or NetworkError',
    async (error) => {
      saveGithubPkceSession({
        verifier: 'valid-verifier',
        state: 'valid-state',
        returnUrl: '/plants'
      });
      vi.spyOn(
        authServiceModule,
        'authenticateWithGithub'
      ).mockRejectedValueOnce(error);

      renderWithProviders(<TestApp />, {
        route: '/auth/github/callback?code=valid-code&state=valid-state'
      });

      expect(await screen.findByTestId('current-path')).toHaveTextContent(
        '/login'
      );
      expect(screen.getByTestId('sso-error')).toHaveTextContent(
        t('auth.sso_unavailable')
      );
      expect(screen.getByTestId('legacy-error')).toHaveTextContent(
        t('auth.sso_unavailable')
      );
      expect(getGithubPkceSession().verifier).toBeNull();
    }
  );

  it('redirects silently to /login without error state on orphan direct access', async () => {
    renderWithProviders(<TestApp />, {
      route: '/auth/github/callback'
    });

    expect(await screen.findByTestId('current-path')).toHaveTextContent(
      '/login'
    );
    expect(screen.getByTestId('sso-error')).toBeEmptyDOMElement();
    expect(screen.getByTestId('legacy-error')).toBeEmptyDOMElement();
    expect(getGithubPkceSession().verifier).toBeNull();
  });

  it('redirects immediately to returnUrl without calling auth service when already authenticated', async () => {
    setStoredToken(VALID_TEST_TOKEN);
    saveGithubPkceSession({
      verifier: 'stale-verifier',
      state: 'stale-state',
      returnUrl: '/plants'
    });
    const authSpy = vi.spyOn(authServiceModule, 'authenticateWithGithub');

    renderWithProviders(<TestApp />, {
      route: '/auth/github/callback?code=some-code&state=stale-state'
    });

    expect(await screen.findByTestId('plants-page')).toBeInTheDocument();
    expect(authSpy).not.toHaveBeenCalled();
    expect(getGithubPkceSession().verifier).toBeNull();
  });

  it('renders accessible processing text and botanical loader during callback resolution', () => {
    saveGithubPkceSession({
      verifier: 'verifier',
      state: 'state'
    });
    vi.spyOn(authServiceModule, 'authenticateWithGithub').mockReturnValueOnce(
      new Promise(() => {})
    );

    renderWithProviders(<TestApp />, {
      route: '/auth/github/callback?code=code&state=state'
    });

    expect(
      screen.getByRole('heading', { name: t('auth.sso_processing') })
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('preserves PKCE session in storage while exchange request is pending', () => {
    saveGithubPkceSession({
      verifier: 'in-flight-verifier',
      state: 'in-flight-state'
    });
    vi.spyOn(authServiceModule, 'authenticateWithGithub').mockReturnValueOnce(
      new Promise(() => {})
    );

    renderWithProviders(<TestApp />, {
      route: '/auth/github/callback?code=some-code&state=in-flight-state'
    });

    expect(getGithubPkceSession().verifier).toBe('in-flight-verifier');
  });

  it('redirects to home and purges PKCE session when exchange succeeds', async () => {
    saveGithubPkceSession({
      verifier: 'valid-verifier',
      state: 'valid-state'
    });
    vi.spyOn(authServiceModule, 'authenticateWithGithub').mockResolvedValueOnce(
      {
        token: VALID_TEST_TOKEN
      }
    );

    renderWithProviders(<TestApp />, {
      route: '/auth/github/callback?code=valid-code&state=valid-state'
    });

    expect(await screen.findByTestId('home-page')).toBeInTheDocument();
    expect(getGithubPkceSession().verifier).toBeNull();
  });

  it('redirects to custom returnUrl when exchange succeeds', async () => {
    saveGithubPkceSession({
      verifier: 'valid-verifier',
      state: 'valid-state',
      returnUrl: '/plants'
    });
    vi.spyOn(authServiceModule, 'authenticateWithGithub').mockResolvedValueOnce(
      {
        token: VALID_TEST_TOKEN
      }
    );

    renderWithProviders(<TestApp />, {
      route: '/auth/github/callback?code=valid-code&state=valid-state'
    });

    expect(await screen.findByTestId('plants-page')).toBeInTheDocument();
    expect(getGithubPkceSession().verifier).toBeNull();
  });

  it('invokes authenticateWithGithub only once across component re-renders', async () => {
    saveGithubPkceSession({
      verifier: 'valid-verifier',
      state: 'valid-state'
    });
    const authSpy = vi
      .spyOn(authServiceModule, 'authenticateWithGithub')
      .mockReturnValueOnce(new Promise(() => {}));

    function ReRenderHarness() {
      const [, setTick] = React.useState(0);
      return (
        <div>
          <button
            data-testid="force-rerender"
            onClick={() => setTick((v) => v + 1)}
          >
            Update
          </button>
          <TestApp />
        </div>
      );
    }

    renderWithProviders(<ReRenderHarness />, {
      route: '/auth/github/callback?code=valid-code&state=valid-state'
    });

    const button = screen.getByTestId('force-rerender');
    fireEvent.click(button);

    expect(authSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('current-path')).toBeNull();
  });
});
