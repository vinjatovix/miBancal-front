import { describe, expect, it } from 'vitest';

import type { PlantFormState } from '../../../../../../src/pages/plants/components/PlantForm/types';
import { validatePlantForm } from '../../../../../../src/pages/plants/components/PlantForm/utils/validatePlantForm';

function buildValidFormState(): PlantFormState {
  return {
    primaryName: 'Tomate',
    aliases: ['Jitomate'],
    scientificName: 'Solanum lycopersicum',
    familyId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    lifecycle: 'annual',
    heightMin: '100',
    heightMax: '200',
    spreadMin: '40',
    spreadMax: '60',
    spacingMin: '40',
    spacingMax: '50',
    edible: true,
    toxic: false,
    toxicityNotes: '',
    sowingMonths: [2, 3],
    seedsPerHoleMin: '2',
    seedsPerHoleMax: '3',
    germinationDaysMin: '6',
    germinationDaysMax: '10',
    directDepthMin: '1',
    directDepthMax: '2',
    starterEnabled: false,
    starterDepthMin: '',
    starterDepthMax: '',
    floweringMonths: [5, 6],
    pollinationType: 'insect',
    pollinationAgents: ['abejas'],
    harvestMonths: [7, 8],
    harvestDescription: '',
    soilPhMin: '6.0',
    soilPhMax: '6.8',
    soilDepthMin: '30',
    soilDepthMax: '50',
    rootType: 'taproot',
    rootDepthMin: '40',
    rootDepthMax: '80',
    rootSpreadMin: '30',
    rootSpreadMax: '50',
    wateringFrequency: 'regular',
    wateringConditions: ['suelo húmedo'],
    lightHoursMin: '6',
    lightType: 'full_sun',
    lightPreference: 'all_day',
    strategicBenefits: ['atrae polinizadores'],
    imageUrl: 'https://example.com/tomate.jpg',
    imageTitle: '',
    imageSource: '',
    videoResources: [],
    articleResources: [],
    notes: ['Buena asociación con albahaca']
  };
}

describe('validatePlantForm', () => {
  it('returns no errors for a valid form state', () => {
    const state = buildValidFormState();

    const errors = validatePlantForm(state);

    expect(Object.keys(errors)).toHaveLength(0);
  });

  it.each([
    ['', 'primaryName'],
    ['   ', 'primaryName']
  ])('returns error when primaryName is invalid: %j', (primaryName, field) => {
    const state = { ...buildValidFormState(), primaryName };

    const errors = validatePlantForm(state);

    expect(errors[field]).toBeDefined();
  });

  it.each([
    ['', 'scientificName'],
    ['   ', 'scientificName']
  ])(
    'returns error when scientificName is invalid: %j',
    (scientificName, field) => {
      const state = { ...buildValidFormState(), scientificName };

      const errors = validatePlantForm(state);

      expect(errors[field]).toBeDefined();
    }
  );

  it('returns error when familyId is empty', () => {
    const state = { ...buildValidFormState(), familyId: '' };

    const errors = validatePlantForm(state);

    expect(errors.familyId).toBeDefined();
  });

  it.each([
    ['heightMin', '0'],
    ['heightMin', '-10'],
    ['heightMin', 'abc'],
    ['heightMax', '50']
  ])('validates size height range: %s=%s', (field, value) => {
    const base = buildValidFormState();
    const state = {
      ...base,
      heightMin: field === 'heightMin' ? value : '100',
      heightMax: field === 'heightMax' ? value : '200'
    };

    const errors = validatePlantForm(state);

    expect(errors.height).toBeDefined();
  });

  it('returns error when sowingMonths is empty', () => {
    const state = { ...buildValidFormState(), sowingMonths: [] };

    const errors = validatePlantForm(state);

    expect(errors.sowingMonths).toBeDefined();
  });

  it.each([
    ['', 'imageUrl'],
    ['ftp://example.com/img.png', 'imageUrl'],
    ['not-a-url', 'imageUrl']
  ])('returns error when imageUrl is invalid: %j', (imageUrl, field) => {
    const state = { ...buildValidFormState(), imageUrl };

    const errors = validatePlantForm(state);

    expect(errors[field]).toBeDefined();
  });

  it.each([
    ['starterDepthMin', ''],
    ['starterDepthMax', ''],
    ['starterDepthMin', '-1'],
    ['starterDepthMin', 'abc'],
    ['starterDepthMax', '0.5']
  ])(
    'validates starter depth when starterEnabled is true and %s is invalid: %s',
    (field, value) => {
      const base = buildValidFormState();
      const state = {
        ...base,
        starterEnabled: true,
        starterDepthMin: '1',
        starterDepthMax: '2',
        [field]: value
      };

      const errors = validatePlantForm(state);

      expect(errors.starterDepth).toBeDefined();
    }
  );

  it.each([
    ['invalid-video', 'videoUrl_0'],
    ['ftp://youtube.com/watch?v=1', 'videoUrl_0']
  ])('returns error when video URL is invalid: %s', (url, errorKey) => {
    const state = {
      ...buildValidFormState(),
      videoResources: [{ id: 'v-1', url, title: 'Video' }]
    };

    const errors = validatePlantForm(state);

    expect(errors[errorKey]).toBeDefined();
  });

  it.each([
    ['invalid-article', 'articleUrl_0'],
    ['ftp://example.com/post', 'articleUrl_0']
  ])('returns error when article URL is invalid: %s', (url, errorKey) => {
    const state = {
      ...buildValidFormState(),
      articleResources: [{ id: 'a-1', url, title: 'Artículo' }]
    };

    const errors = validatePlantForm(state);

    expect(errors[errorKey]).toBeDefined();
  });

  it('returns error when note exceeds 2000 characters', () => {
    const longNote = 'A'.repeat(2001);
    const state = {
      ...buildValidFormState(),
      notes: [longNote]
    };

    const errors = validatePlantForm(state);

    expect(errors.note_0).toBeDefined();
  });

  it.each([
    ['soilPhMin', '0', 'soilPh'],
    ['soilPhMax', '5.0', 'soilPh'],
    ['soilDepthMin', '-1', 'soilDepth'],
    ['soilDepthMax', '20', 'soilDepth'],
    ['rootDepthMin', 'abc', 'rootDepth'],
    ['rootDepthMax', '30', 'rootDepth'],
    ['rootSpreadMin', '0', 'rootSpread'],
    ['rootSpreadMax', '10', 'rootSpread']
  ])(
    'validates knowledge ranges when %s is invalid: %s',
    (field, value, errorKey) => {
      const base = buildValidFormState();
      const state = {
        ...base,
        [field]: value
      };

      const errors = validatePlantForm(state);

      expect(errors[errorKey]).toBeDefined();
    }
  );

  it.each([
    ['seedsPerHoleMin', '', 'seedsPerHole'],
    ['seedsPerHoleMax', '', 'seedsPerHole'],
    ['seedsPerHoleMin', '0', 'seedsPerHole'],
    ['seedsPerHoleMin', '-1', 'seedsPerHole'],
    ['seedsPerHoleMin', 'abc', 'seedsPerHole'],
    ['seedsPerHoleMax', '1', 'seedsPerHole'],
    ['germinationDaysMin', '', 'germinationDays'],
    ['germinationDaysMax', '', 'germinationDays'],
    ['germinationDaysMin', '0', 'germinationDays'],
    ['germinationDaysMin', '-5', 'germinationDays'],
    ['germinationDaysMin', 'invalid', 'germinationDays'],
    ['germinationDaysMax', '4', 'germinationDays'],
    ['directDepthMin', '', 'directDepth'],
    ['directDepthMax', '', 'directDepth'],
    ['directDepthMin', '-1', 'directDepth'],
    ['directDepthMin', 'xyz', 'directDepth'],
    ['directDepthMax', '0.5', 'directDepth']
  ])(
    'validates phenology range when %s is invalid: %s',
    (field, value, errorKey) => {
      const base = buildValidFormState();
      const state = {
        ...base,
        [field]: value
      };

      const errors = validatePlantForm(state);

      expect(errors[errorKey]).toBeDefined();
    }
  );
});
