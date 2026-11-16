export const plantInstanceKeys = {
  all: (userId: string) => ['plant-instances', userId] as const,
  lists: (userId: string) =>
    [...plantInstanceKeys.all(userId), 'list'] as const,
  byBed: (userId: string, bedId: string) =>
    [...plantInstanceKeys.lists(userId), bedId] as const
};
