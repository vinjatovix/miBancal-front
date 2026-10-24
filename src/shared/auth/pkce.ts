export const PKCE_VERIFIER_KEY = 'agro_github_sso_verifier';
export const PKCE_STATE_KEY = 'agro_github_sso_state';
export const PKCE_RETURN_URL_KEY = 'agro_github_sso_return_url';

const UNRESERVED_CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function generateCodeVerifier(length = 64): string {
  const clampedLength = Math.max(43, Math.min(128, length));
  const randomBytes = new Uint8Array(clampedLength);
  crypto.getRandomValues(randomBytes);

  let verifier = '';
  for (let i = 0; i < clampedLength; i++) {
    verifier +=
      UNRESERVED_CHARACTERS[randomBytes[i] % UNRESERVED_CHARACTERS.length];
  }
  return verifier;
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToBase64Url(hashBuffer);
}

export function generateState(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return bufferToBase64Url(randomBytes.buffer);
}

export interface GithubPkceSessionParams {
  readonly verifier: string;
  readonly state: string;
  readonly returnUrl?: string | null;
}

export interface GithubPkceSession {
  readonly verifier: string | null;
  readonly state: string | null;
  readonly returnUrl: string | null;
}

export function saveGithubPkceSession(params: GithubPkceSessionParams): void {
  sessionStorage.setItem(PKCE_VERIFIER_KEY, params.verifier);
  sessionStorage.setItem(PKCE_STATE_KEY, params.state);
  if (params.returnUrl) {
    sessionStorage.setItem(PKCE_RETURN_URL_KEY, params.returnUrl);
  } else {
    sessionStorage.removeItem(PKCE_RETURN_URL_KEY);
  }
}

export function getGithubPkceSession(): GithubPkceSession {
  return {
    verifier: sessionStorage.getItem(PKCE_VERIFIER_KEY),
    state: sessionStorage.getItem(PKCE_STATE_KEY),
    returnUrl: sessionStorage.getItem(PKCE_RETURN_URL_KEY)
  };
}

export function clearGithubPkceSession(): void {
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(PKCE_STATE_KEY);
  sessionStorage.removeItem(PKCE_RETURN_URL_KEY);
}

export interface BuildGithubAuthorizeUrlParams {
  readonly clientId: string;
  readonly state: string;
  readonly codeChallenge: string;
  readonly redirectUri: string;
}

export function buildGithubAuthorizeUrl({
  clientId,
  state,
  codeChallenge,
  redirectUri
}: BuildGithubAuthorizeUrlParams): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}
