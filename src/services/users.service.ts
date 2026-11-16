import { apiFetchWithMeta } from './api';
import type {
  UserLookupView,
  UserRolesView,
  ChangeUserRolesRequest
} from '../types/users';

export async function lookupUser(query: {
  email?: string;
  username?: string;
}): Promise<{ user: UserLookupView; etag: string }> {
  const params = new URLSearchParams();
  if (query.email) params.append('email', query.email);
  if (query.username) params.append('username', query.username);
  const result = await apiFetchWithMeta<UserLookupView>(
    `/api/v1/users/lookup?${params.toString()}`
  );
  if (result.etag === null) throw new Error('ETag missing');
  return { user: result.data, etag: result.etag };
}

export async function changeUserRoles(
  userId: string,
  delta: ChangeUserRolesRequest,
  etag: string
): Promise<{ userRoles: UserRolesView; etag: string }> {
  const result = await apiFetchWithMeta<UserRolesView>(
    `/api/v1/users/${userId}/roles`,
    {
      method: 'PATCH',
      body: JSON.stringify(delta),
      headers: { 'If-Match': etag }
    }
  );
  if (result.etag === null) throw new Error('ETag missing');
  return { userRoles: result.data, etag: result.etag };
}
