import { describe, expect, it } from 'vitest';

import {
  declaredViteKeys,
  missingViteKeys,
  usedViteKeys
} from '../../scripts/envExampleKeys';

describe('usedViteKeys', () => {
  it('extracts VITE_ tokens from source contents', () => {
    const sources = new Map([
      ['src/services/api.ts', 'const url = import.meta.env.VITE_API_URL;'],
      [
        'src/auth/google.ts',
        'const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;'
      ]
    ]);

    expect(usedViteKeys(sources)).toEqual([
      'VITE_API_URL',
      'VITE_GOOGLE_CLIENT_ID'
    ]);
  });

  it('deduplicates keys used across multiple files', () => {
    const sources = new Map([
      ['src/a.ts', 'VITE_API_URL VITE_API_URL'],
      ['src/b.ts', 'VITE_API_URL']
    ]);

    expect(usedViteKeys(sources)).toEqual(['VITE_API_URL']);
  });

  it('ignores files matching *.test.* and /fixtures/', () => {
    const sources = new Map([
      ['src/a.test.ts', 'VITE_ONLY_IN_TEST'],
      ['src/fixtures/data.ts', 'VITE_ONLY_IN_FIXTURE'],
      ['src/real.ts', 'VITE_API_URL']
    ]);

    expect(usedViteKeys(sources)).toEqual(['VITE_API_URL']);
  });

  it('returns an empty array when no VITE_ token is present', () => {
    const sources = new Map([['src/a.ts', 'const x = 1;']]);

    expect(usedViteKeys(sources)).toEqual([]);
  });
});

describe('declaredViteKeys', () => {
  it('parses VITE_ keys declared in .env.example', () => {
    const envExample = [
      'VITE_API_URL=http://localhost:3000',
      '',
      'VITE_GOOGLE_CLIENT_ID=example-client-id'
    ].join('\n');

    expect(declaredViteKeys(envExample)).toEqual([
      'VITE_API_URL',
      'VITE_GOOGLE_CLIENT_ID'
    ]);
  });

  it('ignores blank lines and non-VITE keys', () => {
    const envExample = ['', 'OTHER=1', 'VITE_API_URL=x'].join('\n');

    expect(declaredViteKeys(envExample)).toEqual(['VITE_API_URL']);
  });

  it('returns an empty array for an empty file', () => {
    expect(declaredViteKeys('')).toEqual([]);
  });
});

describe('missingViteKeys', () => {
  it('returns keys used but not declared', () => {
    expect(
      missingViteKeys(
        ['VITE_API_URL', 'VITE_GOOGLE_CLIENT_ID'],
        ['VITE_API_URL']
      )
    ).toEqual(['VITE_GOOGLE_CLIENT_ID']);
  });

  it('returns an empty array when all used keys are declared', () => {
    expect(missingViteKeys(['VITE_API_URL'], ['VITE_API_URL'])).toEqual([]);
  });
});
