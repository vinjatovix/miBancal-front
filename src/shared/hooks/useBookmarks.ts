import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getBookmarkedPlantIds } from '../../services/bookmarks.service';
import { AuthContext } from '../auth/authContextDef';
import { bookmarkKeys } from '../reactQuery/bookmarkKeys';
import { QUERY_DEFAULTS } from '../reactQuery/queryDefaults';

export function useBookmarks() {
  const auth = useContext(AuthContext);
  const userId = auth?.user?.id;

  return useQuery<Set<string>>({
    queryKey: bookmarkKeys.list(userId),
    queryFn: getBookmarkedPlantIds,
    enabled: auth?.isAuthenticated ?? false,
    ...QUERY_DEFAULTS
  });
}
