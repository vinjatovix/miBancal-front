export const familyKeys = {
  all: ['families'] as const,
  list: () => [...familyKeys.all, 'list'] as const,
  detail: (idOrSlug?: string) =>
    [...familyKeys.all, 'detail', idOrSlug] as const
};
