import type { UserRole } from './auth';

export type ManageableRole = 'admin' | 'collaborator';

export type SearchTermKind = 'email' | 'username' | 'invalid_email' | 'empty';

export interface EvaluatedSearchTerm {
  readonly raw: string;
  readonly kind: SearchTermKind;
  readonly queryParam?: { readonly email?: string; readonly username?: string };
  readonly validationError?: string;
}

export interface UserLookupView {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly roles: readonly UserRole[];
}

export interface UserLookupResult {
  readonly user: UserLookupView;
  readonly etag: string;
}

export interface ChangeUserRolesRequest {
  readonly add?: readonly ManageableRole[];
  readonly remove?: readonly ManageableRole[];
}

export interface UserRolesMetadata {
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface UserRolesView {
  readonly id: string;
  readonly roles: readonly UserRole[];
  readonly metadata: UserRolesMetadata;
}

export interface UserRolesResult {
  readonly userRoles: UserRolesView;
  readonly etag: string;
}
