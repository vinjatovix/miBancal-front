import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { t } from '../../i18n/core/t';
import { useReportedNavigate } from '../../shared/observability/useReportedNavigate';
import { useAuth } from '../../shared/auth/useAuth';
import {
  clearGithubPkceSession,
  getGithubPkceSession,
  type GithubPkceSession
} from '../../shared/auth/pkce';
import { Loader } from '../../shared/components/Loader/Loader';
import './authPages.css';
import { resolveRedirectDestination } from './utils/destination';
import { classifySsoError } from './utils/ssoError';

function isOrphanAccess(
  code: string | null,
  error: string | null,
  sessionState: string | null
): boolean {
  return !code && !error && !sessionState;
}

function resolvePreExchangeError(
  code: string | null,
  state: string | null,
  error: string | null,
  session: GithubPkceSession
): string | null {
  if (error) {
    return error;
  }
  if (
    !code ||
    !state ||
    !session.state ||
    state !== session.state ||
    !session.verifier
  ) {
    return 'security_error';
  }
  return null;
}

export default function GitHubCallback() {
  const { isAuthenticated, githubLogin } = useAuth();
  const navigateSafely = useReportedNavigate('github-callback');
  const location = useLocation();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (hasTriggeredRef.current) {
      return;
    }
    hasTriggeredRef.current = true;

    const session = getGithubPkceSession();
    const from = session.returnUrl;
    const safeDestination = resolveRedirectDestination(from);
    const restoreScrollState =
      session.scrollY !== null
        ? { restoreScrollY: session.scrollY }
        : undefined;

    if (isAuthenticated) {
      clearGithubPkceSession();
      void navigateSafely(safeDestination, {
        replace: true,
        state: restoreScrollState
      });
      return;
    }

    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (isOrphanAccess(code, error, session.state)) {
      clearGithubPkceSession();
      void navigateSafely('/login', { replace: true });
      return;
    }

    const preExchangeError = resolvePreExchangeError(
      code,
      state,
      error,
      session
    );
    if (preExchangeError) {
      clearGithubPkceSession();
      const ssoError = classifySsoError(preExchangeError);
      void navigateSafely('/login', {
        replace: true,
        state: {
          ssoError,
          error: ssoError,
          from,
          scrollY: session.scrollY ?? undefined
        }
      });
      return;
    }

    const processExchange = async () => {
      if (!code || !session.verifier) {
        clearGithubPkceSession();
        const ssoError = classifySsoError('security_error');
        void navigateSafely('/login', {
          replace: true,
          state: {
            ssoError,
            error: ssoError,
            from,
            scrollY: session.scrollY ?? undefined
          }
        });
        return;
      }

      try {
        await githubLogin({
          code,
          codeVerifier: session.verifier
        });
        clearGithubPkceSession();
        void navigateSafely(safeDestination, {
          replace: true,
          state: restoreScrollState
        });
      } catch (err) {
        clearGithubPkceSession();
        const ssoError = classifySsoError(err);
        void navigateSafely('/login', {
          replace: true,
          state: {
            ssoError,
            error: ssoError,
            from,
            scrollY: session.scrollY ?? undefined
          }
        });
      }
    };

    void processExchange();
  }, [location.search, navigateSafely, isAuthenticated, githubLogin]);

  return (
    <div className="auth-container">
      <h1 className="auth-title">{t('auth.sso_processing')}</h1>
      <Loader />
    </div>
  );
}
