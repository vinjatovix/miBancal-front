export type UserRole = 'admin' | 'user';

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly roles: readonly UserRole[];
}

export interface JwtPayload {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly roles: readonly UserRole[];
  readonly iat: number;
  readonly exp: number;
}

export interface AuthSession {
  readonly token: string;
  readonly user: AuthUser;
  readonly expiresAt: number;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface RegisterData {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly password: string;
  readonly repeatPassword: string;
}

export interface ActivateAccountData {
  readonly token: string;
}

export interface ForgotPasswordData {
  readonly email: string;
}

export interface ResetPasswordData {
  readonly token: string;
  readonly password: string;
  readonly repeatPassword: string;
}

export interface AuthenticateWithGoogleData {
  readonly idToken: string;
}

export interface AuthenticateWithGithubData {
  readonly code: string;
  readonly codeVerifier: string;
}

export interface AuthTokenResponse {
  readonly token: string;
}

export interface UpdatePasswordData {
  readonly oldPassword: string;
  readonly password: string;
  readonly repeatPassword: string;
}

export interface UpdatePasswordResponse {
  readonly message: string;
}

export interface LoginNavigationState {
  readonly ssoError?: string;
  readonly error?: string;
  readonly from?:
    | string
    | {
        readonly pathname: string;
        readonly search?: string;
        readonly hash?: string;
      };
}

export interface SsoCallbackQueryParams {
  readonly code?: string | null;
  readonly state?: string | null;
  readonly error?: string | null;
  readonly error_description?: string | null;
}

export interface AuthServiceContract {
  register(dto: RegisterData): Promise<void>;
  activate(dto: ActivateAccountData): Promise<void>;
  login(dto: LoginCredentials): Promise<AuthTokenResponse>;
  authenticateWithGoogle(
    dto: AuthenticateWithGoogleData
  ): Promise<AuthTokenResponse>;
  authenticateWithGithub(
    dto: AuthenticateWithGithubData
  ): Promise<AuthTokenResponse>;
  refreshToken(): Promise<AuthTokenResponse>;
  forgotPassword(dto: ForgotPasswordData): Promise<void>;
  resetPassword(dto: ResetPasswordData): Promise<void>;
  updatePassword(dto: UpdatePasswordData): Promise<UpdatePasswordResponse>;
}
