import type { EvaluatedSearchTerm, SearchTermKind } from '../../../types/users';

export type { EvaluatedSearchTerm, SearchTermKind };

export function detectSearchQuery(raw: string): EvaluatedSearchTerm {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { raw, kind: 'empty' };
  }

  if (raw.includes('@')) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return { raw, kind: 'email', queryParam: { email: trimmed } };
    }
    return {
      raw,
      kind: 'invalid_email',
      validationError: 'admin.search_invalid_email'
    };
  }

  return { raw, kind: 'username', queryParam: { username: trimmed } };
}
