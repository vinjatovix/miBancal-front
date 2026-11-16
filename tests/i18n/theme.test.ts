import { describe, expect, it } from 'vitest';

import { t } from '../../src/i18n/core/t';

describe('theme dictionary keys', () => {
  it.each([
    [
      'theme.aria.light',
      'Tema claro activo. Pulsar para cambiar a tema oscuro.'
    ],
    ['theme.aria.dark', 'Tema oscuro activo. Pulsar para cambiar a tema claro.']
  ] as const)('translates %s without exposing key path', (key, expected) => {
    const result = t(key);

    expect(result).toBe(expected);
  });
});
