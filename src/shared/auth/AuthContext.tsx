import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { QueryClientContext, type QueryClient } from '@tanstack/react-query';

import { t } from '../../i18n/core/t';
import * as authService from '../../services/auth.service';
import type {
  ActivateAccountData,
  AuthenticateWithGithubData,
  AuthenticateWithGoogleData,
  AuthSession,
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  UpdatePasswordData
} from '../../types/auth';
import { ApiError } from '../errors/ApiError';
import { toastActions } from '../toast/useToast';
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
import {
  broadcastSessionLogin,
  broadcastSessionLogout,
  broadcastSessionRefresh,
  subscribeToSessionSync
} from './sessionSync';

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
  const sessionRef = useRef(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const logout = useCallback(() => {
    clearStoredToken();
    broadcastSessionLogout();
    void queryClient?.cancelQueries();
    queryClient?.clear();
    setSession(null);
  }, [queryClient]);

  const commitSession = useCallback(
    (token: string) => {
      const nextSession = buildSessionFromToken(token);
      if (!nextSession) {
        clearStoredToken();
        broadcastSessionLogout();
        throw new Error('Token de sesión no válido');
      }
      setStoredToken(token);
      broadcastSessionLogin(token);
      void queryClient?.cancelQueries();
      queryClient?.clear();
      setSession(nextSession);
    },
    [queryClient]
  );

  const withLoading = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T> => {
      setIsLoading(true);
      try {
        return await action();
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    (credentials: LoginCredentials) =>
      withLoading(async () => {
        const response = await authService.login(credentials);
        commitSession(response.token);
      }),
    [commitSession, withLoading]
  );

  const googleLogin = useCallback(
    (data: AuthenticateWithGoogleData) =>
      withLoading(async () => {
        const response = await authService.authenticateWithGoogle(data);
        commitSession(response.token);
      }),
    [commitSession, withLoading]
  );

  const githubLogin = useCallback(
    (data: AuthenticateWithGithubData) =>
      withLoading(async () => {
        const response = await authService.authenticateWithGithub(data);
        commitSession(response.token);
      }),
    [commitSession, withLoading]
  );

  const register = useCallback(
    (data: RegisterData) => withLoading(() => authService.register(data)),
    [withLoading]
  );
  const activate = useCallback(
    (data: ActivateAccountData) =>
      withLoading(() => authService.activate(data)),
    [withLoading]
  );
  const forgotPassword = useCallback(
    (data: ForgotPasswordData) =>
      withLoading(() => authService.forgotPassword(data)),
    [withLoading]
  );
  const resetPassword = useCallback(
    (data: ResetPasswordData) =>
      withLoading(() => authService.resetPassword(data)),
    [withLoading]
  );
  const updatePassword = useCallback(
    (data: UpdatePasswordData) =>
      withLoading(async () => {
        await authService.updatePassword(data);
      }),
    [withLoading]
  );

  useEffect(() => {
    return subscribeToSessionPurge(() => {
      clearStoredToken();
      broadcastSessionLogout();
      void queryClient?.cancelQueries();
      queryClient?.clear();
      setSession(null);
    });
  }, [queryClient]);

  useEffect(() => {
    return subscribeToSessionSync((message) => {
      if (message.type === 'SESSION_LOGOUT') {
        clearStoredToken();
        void queryClient?.cancelQueries();
        queryClient?.clear();
        if (sessionRef.current !== null) {
          toastActions.showToast({
            message: t('auth.session_closed_in_other_tab'),
            variant: 'warning'
          });
        }
        setSession(null);
        return;
      }
      const nextSession = buildSessionFromToken(message.token);
      if (nextSession) {
        setStoredToken(message.token);
        if (message.type === 'SESSION_LOGIN') {
          void queryClient?.cancelQueries();
          queryClient?.clear();
        }
        setSession(nextSession);
      } else {
        clearStoredToken();
        setSession(null);
      }
    });
  }, [queryClient]);

  useEffect(() => {
    if (!session) return;

    const refreshTimestamp = session.expiresAt * 1000 - TOKEN_REFRESH_MARGIN_MS;
    const rawDelay = refreshTimestamp - Date.now();
    const delay = Math.min(Math.max(0, rawDelay), MAX_TIMEOUT_DELAY_MS);

    const timer = setTimeout(async () => {
      try {
        const response = await authService.refreshToken();
        const nextSession = buildSessionFromToken(response.token);
        if (nextSession) {
          setStoredToken(response.token);
          broadcastSessionRefresh(response.token);
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
