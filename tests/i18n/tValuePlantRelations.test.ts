import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tValue } from '../../src/i18n/core/tValue';
import { reportMissingTranslation } from '../../src/shared/observability/reportMissingTranslation';

vi.mock('../../src/shared/observability/reportMissingTranslation', () => ({
  reportMissingTranslation: vi.fn()
}));

describe('tValue plantRelation.mechanismValues', () => {
  beforeEach(() => {
    vi.mocked(reportMissingTranslation).mockClear();
  });

  it.each([
    ['pest_repellent', 'Repelente de plagas'],
    ['pollinator_attractor', 'Atracción de polinizadores'],
    ['nitrogen_fixer', 'Fijador de nitrógeno'],
    ['nutrient_accumulator', 'Acumulador de nutrientes'],
    ['growth_stimulator', 'Estimulador del crecimiento'],
    ['trap_crop', 'Cultivo trampa'],
    ['physical_support', 'Soporte físico'],
    ['shade_provider', 'Provisión de sombra'],
    ['allelopathy', 'Alelopatía'],
    ['pest_host', 'Huésped de plagas'],
    ['disease_vector', 'Vector de enfermedades'],
    ['resource_competition', 'Competencia por recursos']
  ] as const)('translates mechanism %s to %s', (mechanism, expected) => {
    const result = tValue('plantRelation.mechanismValues', mechanism);

    expect(result).toBe(expected);
    expect(reportMissingTranslation).not.toHaveBeenCalled();
  });

  it('returns the raw value and reports missing translation for unknown mechanism', () => {
    const unknownMechanism = 'unknown_mechanism';

    const result = tValue('plantRelation.mechanismValues', unknownMechanism);

    expect(result).toBe(unknownMechanism);
    expect(reportMissingTranslation).toHaveBeenCalledExactlyOnceWith(
      'plantRelation.mechanismValues.unknown_mechanism'
    );
  });
});
