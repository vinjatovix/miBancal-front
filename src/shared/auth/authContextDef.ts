import { createContext } from 'react';

import type {
  ActivateAccountData,
  AuthenticateWithGoogleData,
  AuthenticateWithGithubData,
  AuthSession,
  AuthUser,
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  UpdatePasswordData
} from '../../types/auth';

export interface AuthContextValue {
  readonly session: AuthSession | null;
  readonly user: AuthUser | null;
  readonly isAuthenticated: boolean;
  readonly isAdmin: boolean;
  readonly isEditor: boolean;
  readonly isLoading: boolean;
  login(credentials: LoginCredentials): Promise<void>;
  register(data: RegisterData): Promise<void>;
  activate(data: ActivateAccountData): Promise<void>;
  googleLogin(data: AuthenticateWithGoogleData): Promise<void>;
  githubLogin(data: AuthenticateWithGithubData): Promise<void>;
  forgotPassword(data: ForgotPasswordData): Promise<void>;
  resetPassword(data: ResetPasswordData): Promise<void>;
  updatePassword(data: UpdatePasswordData): Promise<void>;
  logout(): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
