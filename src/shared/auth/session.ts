import type { AuthSession } from '../../types/auth';
import { isTokenExpired, parseJwtPayload } from './jwt';
import { consumeSessionTransferToken } from './sessionTransfer';

export const AUTH_TOKEN_STORAGE_KEY = 'auth_token';
export const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;

type PurgeListener = () => void;
const purgeListeners = new Set<PurgeListener>();

export function clearStoredToken(): void {
  try {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return;
  }
}

export function getStoredToken(): string | null {
  try {
    const token = sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!token) return null;

    const payload = parseJwtPayload(token);
    if (!payload || isTokenExpired(payload.exp)) {
      clearStoredToken();
      return null;
    }

    return token;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch {
    return;
  }
}

export function buildSessionFromToken(token: string): AuthSession | null {
  const payload = parseJwtPayload(token);
  if (!payload || isTokenExpired(payload.exp)) {
    return null;
  }

  return {
    token,
    user: {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      roles: payload.roles
    },
    expiresAt: payload.exp
  };
}

export function getInitialSession(): AuthSession | null {
  const storedToken = getStoredToken();
  if (storedToken) {
    const session = buildSessionFromToken(storedToken);
    if (session) {
      consumeSessionTransferToken();
      return session;
    }
  }

  const transferredToken = consumeSessionTransferToken();
  if (transferredToken) {
    const session = buildSessionFromToken(transferredToken);
    if (session) {
      setStoredToken(transferredToken);
      return session;
    }
  }

  return null;
}

export function subscribeToSessionPurge(listener: PurgeListener): () => void {
  purgeListeners.add(listener);
  return () => {
    purgeListeners.delete(listener);
  };
}

export function notifySessionPurged(): void {
  for (const listener of purgeListeners) {
    listener();
  }
}
