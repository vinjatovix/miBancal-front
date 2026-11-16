import { describe, expect, it } from 'vitest';

import { selectEmojiCheckFiles } from '../../scripts/emojiCheckFiles';

describe('selectEmojiCheckFiles', () => {
  it('selects ts, tsx, css, and json files inside src', () => {
    const input = [
      'src/components/Icon.tsx',
      'src/styles/tokens.css',
      'src/i18n/core/dictionary.ts',
      'src/data/plants.json'
    ];

    const selected = selectEmojiCheckFiles(input);

    expect(selected).toEqual([
      'src/components/Icon.tsx',
      'src/data/plants.json',
      'src/i18n/core/dictionary.ts',
      'src/styles/tokens.css'
    ]);
  });

  it('excludes test files, fixtures, and files outside src', () => {
    const input = [
      'src/components/Icon.tsx',
      'src/components/Icon.test.tsx',
      'src/fixtures/plants.json',
      'tests/scripts/sample.test.ts',
      'scripts/checkEmoji.ts',
      'package.json',
      'docs/design.md'
    ];

    const selected = selectEmojiCheckFiles(input);

    expect(selected).toEqual(['src/components/Icon.tsx']);
  });
});
