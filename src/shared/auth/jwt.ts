import type { JwtPayload, UserRole } from '../../types/auth';

function decodeBase64Url(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(padLength);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function isUserRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'user' || value === 'collaborator';
}

function isValidJwtPayload(data: unknown): data is JwtPayload {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const record = data as Record<string, unknown>;

  const hasValidStrings =
    typeof record.id === 'string' &&
    typeof record.email === 'string' &&
    typeof record.username === 'string';

  const hasValidNumbers =
    typeof record.iat === 'number' && typeof record.exp === 'number';

  const hasValidRoles =
    Array.isArray(record.roles) && record.roles.every(isUserRole);

  return hasValidStrings && hasValidNumbers && hasValidRoles;
}

export function parseJwtPayload(token: string): JwtPayload | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const jsonString = decodeBase64Url(parts[1]);
    const parsed = JSON.parse(jsonString);
    if (!isValidJwtPayload(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isTokenExpired(
  exp: number,
  nowSeconds = Math.floor(Date.now() / 1000)
): boolean {
  return nowSeconds >= exp;
}
