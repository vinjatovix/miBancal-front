import { describe, expect, it } from 'vitest';

import { findUiTextRuleBypasses } from '../../scripts/uiTextRuleBypass';

describe('findUiTextRuleBypasses', () => {
  it.each([
    '// eslint-disable-next-line local/no-hardcoded-ui-text',
    '/* eslint-disable local/no-hardcoded-ui-text */',
    '<p>Hola</p> // eslint-disable-line local/no-hardcoded-ui-text -- motivo',
    '/* eslint local/no-hardcoded-ui-text: off */',
    "const rule = 'no-hardcoded-ui-text';",
    '// eslint-disable-next-line',
    '// eslint-disable-next-line -- motivo',
    '/* eslint-disable */',
    '{/* eslint-disable-next-line */}',
    '<p>Hola</p> // eslint-disable-line'
  ])('flags %s', (directive) => {
    const source = `const a = 1;\n${directive}\nconst b = 2;\n`;

    expect(findUiTextRuleBypasses(source)).toEqual([
      { line: 2, match: directive }
    ]);
  });

  it('flags every mention with its line', () => {
    const source = [
      '/* eslint-disable local/no-hardcoded-ui-text */',
      'const a = 1;',
      '// eslint-disable-next-line local/no-hardcoded-ui-text'
    ].join('\n');

    expect(findUiTextRuleBypasses(source).map(({ line }) => line)).toEqual([
      1, 3
    ]);
  });

  it.each([
    '// eslint-disable-next-line react-hooks/exhaustive-deps -- motivo',
    '/* eslint-disable react-hooks/set-state-in-effect */',
    "export const a = t('common.loading');"
  ])('ignores %s', (source) => {
    expect(findUiTextRuleBypasses(source)).toEqual([]);
  });
});
