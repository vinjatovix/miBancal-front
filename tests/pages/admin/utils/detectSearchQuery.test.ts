import { describe, expect, it } from 'vitest';

import { detectSearchQuery } from '../../../../src/pages/admin/utils/detectSearchQuery';
import type { EvaluatedSearchTerm } from '../../../../src/types/users';

describe('detectSearchQuery', () => {
  it.each<{
    readonly input: string;
    readonly expected: EvaluatedSearchTerm;
  }>([
    {
      input: 'hortelano@example.com',
      expected: {
        raw: 'hortelano@example.com',
        kind: 'email',
        queryParam: { email: 'hortelano@example.com' }
      }
    },
    {
      input: '  hortelano@example.com  ',
      expected: {
        raw: '  hortelano@example.com  ',
        kind: 'email',
        queryParam: { email: 'hortelano@example.com' }
      }
    },
    {
      input: 'hortelano',
      expected: {
        raw: 'hortelano',
        kind: 'username',
        queryParam: { username: 'hortelano' }
      }
    },
    {
      input: '  hortelano  ',
      expected: {
        raw: '  hortelano  ',
        kind: 'username',
        queryParam: { username: 'hortelano' }
      }
    },
    {
      input: 'invalid@',
      expected: {
        raw: 'invalid@',
        kind: 'invalid_email',
        validationError: 'admin.search_invalid_email'
      }
    },
    {
      input: '@domain.com',
      expected: {
        raw: '@domain.com',
        kind: 'invalid_email',
        validationError: 'admin.search_invalid_email'
      }
    },
    {
      input: '',
      expected: {
        raw: '',
        kind: 'empty'
      }
    },
    {
      input: '   ',
      expected: {
        raw: '   ',
        kind: 'empty'
      }
    }
  ])('evaluates search term "$input"', ({ input, expected }) => {
    const result = detectSearchQuery(input);

    expect(result).toEqual(expected);
  });
});
