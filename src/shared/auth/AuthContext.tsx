import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { QueryClientContext, type QueryClient } from '@tanstack/react-query';

import {
  activate as serviceActivate,
  authenticateWithGoogle as serviceGoogleLogin,
  authenticateWithGithub as serviceGithubLogin,
  forgotPassword as serviceForgotPassword,
  login as serviceLogin,
  refreshToken as serviceRefreshToken,
  register as serviceRegister,
  resetPassword as serviceResetPassword,
  updatePassword as serviceUpdatePassword
} from '../../services/auth.service';
import type {
  ActivateAccountData,
  AuthenticateWithGoogleData,
  AuthenticateWithGithubData,
  AuthSession,
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  UpdatePasswordData
} from '../../types/auth';
import { ApiError } from '../errors/ApiError';
import { AuthContext, type AuthContextValue } from './authContextDef';
import { hasCatalogEditorRole } from './roleUtils';
import {
  buildSessionFromToken,
  clearStoredToken,
  getInitialSession,
  setStoredToken,
  subscribeToSessionPurge,
  TOKEN_REFRESH_MARGIN_MS
} from './session';

const MAX_TIMEOUT_DELAY_MS = 2_147_483_647;

interface AuthProviderProps {
  readonly children: ReactNode;
  readonly queryClient?: QueryClient;
}

export function AuthProvider({
  children,
  queryClient: explicitClient
}: AuthProviderProps) {
  const contextClient = useContext(QueryClientContext);
  const queryClient = explicitClient ?? contextClient;
  const [session, setSession] = useState<AuthSession | null>(getInitialSession);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const logout = useCallback(() => {
    clearStoredToken();
    queryClient?.clear();
    setSession(null);
  }, [queryClient]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const response = await serviceLogin(credentials);
        const nextSession = buildSessionFromToken(response.token);
        if (!nextSession) {
          clearStoredToken();
          throw new Error('Token de sesión no válido');
        }
        setStoredToken(response.token);
        queryClient?.clear();
        setSession(nextSession);
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  const googleLogin = useCallback(
    async (data: AuthenticateWithGoogleData) => {
      setIsLoading(true);
      try {
        const response = await serviceGoogleLogin(data);
        const nextSession = buildSessionFromToken(response.token);
        if (!nextSession) {
          clearStoredToken();
          throw new Error('Token de sesión no válido');
        }
        setStoredToken(response.token);
        queryClient?.clear();
        setSession(nextSession);
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  const githubLogin = useCallback(
    async (data: AuthenticateWithGithubData) => {
      setIsLoading(true);
      try {
        const response = await serviceGithubLogin(data);
        const nextSession = buildSessionFromToken(response.token);
        if (!nextSession) {
          clearStoredToken();
          throw new Error('Token de sesión no válido');
        }
        setStoredToken(response.token);
        queryClient?.clear();
        setSession(nextSession);
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      await serviceRegister(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activate = useCallback(async (data: ActivateAccountData) => {
    setIsLoading(true);
    try {
      await serviceActivate(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
    setIsLoading(true);
    try {
      await serviceForgotPassword(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    setIsLoading(true);
    try {
      await serviceResetPassword(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (data: UpdatePasswordData) => {
    setIsLoading(true);
    try {
      await serviceUpdatePassword(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return subscribeToSessionPurge(() => {
      queryClient?.clear();
      setSession(null);
    });
  }, [queryClient]);

  useEffect(() => {
    if (!session) return;

    const refreshTimestamp = session.expiresAt * 1000 - TOKEN_REFRESH_MARGIN_MS;
    const rawDelay = refreshTimestamp - Date.now();
    const delay = Math.min(Math.max(0, rawDelay), MAX_TIMEOUT_DELAY_MS);

    const timer = setTimeout(async () => {
      try {
        const response = await serviceRefreshToken();
        const nextSession = buildSessionFromToken(response.token);
        if (nextSession) {
          setStoredToken(response.token);
          setSession(nextSession);
        } else {
          logout();
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
        }
      }
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [session, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      isAdmin: session?.user.roles.includes('admin') ?? false,
      isEditor: hasCatalogEditorRole(session?.user ?? null),
      isLoading,
      login,
      register,
      activate,
      googleLogin,
      githubLogin,
      forgotPassword,
      resetPassword,
      updatePassword,
      logout
    }),
    [
      session,
      isLoading,
      login,
      register,
      activate,
      googleLogin,
      githubLogin,
      forgotPassword,
      resetPassword,
      updatePassword,
      logout
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
