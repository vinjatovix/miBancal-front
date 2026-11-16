import type {
  ActivateAccountData,
  AuthenticateWithGoogleData,
  AuthenticateWithGithubData,
  AuthServiceContract,
  AuthTokenResponse,
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  UpdatePasswordData,
  UpdatePasswordResponse
} from '../types/auth';
import { apiFetch } from './api';

export type { AuthServiceContract };

export async function register(dto: RegisterData): Promise<void> {
  return apiFetch<void>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function activate(dto: ActivateAccountData): Promise<void> {
  return apiFetch<void>('/api/v1/auth/activate', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function login(dto: LoginCredentials): Promise<AuthTokenResponse> {
  return apiFetch<AuthTokenResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function authenticateWithGoogle(
  dto: AuthenticateWithGoogleData
): Promise<AuthTokenResponse> {
  return apiFetch<AuthTokenResponse>('/api/v1/auth/google', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function authenticateWithGithub(
  dto: AuthenticateWithGithubData
): Promise<AuthTokenResponse> {
  return apiFetch<AuthTokenResponse>('/api/v1/auth/github', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function refreshToken(): Promise<AuthTokenResponse> {
  return apiFetch<AuthTokenResponse>('/api/v1/auth/refresh', {
    method: 'POST'
  });
}

export async function forgotPassword(dto: ForgotPasswordData): Promise<void> {
  return apiFetch<void>('/api/v1/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function resetPassword(dto: ResetPasswordData): Promise<void> {
  return apiFetch<void>('/api/v1/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function updatePassword(
  dto: UpdatePasswordData
): Promise<UpdatePasswordResponse> {
  return apiFetch<UpdatePasswordResponse>('/api/v1/auth/update', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export const authService: AuthServiceContract = {
  register,
  activate,
  login,
  authenticateWithGoogle,
  authenticateWithGithub,
  refreshToken,
  forgotPassword,
  resetPassword,
  updatePassword
};
