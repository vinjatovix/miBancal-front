import type {
  AuthSession,
  AuthUser,
  JwtPayload,
  LoginNavigationState,
  SsoCallbackQueryParams
} from '../../../src/types/auth';

function toBase64Url(payload: unknown): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function createTestJwt(
  payloadOverrides: Partial<JwtPayload> = {}
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: JwtPayload = {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'hortelano@example.com',
    username: 'hortelano',
    roles: ['user'],
    iat: now,
    exp: now + 7200,
    ...payloadOverrides
  };
  return `${toBase64Url(header)}.${toBase64Url(payload)}.signature`;
}

export function buildAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'hortelano@example.com',
    username: 'hortelano',
    roles: ['user'],
    ...overrides
  };
}

export function buildJwtPayload(
  overrides: Partial<JwtPayload> = {}
): JwtPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'hortelano@example.com',
    username: 'hortelano',
    roles: ['user'],
    iat: now,
    exp: now + 7200,
    ...overrides
  };
}

export function buildAuthSession(
  overrides: Partial<AuthSession> = {}
): AuthSession {
  const user = buildAuthUser(overrides.user);
  const now = Math.floor(Date.now() / 1000);
  return {
    token: createTestJwt(),
    user,
    expiresAt: now + 7200,
    ...overrides
  };
}

export const VALID_TEST_TOKEN = createTestJwt();
export const EXPIRED_TEST_TOKEN = createTestJwt({
  exp: 1000000000
});
export const ADMIN_TEST_TOKEN = createTestJwt({
  roles: ['admin', 'user'],
  username: 'admin'
});

export function buildLoginNavigationState(
  overrides: Partial<LoginNavigationState> = {}
): LoginNavigationState {
  return {
    ...overrides
  };
}

export function buildSsoCallbackQueryParams(
  overrides: Partial<SsoCallbackQueryParams> = {}
): SsoCallbackQueryParams {
  return {
    ...overrides
  };
}

export const RATE_LIMIT_LOGIN_STATE: LoginNavigationState = {
  ssoError: 'Demasiados intentos. Por favor, inténtalo más tarde.',
  error: 'Demasiados intentos. Por favor, inténtalo más tarde.'
};

export const ACCESS_DENIED_LOGIN_STATE: LoginNavigationState = {
  ssoError: 'Has cancelado la autorización con el proveedor externo.',
  error: 'Has cancelado la autorización con el proveedor externo.'
};

export const SECURITY_ERROR_LOGIN_STATE: LoginNavigationState = {
  ssoError:
    'Error de validación de seguridad durante la autenticación. Por favor, inténtalo de nuevo.',
  error:
    'Error de validación de seguridad durante la autenticación. Por favor, inténtalo de nuevo.'
};

export const INVALID_GRANT_LOGIN_STATE: LoginNavigationState = {
  ssoError:
    'La autorización de GitHub no es válida, ha caducado o no tiene un correo verificado.',
  error:
    'La autorización de GitHub no es válida, ha caducado o no tiene un correo verificado.'
};

export const UNAVAILABLE_LOGIN_STATE: LoginNavigationState = {
  ssoError:
    'El servicio de autenticación externa no está disponible en este momento. Inténtalo más tarde o accede con correo y contraseña.',
  error:
    'El servicio de autenticación externa no está disponible en este momento. Inténtalo más tarde o accede con correo y contraseña.'
};

export const SAFE_LOCATION_STATE: LoginNavigationState = {
  from: '/admin'
};

export const SAFE_LOCATION_OBJECT_STATE: LoginNavigationState = {
  from: {
    pathname: '/plants',
    search: '?cycle=annual',
    hash: '#gallery'
  }
};

export const UNSAFE_PROTOCOL_RELATIVE_STATE: LoginNavigationState = {
  from: '//malicious.example.com'
};

export const UNSAFE_LOGIN_LOOP_STATE: LoginNavigationState = {
  from: '/login'
};

export const UNSAFE_REGISTER_LOOP_STATE: LoginNavigationState = {
  from: '/register'
};

export const SSO_CALLBACK_SUCCESS_PARAMS: SsoCallbackQueryParams = {
  code: 'test-auth-code',
  state: 'test-csrf-state'
};

export const SSO_CALLBACK_DENIED_PARAMS: SsoCallbackQueryParams = {
  error: 'access_denied',
  error_description: 'The user has denied your application'
};

export const SSO_CALLBACK_ORPHAN_PARAMS: SsoCallbackQueryParams = {};
