import { useLocation } from 'react-router-dom';

import { GITHUB_CLIENT_ID } from '../../../config/env';
import { t } from '../../../i18n/core/t';
import {
  buildGithubAuthorizeUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
  saveGithubPkceSession
} from '../../../shared/auth/pkce';
import { resolveRedirectDestination } from '../utils/destination';
import './githubAuthButton.css';

interface GitHubAuthButtonProps {
  readonly disabled?: boolean;
}

export default function GitHubAuthButton({
  disabled = false
}: GitHubAuthButtonProps) {
  const location = useLocation();

  if (!GITHUB_CLIENT_ID) {
    return null;
  }

  const clientId = GITHUB_CLIENT_ID;

  const handleClick = async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateState();

    const rawTarget =
      location.pathname === '/login'
        ? (location.state as { from?: unknown })?.from
        : location.pathname;
    const returnUrl = resolveRedirectDestination(rawTarget);

    saveGithubPkceSession({
      verifier,
      state,
      returnUrl
    });

    window.location.href = buildGithubAuthorizeUrl({
      clientId,
      state,
      codeChallenge: challenge,
      redirectUri: `${window.location.origin}/auth/github/callback`
    });
  };

  return (
    <button
      type="button"
      className="github-auth-button"
      onClick={handleClick}
      disabled={disabled}
    >
      <svg
        className="github-auth-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="currentColor"
      >
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.268 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.027 1.595 1.027 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
      </svg>
      <span>{t('auth.github_login')}</span>
    </button>
  );
}
