export interface BedListFilters {
  readonly locationId?: string;
}

export const bedKeys = {
  all: (userId: string) => ['beds', userId] as const,
  lists: (userId: string) => [...bedKeys.all(userId), 'list'] as const,
  list: (userId: string, filters?: BedListFilters) =>
    [...bedKeys.lists(userId), filters ?? {}] as const,
  details: (userId: string) => [...bedKeys.all(userId), 'detail'] as const,
  detail: (userId: string, id: string) =>
    [...bedKeys.details(userId), id] as const
};
