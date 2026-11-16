import { describe, expect, it } from 'vitest';

import { t } from '../../src/i18n/core/t';

describe('pwa dictionary keys', () => {
  it.each([
    ['offline.title', 'Sin conexión'],
    [
      'offline.message',
      'Esta página no está disponible sin conexión a internet.'
    ],
    ['offline.link', 'Volver al catálogo'],
    ['sw.update.title', 'Nueva versión disponible'],
    ['sw.update.action', 'Actualizar ahora']
  ] as const)('translates %s without exposing key path', (key, expected) => {
    const result = t(key);

    expect(result).toBe(expected);
  });
});
