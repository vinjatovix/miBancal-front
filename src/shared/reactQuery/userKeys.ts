export const userKeys = {
  all: ['users'] as const,
  lookup: (query: { email?: string; username?: string }) =>
    ['users', 'lookup', query] as const
};
