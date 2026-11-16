import { describe, expect, it } from 'vitest';

import { buildActiveFilters } from '../../../../src/pages/plants/utils/buildActiveFilters';
import {
  DEFAULT_PLANT_SORT,
  type PlantFilterParams,
  type PlantListRequest
} from '../../../../src/services/plantListQuery';

function buildRequest(filters: PlantFilterParams): PlantListRequest {
  return {
    filters,
    pagination: { page: 1, limit: 25 },
    sort: DEFAULT_PLANT_SORT
  };
}

const NORTH = { hemisphere: 'north' } as const;

describe('buildActiveFilters', () => {
  it('sin filtros devuelve una lista vacía', () => {
    expect(buildActiveFilters(buildRequest({}), NORTH)).toEqual([]);
  });

  it('describe el filtro de identidad con prefijo de búsqueda', () => {
    const [chip] = buildActiveFilters(
      buildRequest({ identity: 'tomate' }),
      NORTH
    );

    expect(chip).toEqual({
      id: 'identity',
      label: 'Buscar plantas: tomate',
      param: 'identity'
    });
  });

  it('describe la familia con su nombre legible', () => {
    const [chip] = buildActiveFilters(buildRequest({ family: 'fam-id' }), {
      hemisphere: 'north',
      familyName: 'Malváceas'
    });

    expect(chip).toEqual({
      id: 'family',
      label: 'Familia: Malváceas',
      param: 'family'
    });
  });

  it('sin nombre de familia degrada al identificador recibido', () => {
    const [chip] = buildActiveFilters(
      buildRequest({ family: 'fam-id' }),
      NORTH
    );

    expect(chip.label).toBe('Familia: fam-id');
  });

  it.each([
    ['lifeCycle', 'perennial', 'Perenne', 'lifeCycle'],
    ['sowingMethod', 'direct', 'Directa', 'sowingMethod'],
    ['lightType', 'full_sun', 'Sol pleno', 'lightType'],
    ['rootSystem', 'taproot', 'Pivotante', 'rootSystem']
  ] as const)(
    'describe el filtro de selección %s con etiqueta legible',
    (key, value, label, param) => {
      const [chip] = buildActiveFilters(
        buildRequest({ [key]: value } as PlantFilterParams),
        NORTH
      );

      expect(chip).toEqual({ id: key, label, param });
    }
  );

  it.each([
    ['edible', 'true', 'Comestible: Sí'],
    ['edible', 'false', 'Comestible: No'],
    ['toxic', 'true', 'Tóxica: Sí'],
    ['toxic', 'false', 'Tóxica: No']
  ] as const)(
    'cada estado booleano de %s (%s) es su propio chip',
    (key, value, label) => {
      const [chip] = buildActiveFilters(
        buildRequest({ [key]: value } as PlantFilterParams),
        NORTH
      );

      expect(chip).toEqual({ id: key, label, param: key });
    }
  );

  it.each([
    ['soilPh', '6.5', 'pH del suelo: 6,5'],
    ['lightHoursMin', '8', 'Horas de luz disponibles: 8'],
    ['spacingCm', '30', 'Espacio disponible (cm): 30'],
    ['soilAvailableDepthCm', '40', 'Profundidad disponible (cm): 40']
  ] as const)(
    'describe el rango numérico %s con su valor y nunca la clave técnica',
    (key, value, label) => {
      const [chip] = buildActiveFilters(
        buildRequest({ [key]: value } as PlantFilterParams),
        NORTH
      );

      expect(chip).toEqual({ id: key, label, param: key });
      expect(chip.label).not.toContain('plant.filters');
    }
  );

  it('genera un chip por mes de siembra con nombre según hemisferio norte', () => {
    const chips = buildActiveFilters(
      buildRequest({ sowingMonths: [3, 5] }),
      NORTH
    );

    expect(chips).toEqual([
      {
        id: 'sowingMonths:3',
        label: 'Marzo',
        param: 'sowingMonth',
        value: '3'
      },
      { id: 'sowingMonths:5', label: 'Mayo', param: 'sowingMonth', value: '5' }
    ]);
  });

  it('nombra el mes de siembra según el hemisferio sur', () => {
    const [chip] = buildActiveFilters(buildRequest({ sowingMonths: [3] }), {
      hemisphere: 'south'
    });

    expect(chip).toEqual({
      id: 'sowingMonths:3',
      label: 'Septiembre',
      param: 'sowingMonth',
      value: '3'
    });
  });

  it('el hemisferio sur genera un chip eliminable', () => {
    const [chip] = buildActiveFilters(buildRequest({}), {
      hemisphere: 'south'
    });

    expect(chip).toEqual({
      id: 'hemisphere',
      label: 'Hemisferio: Sur',
      param: 'hemisphere'
    });
  });

  it('el hemisferio norte no genera chip', () => {
    const ids = buildActiveFilters(buildRequest({}), NORTH).map(
      (chip) => chip.id
    );

    expect(ids).not.toContain('hemisphere');
  });

  it('ordena los chips de forma determinista', () => {
    const ids = buildActiveFilters(
      buildRequest({
        identity: 'tomate',
        family: 'fam-id',
        lifeCycle: 'perennial',
        sowingMethod: 'direct',
        lightType: 'full_sun',
        rootSystem: 'taproot',
        edible: 'true',
        toxic: 'false',
        sowingMonths: [3],
        soilPh: '6.5',
        lightHoursMin: '8',
        spacingCm: '30',
        soilAvailableDepthCm: '40'
      }),
      { hemisphere: 'south', familyName: 'Malváceas' }
    ).map((chip) => chip.id);

    expect(ids).toEqual([
      'identity',
      'family',
      'lifeCycle',
      'sowingMethod',
      'lightType',
      'rootSystem',
      'edible',
      'toxic',
      'sowingMonths:3',
      'soilPh',
      'lightHoursMin',
      'spacingCm',
      'soilAvailableDepthCm',
      'hemisphere'
    ]);
  });
});
