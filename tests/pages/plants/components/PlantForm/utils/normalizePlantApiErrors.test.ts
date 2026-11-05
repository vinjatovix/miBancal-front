import { describe, expect, it } from 'vitest';

import { normalizePlantApiErrors } from '../../../../../../src/pages/plants/components/PlantForm/utils/normalizePlantApiErrors';

describe('normalizePlantApiErrors', () => {
  it.each([
    {
      apiKey: 'identity.name.primary',
      fieldKey: 'primaryName',
      message: 'Nombre requerido'
    },
    {
      apiKey: 'identity.name',
      fieldKey: 'primaryName',
      message: 'Nombre inválido'
    },
    {
      apiKey: 'identity.scientificName',
      fieldKey: 'scientificName',
      message: 'Nombre científico requerido'
    },
    {
      apiKey: 'identity.family',
      fieldKey: 'familyId',
      message: 'Familia requerida'
    },
    {
      apiKey: 'traits.size.height',
      fieldKey: 'height',
      message: 'Rango de altura inválido'
    },
    {
      apiKey: 'traits.size.height.min',
      fieldKey: 'height',
      message: 'Altura mínima requerida'
    },
    {
      apiKey: 'traits.size.spread',
      fieldKey: 'spread',
      message: 'Envergadura inválida'
    },
    {
      apiKey: 'traits.spacingCm',
      fieldKey: 'spacing',
      message: 'Marco de plantación inválido'
    },
    {
      apiKey: 'phenology.sowing.months',
      fieldKey: 'sowingMonths',
      message: 'Meses de siembra requeridos'
    },
    {
      apiKey: 'phenology.sowing.seedsPerHole.min',
      fieldKey: 'seedsPerHole',
      message: 'Semillas por golpe inválidas'
    },
    {
      apiKey: 'phenology.sowing.germinationDays',
      fieldKey: 'germinationDays',
      message: 'Días de germinación inválidos'
    },
    {
      apiKey: 'phenology.sowing.methods.direct.depthCm',
      fieldKey: 'directDepth',
      message: 'Profundidad directa inválida'
    },
    {
      apiKey: 'phenology.sowing.methods.starter.depthCm',
      fieldKey: 'starterDepth',
      message: 'Profundidad de semillero inválida'
    },
    {
      apiKey: 'knowledge.resources',
      fieldKey: 'imageUrl',
      message: 'Imagen requerida'
    },
    {
      apiKey: 'knowledge.resources.0.url',
      fieldKey: 'imageUrl',
      message: 'URL de imagen inválida'
    },
    {
      apiKey: 'knowledge.soil.ph',
      fieldKey: 'soilPh',
      message: 'pH inválido'
    },
    {
      apiKey: 'knowledge.soil.availableDepthCm',
      fieldKey: 'soilDepth',
      message: 'Profundidad de suelo inválida'
    },
    {
      apiKey: 'knowledge.rootSystem.depthCm',
      fieldKey: 'rootDepth',
      message: 'Profundidad de raíz inválida'
    },
    {
      apiKey: 'knowledge.rootSystem.spreadCm',
      fieldKey: 'rootSpread',
      message: 'Envergadura de raíz inválida'
    },
    {
      apiKey: 'primaryName',
      fieldKey: 'primaryName',
      message: 'Nombre directo'
    }
  ])(
    'maps API key "$apiKey" to form field "$fieldKey"',
    ({ apiKey, fieldKey, message }) => {
      const serverErrors = { [apiKey]: message };

      const result = normalizePlantApiErrors(serverErrors);

      expect(result.fieldErrors[fieldKey]).toBe(message);
      expect(result.unmappedErrors).toEqual([]);
    }
  );

  it('collects unrecognized keys into unmappedErrors', () => {
    const serverErrors = {
      'custom.unknown.field': 'Error desconocido en backend',
      'phenology.flowering.pollination': 'Polinización incompatible',
      'knowledge.resources.1.url': 'URL de recurso secundario inválida'
    };

    const result = normalizePlantApiErrors(serverErrors);

    expect(result.fieldErrors).toEqual({});
    expect(result.unmappedErrors).toEqual([
      'Error desconocido en backend',
      'Polinización incompatible',
      'URL de recurso secundario inválida'
    ]);
  });
});
