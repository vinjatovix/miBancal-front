import { describe, expect, it } from 'vitest';

import {
  canonicalPlantToFormState,
  formStateToCreatePlantRequest,
  formStateToUpdatePlantRequest,
  initialPlantFormState
} from '../../../../../../src/pages/plants/components/PlantForm/utils/plantFormMappers';
import { buildPlant } from '../../../../../fixtures/plants/buildPlant';

describe('plantFormMappers', () => {
  it('maps canonical plant to form state correctly with full attributes', () => {
    const plant = buildPlant({
      id: 'p-1',
      identity: {
        name: { primary: 'Tomate', aliases: ['Jitomate'] },
        scientificName: 'Solanum lycopersicum',
        family: { id: 'f-1', name: 'Solanáceas', slug: 'solanaceae' }
      },
      image: { url: 'https://example.com/tomate.jpg' },
      knowledge: {
        ...buildPlant().knowledge,
        resources: [
          { type: 'image', url: 'https://example.com/tomate.jpg' },
          {
            type: 'video',
            url: 'https://www.youtube.com/watch?v=tomate123',
            title: 'Video tomate'
          },
          {
            type: 'article',
            url: 'https://example.com/articulo',
            title: 'Artículo'
          }
        ],
        notes: ['Nota de cultivo 1', 'Nota de cultivo 2'],
        watering: {
          frequency: 'regular',
          conditions: ['suelo húmedo']
        },
        light: {
          hoursMin: 6,
          type: 'full_sun',
          preference: 'all_day'
        },
        ecology: {
          strategicBenefits: ['atrae abejas']
        }
      }
    });

    const formState = canonicalPlantToFormState(plant);

    expect(formState.primaryName).toBe('Tomate');
    expect(formState.scientificName).toBe('Solanum lycopersicum');
    expect(formState.familyId).toBe('f-1');
    expect(formState.imageUrl).toBe('https://example.com/tomate.jpg');
    expect(formState.aliases).toEqual(['Jitomate']);
    expect(formState.videoResources).toHaveLength(1);
    expect(formState.videoResources[0].url).toBe(
      'https://www.youtube.com/watch?v=tomate123'
    );
    expect(formState.articleResources).toHaveLength(1);
    expect(formState.notes).toEqual(['Nota de cultivo 1', 'Nota de cultivo 2']);
    expect(formState.wateringConditions).toEqual(['suelo húmedo']);
    expect(formState.lightPreference).toBe('all_day');
    expect(formState.strategicBenefits).toEqual(['atrae abejas']);
  });

  it('generates initial blank plant form state with defaults', () => {
    const state = initialPlantFormState();

    expect(state.primaryName).toBe('');
    expect(state.familyId).toBe('');
    expect(state.lifecycle).toBe('annual');
    expect(state.sowingMonths).toEqual([]);
    expect(state.imageUrl).toBe('');
    expect(state.videoResources).toEqual([]);
    expect(state.articleResources).toEqual([]);
    expect(state.notes).toEqual([]);
  });

  it('converts form state to CreatePlantRequest including resources, notes and ecology', () => {
    const plant = buildPlant();
    const formState = {
      ...canonicalPlantToFormState(plant),
      videoResources: [
        {
          id: 'v-1',
          url: 'https://www.youtube.com/watch?v=cultivo',
          title: 'Tutorial YouTube'
        }
      ],
      articleResources: [
        {
          id: 'a-1',
          url: 'https://example.com/guia',
          title: 'Guía técnica'
        }
      ],
      notes: ['Sembrar con luna creciente'],
      strategicBenefits: ['Repelente de nematodos']
    };

    const request = formStateToCreatePlantRequest(formState, 'generated-id');

    expect(request.id).toBe('generated-id');
    expect(request.identity.name.primary).toBe(formState.primaryName);
    expect(request.identity.family).toBe(formState.familyId);
    expect(request.knowledge.propagation).toEqual({ methods: {} });
    expect(request.knowledge.resources).toHaveLength(3);
    expect(request.knowledge.resources[0].type).toBe('image');
    expect(request.knowledge.resources[1].type).toBe('video');
    expect(request.knowledge.resources[1].url).toBe(
      'https://www.youtube.com/watch?v=cultivo'
    );
    expect(request.knowledge.resources[2].type).toBe('article');
    expect(request.knowledge.notes).toEqual(['Sembrar con luna creciente']);
    expect(request.knowledge.ecology?.strategicBenefits).toEqual([
      'Repelente de nematodos'
    ]);
  });

  it('converts form state to UpdatePlantRequest with RFC 7396 partial patch', () => {
    const original = buildPlant({
      identity: {
        name: { primary: 'Tomate original', aliases: [] },
        scientificName: 'Solanum lycopersicum',
        family: { id: 'f-1', name: 'Solanáceas', slug: 'solanaceae' }
      }
    });
    const formState = {
      ...canonicalPlantToFormState(original),
      primaryName: 'Tomate modificado',
      notes: ['Nueva nota'],
      videoResources: [
        {
          id: 'v-new',
          url: 'https://www.youtube.com/watch?v=nuevo',
          title: 'Nuevo vídeo'
        }
      ]
    };

    const updateRequest = formStateToUpdatePlantRequest(formState);

    expect(updateRequest.identity?.name?.primary).toBe('Tomate modificado');
    expect(updateRequest.knowledge?.notes).toEqual(['Nueva nota']);
    expect(
      updateRequest.knowledge?.resources?.some((r) => r.type === 'video')
    ).toBe(true);
  });

  it('handles plant with null knowledge without crashing', () => {
    const rawPlant = buildPlant();
    // @ts-expect-error test runtime nullable knowledge
    rawPlant.knowledge = null;

    const formState = canonicalPlantToFormState(rawPlant);

    expect(formState.primaryName).toBe(rawPlant.identity.name.primary);
    expect(formState.soilPhMin).toBe('6.0');
    expect(formState.rootType).toBe('fibrous');
    expect(formState.notes).toEqual([]);
  });

  it('reads pollination type from pollination.types array when present', () => {
    const rawPlant = buildPlant({
      phenology: {
        ...buildPlant().phenology,
        flowering: {
          months: [5, 6],
          pollination: {
            types: ['insect', 'wind'],
            agents: ['abejas']
          }
        }
      }
    });

    const formState = canonicalPlantToFormState(rawPlant);

    expect(formState.pollinationType).toBe('insect');
    expect(formState.pollinationAgents).toEqual(['abejas']);
  });

  it('preserves unknown safety status as null in form state', () => {
    const rawPlant = buildPlant({
      traits: {
        ...buildPlant().traits,
        ecological: {}
      }
    });

    const formState = canonicalPlantToFormState(rawPlant);

    expect(formState.edible).toBeNull();
    expect(formState.toxic).toBeNull();
  });

  it('preserves original resources, secondary images, and metadata during update', () => {
    const original = buildPlant({
      knowledge: {
        ...buildPlant().knowledge,
        resources: [
          {
            type: 'image',
            url: 'https://example.com/main.jpg',
            title: 'Foto principal',
            source: 'Archivo',
            tags: ['hero']
          },
          {
            type: 'image',
            url: 'https://example.com/extra.jpg',
            title: 'Foto secundaria',
            tags: ['detalle']
          },
          {
            type: 'video',
            url: 'https://example.com/video.mp4',
            title: 'Video original',
            source: 'Vimeo',
            tags: ['tutorial']
          }
        ]
      }
    });
    const formState = canonicalPlantToFormState(original);

    const updateRequest = formStateToUpdatePlantRequest(formState, original);

    const resources = updateRequest.knowledge?.resources ?? [];
    expect(resources).toHaveLength(3);
    const extraImage = resources.find(
      (r) => r.type === 'image' && r.url === 'https://example.com/extra.jpg'
    );
    expect(extraImage?.tags).toEqual(['detalle']);
    const video = resources.find((r) => r.type === 'video');
    expect(video?.source).toBe('Vimeo');
    expect(video?.tags).toEqual(['tutorial']);
  });

  it('preserves multi-pollination types array during update when unchanged', () => {
    const original = buildPlant({
      phenology: {
        ...buildPlant().phenology,
        flowering: {
          months: [5, 6],
          pollination: {
            types: ['insect', 'wind'],
            agents: ['abejas']
          }
        }
      }
    });
    const formState = canonicalPlantToFormState(original);

    const updateRequest = formStateToUpdatePlantRequest(formState, original);

    expect(updateRequest.phenology?.flowering?.pollination?.types).toEqual([
      'insect',
      'wind'
    ]);
  });

  it('preserves unknown ecological flags as null during update', () => {
    const original = buildPlant({
      traits: {
        ...buildPlant().traits,
        ecological: {}
      }
    });
    const formState = canonicalPlantToFormState(original);

    const updateRequest = formStateToUpdatePlantRequest(formState, original);

    expect(updateRequest.traits?.ecological?.edible).toBeNull();
    expect(updateRequest.traits?.ecological?.toxic).toBeNull();
  });

  it('maps pollination to types array without scalar type in create request', () => {
    const formState = {
      ...initialPlantFormState(),
      primaryName: 'Tomate',
      pollinationType: 'insect' as const,
      pollinationAgents: ['abejas']
    };

    const createRequest = formStateToCreatePlantRequest(formState);

    expect(createRequest.phenology.flowering?.pollination).toEqual({
      types: ['insect'],
      agents: ['abejas']
    });
    expect(
      'type' in (createRequest.phenology.flowering?.pollination ?? {})
    ).toBe(false);
  });

  it('maps pollination to types array without scalar type in update request', () => {
    const formState = {
      ...initialPlantFormState(),
      primaryName: 'Tomate',
      pollinationType: 'wind' as const,
      pollinationAgents: []
    };

    const updateRequest = formStateToUpdatePlantRequest(formState);

    expect(updateRequest.phenology?.flowering?.pollination).toEqual({
      types: ['wind'],
      agents: null
    });
    expect(
      'type' in (updateRequest.phenology?.flowering?.pollination ?? {})
    ).toBe(false);
  });
});
