import { normalizeScrollY } from '../scroll/normalizeScrollY';

export const PKCE_VERIFIER_KEY = 'agro_github_sso_verifier';
export const PKCE_STATE_KEY = 'agro_github_sso_state';
export const PKCE_RETURN_URL_KEY = 'agro_github_sso_return_url';
export const PKCE_SCROLL_Y_KEY = 'agro_github_sso_scroll_y';

const UNRESERVED_CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCodePoint(byte);
  }
  let base64 = btoa(binary).replaceAll('+', '-').replaceAll('/', '_');
  while (base64.endsWith('=')) {
    base64 = base64.slice(0, -1);
  }
  return base64;
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
  readonly scrollY?: number | null;
}

export interface GithubPkceSession {
  readonly verifier: string | null;
  readonly state: string | null;
  readonly returnUrl: string | null;
  readonly scrollY: number | null;
}

export function saveGithubPkceSession(params: GithubPkceSessionParams): void {
  sessionStorage.setItem(PKCE_VERIFIER_KEY, params.verifier);
  sessionStorage.setItem(PKCE_STATE_KEY, params.state);
  if (params.returnUrl) {
    sessionStorage.setItem(PKCE_RETURN_URL_KEY, params.returnUrl);
  } else {
    sessionStorage.removeItem(PKCE_RETURN_URL_KEY);
  }
  const normalizedScrollY = normalizeScrollY(params.scrollY);
  if (normalizedScrollY !== undefined) {
    sessionStorage.setItem(PKCE_SCROLL_Y_KEY, String(normalizedScrollY));
  } else {
    sessionStorage.removeItem(PKCE_SCROLL_Y_KEY);
  }
}

export function getGithubPkceSession(): GithubPkceSession {
  const rawScrollY = sessionStorage.getItem(PKCE_SCROLL_Y_KEY);
  const parsedScrollY =
    rawScrollY !== null && rawScrollY.trim() !== ''
      ? Number(rawScrollY)
      : undefined;
  return {
    verifier: sessionStorage.getItem(PKCE_VERIFIER_KEY),
    state: sessionStorage.getItem(PKCE_STATE_KEY),
    returnUrl: sessionStorage.getItem(PKCE_RETURN_URL_KEY),
    scrollY: normalizeScrollY(parsedScrollY) ?? null
  };
}

export function clearGithubPkceSession(): void {
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(PKCE_STATE_KEY);
  sessionStorage.removeItem(PKCE_RETURN_URL_KEY);
  sessionStorage.removeItem(PKCE_SCROLL_Y_KEY);
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
