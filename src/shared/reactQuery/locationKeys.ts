import type { LocationListRequest } from '../../services/locationListQuery';

export const locationKeys = {
  all: (userId: string) => ['locations', userId] as const,
  list: (userId: string, request: LocationListRequest) =>
    [...locationKeys.all(userId), 'list', request] as const,
  detail: (userId: string, id?: string) =>
    [...locationKeys.all(userId), 'detail', id] as const,
  layout: (id: string) => ['locations', 'layout', id] as const
};
