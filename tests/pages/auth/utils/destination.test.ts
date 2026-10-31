import { describe, expect, it } from 'vitest';

import { resolveRedirectDestination } from '../../../../src/pages/auth/utils/destination';

describe('resolveRedirectDestination', () => {
  it.each([
    ['/admin', '/admin'],
    ['/plants?cycle=annual', '/plants?cycle=annual'],
    ['/profile#settings', '/profile#settings'],
    ['/dashboard/metrics', '/dashboard/metrics']
  ])('returns valid relative string path %s as %s', (input, expected) => {
    const result = resolveRedirectDestination(input);

    expect(result).toBe(expected);
  });

  it.each([
    [{ pathname: '/admin' }, '/admin'],
    [
      { pathname: '/plants', search: '?cycle=annual', hash: '#gallery' },
      '/plants?cycle=annual#gallery'
    ],
    [
      { pathname: '/profile', search: '?tab=security' },
      '/profile?tab=security'
    ],
    [{ pathname: '/dashboard', hash: '#overview' }, '/dashboard#overview']
  ])(
    'returns valid Location object %j as formatted path %s',
    (input, expected) => {
      const result = resolveRedirectDestination(input);

      expect(result).toBe(expected);
    }
  );

  it.each([
    [{ from: '/admin' }, '/admin'],
    [
      { from: { pathname: '/plants', search: '?cycle=annual' } },
      '/plants?cycle=annual'
    ]
  ])(
    'extracts and resolves destination from location state object %j',
    (input, expected) => {
      const result = resolveRedirectDestination(input);

      expect(result).toBe(expected);
    }
  );

  it.each([
    ['//malicious.example.com'],
    ['//attacker.com/login'],
    ['///triple-slash'],
    ['/\\malicious.example.com'],
    ['/\\\\attacker.com'],
    [{ pathname: '//malicious.example.com' }],
    [{ pathname: '/\\malicious.example.com' }],
    [{ from: '//malicious.example.com' }],
    [{ from: '/\\malicious.example.com' }]
  ])('normalizes open redirect pattern %j to root /', (input) => {
    const result = resolveRedirectDestination(input);

    expect(result).toBe('/');
  });

  it.each([
    ['/login'],
    ['/register'],
    [{ pathname: '/login' }],
    [{ pathname: '/register' }],
    [{ from: '/login' }],
    [{ from: '/register' }]
  ])('normalizes loop route %j to root /', (input) => {
    const result = resolveRedirectDestination(input);

    expect(result).toBe('/');
  });

  it.each([
    [''],
    ['not-a-slash'],
    ['https://external.com'],
    [null],
    [undefined],
    [{}],
    [{ pathname: '' }],
    [{ pathname: 'no-slash' }]
  ])('normalizes invalid or missing input %j to root /', (input) => {
    const result = resolveRedirectDestination(input);

    expect(result).toBe('/');
  });
});
