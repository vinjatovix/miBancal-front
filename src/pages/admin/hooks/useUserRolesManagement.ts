import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { lookupUser, changeUserRoles } from '../../../services/users.service';
import { detectSearchQuery } from '../utils/detectSearchQuery';
import { calculateRolesDelta } from '../utils/calculateRolesDelta';
import { userKeys } from '../../../shared/reactQuery/userKeys';
import { t } from '../../../i18n/core/t';
import type { UserRole } from '../../../types/auth';
import type {
  UserLookupView,
  ChangeUserRolesRequest,
  UserRolesResult
} from '../../../types/users';

export function useUserRolesManagement() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserLookupView | null>(null);
  const [etag, setEtag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<Error | null>(null);

  const search = async (term: string) => {
    const evaluated = detectSearchQuery(term);
    if (evaluated.kind === 'empty') return;

    setUser(null);
    setEtag(null);
    setSuccessMessage(null);

    if (evaluated.kind === 'invalid_email') {
      setSearchError(new Error(t('admin.search_invalid_email')));
      return;
    }

    setSearchError(null);
    try {
      const queryParam = evaluated.queryParam ?? {};
      const result = await queryClient.fetchQuery({
        queryKey: userKeys.lookup(queryParam),
        queryFn: () => lookupUser(queryParam)
      });
      setUser(result.user);
      setEtag(result.etag);
    } catch (e) {
      setSearchError(
        e instanceof Error ? e : new Error('Unknown search error')
      );
    }
  };

  const mutation = useMutation({
    mutationFn: ({
      userId,
      delta,
      etag
    }: {
      userId: string;
      delta: ChangeUserRolesRequest;
      etag: string;
    }) => changeUserRoles(userId, delta, etag),
    onSuccess: (result: UserRolesResult) => {
      if (user) {
        setUser({
          ...user,
          roles: result.userRoles.roles
        });
      }
      setEtag(result.etag);
      setIsModalOpen(false);
      setSuccessMessage('admin.role_change_success_message');
    }
  });

  const saveRoles = (newRoles: UserRole[]) => {
    if (!user || !etag) return;
    const delta = calculateRolesDelta(user.roles, newRoles);
    if (Object.keys(delta).length === 0) return;

    mutation.mutate({ userId: user.id, delta, etag });
  };

  return {
    search,
    user,
    etag,
    isLoading: mutation.isPending,
    error: mutation.error || searchError,
    isModalOpen,
    setIsModalOpen,
    saveRoles,
    successMessage
  };
}
