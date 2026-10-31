import { describe, it, expect } from 'vitest';
import { lookup, t } from '../../../src/i18n/core/t';

describe('t', () => {
  it('returns translated value for valid key', () => {
    expect(t('common.loading')).toBe('Cargando...');
  });

  it('returns key when translation does not exist', () => {
    // @ts-expect-error -- verificación del fallback ante una clave no tipada en I18nKey
    expect(t('non.existing.key')).toBe('non.existing.key');
  });

  it('supports nested keys', () => {
    expect(t('family.hero.order')).toBe('Orden');
  });

  it('returns key when intermediate path is invalid', () => {
    // @ts-expect-error -- verificación del fallback ante una ruta intermedia inválida no tipada en I18nKey
    expect(t('family.invalid.key')).toBe('family.invalid.key');
  });

  it.each([
    [
      'family.plants.showing_count' as const,
      { count: 5, total: 20 } as Record<string, string | number>,
      'Mostrando 5 de 20 plantas'
    ],
    [
      'family.plants.total_count' as const,
      { total: 10 } as Record<string, string | number>,
      '10 plantas en total'
    ],
    [
      'family.plants.single_count' as const,
      {} as Record<string, string | number>,
      '1 planta en total'
    ]
  ])('interpolates parameters for %s', (key, params, expected) => {
    const result = t(key, params);

    expect(result).toBe(expected);
  });

  it('leaves unreplaced placeholders when matching parameter is missing', () => {
    const key = 'family.plants.showing_count';
    const params = { count: 3 };

    const result = t(key, params);

    expect(result).toBe('Mostrando 3 de {total} plantas');
  });

  it('preserves backward compatibility when params is omitted', () => {
    const key = 'family.plants.showing_count';

    const result = t(key);

    expect(result).toBe('Mostrando {count} de {total} plantas');
  });

  it('interpolates string and number parameters properly', () => {
    const key = 'family.plants.showing_count';
    const params = { count: 'diez', total: 50 };

    const result = t(key, params);

    expect(result).toBe('Mostrando diez de 50 plantas');
  });

  it('handles parameter values containing $ without regex corruption', () => {
    const key = 'family.plants.showing_count';
    const params = { count: '$10', total: '$100' };

    const result = t(key, params);

    expect(result).toBe('Mostrando $10 de $100 plantas');
  });
});

describe('lookup', () => {
  it('returns the text of an existing path', () => {
    expect(lookup('plant.calendar.seasonValues.spring')).toBe('Primavera');
  });

  it('returns undefined for a missing path', () => {
    expect(lookup('plant.calendar.seasonValues.monsoon')).toBeUndefined();
  });

  it('returns undefined for a path that points to an object', () => {
    expect(lookup('plant.calendar.seasonValues')).toBeUndefined();
  });
});
