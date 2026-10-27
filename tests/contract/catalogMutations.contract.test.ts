import { describe, expect, it } from 'vitest';

import { validateRequest, validateSchema } from './openApiContract';

describe('OpenAPI catalog mutations contract', () => {
  it.each([
    ['post', '/api/v1/plants'],
    ['patch', '/api/v1/plants/678efda2-ac3d-4623-81cd-fc1d0ab80315'],
    ['post', '/api/v1/families'],
    ['patch', '/api/v1/families/solanaceae'],
    ['patch', '/api/v1/families/678efda2-ac3d-4623-81cd-fc1d0ab80315'],
    ['post', '/api/v1/anomalies'],
    ['patch', '/api/v1/anomalies/pulgon-verde'],
    ['patch', '/api/v1/anomalies/4f0f9a2e-7a0b-4a0e-9d52-2d6a8d1c0a11'],
    ['post', '/api/v1/garden-inputs'],
    ['patch', '/api/v1/garden-inputs/purin-ortiga'],
    ['patch', '/api/v1/garden-inputs/7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90'],
    ['delete', '/api/v1/garden-inputs/purin-ortiga']
  ] as const)('validates openapi path for %s %s', (method, path) => {
    const violations = validateRequest(method, path);

    expect(violations).toEqual([]);
  });

  describe('CreatePlant schema', () => {
    it('accepts a valid plant creation payload', () => {
      const payload = {
        id: '678efda2-ac3d-4623-81cd-fc1d0ab80315',
        identity: {
          name: { primary: 'Tomate', aliases: ['Jitomate'] },
          scientificName: 'Solanum lycopersicum',
          family: 'd0a3b923-c1ac-4796-afa4-1c801ff1a4a3'
        },
        traits: {
          lifecycle: 'annual',
          size: {
            height: { min: 100, max: 200 },
            spread: { min: 40, max: 60 }
          },
          spacingCm: { min: 40, max: 50 },
          ecological: { edible: true, toxic: false }
        },
        phenology: {
          sowing: {
            months: [2, 3],
            seedsPerHole: { min: 2, max: 3 },
            germinationDays: { min: 6, max: 10 },
            methods: {
              direct: { depthCm: { min: 1, max: 2 } }
            }
          }
        },
        knowledge: {
          soil: {
            ph: { min: 6.0, max: 6.8 },
            availableDepthCm: { min: 30, max: 50 }
          },
          rootSystem: {
            type: 'taproot',
            depthCm: { min: 40, max: 80 },
            spreadCm: { min: 30, max: 50 }
          },
          watering: { frequency: 'regular' },
          light: { hoursMin: 6, type: 'full_sun' },
          propagation: { methods: {} },
          resources: [{ type: 'image', url: 'https://example.com/tomate.jpg' }]
        }
      };

      const violations = validateSchema('CreatePlant', payload);

      expect(violations).toEqual([]);
    });

    it('accepts plant creation payload with full model including videos, articles, notes and ecology', () => {
      const payload = {
        id: '678efda2-ac3d-4623-81cd-fc1d0ab80315',
        identity: {
          name: { primary: 'Tomate', aliases: ['Jitomate'] },
          scientificName: 'Solanum lycopersicum',
          family: 'd0a3b923-c1ac-4796-afa4-1c801ff1a4a3'
        },
        traits: {
          lifecycle: 'annual',
          size: {
            height: { min: 100, max: 200 },
            spread: { min: 40, max: 60 }
          },
          spacingCm: { min: 40, max: 50 },
          ecological: {
            edible: true,
            toxic: false,
            toxicityNotes: 'Hojas tóxicas'
          }
        },
        phenology: {
          sowing: {
            months: [2, 3],
            seedsPerHole: { min: 2, max: 3 },
            germinationDays: { min: 6, max: 10 },
            methods: {
              direct: { depthCm: { min: 1, max: 2 } }
            }
          },
          flowering: {
            months: [5, 6],
            pollination: {
              types: ['insect'],
              agents: ['abejas']
            }
          },
          harvest: {
            months: [7, 8],
            description: 'Cosechar en madurez'
          }
        },
        knowledge: {
          soil: {
            ph: { min: 6.0, max: 6.8 },
            availableDepthCm: { min: 30, max: 50 }
          },
          rootSystem: {
            type: 'taproot',
            depthCm: { min: 40, max: 80 },
            spreadCm: { min: 30, max: 50 }
          },
          watering: {
            frequency: 'regular',
            conditions: ['suelo húmedo']
          },
          light: {
            hoursMin: 6,
            type: 'full_sun',
            preference: 'all_day'
          },
          propagation: { methods: {} },
          ecology: {
            strategicBenefits: ['atrae polinizadores']
          },
          resources: [
            {
              type: 'image',
              url: 'https://example.com/tomate.jpg',
              title: 'Tomate',
              source: 'Wikipedia'
            },
            {
              type: 'video',
              url: 'https://www.youtube.com/watch?v=tomate',
              title: 'Cultivo tomate'
            },
            {
              type: 'article',
              url: 'https://example.com/articulo',
              title: 'Ficha técnica'
            }
          ],
          notes: ['Asociar con albahaca', 'Rotación de cultivos cada 3 años']
        }
      };

      const violations = validateSchema('CreatePlant', payload);

      expect(violations).toEqual([]);
    });

    it('rejects creation payload with invalid uuid format', () => {
      const payload = {
        id: 'not-a-valid-uuid',
        identity: {
          name: { primary: 'Tomate' },
          scientificName: 'Solanum lycopersicum',
          family: 'd0a3b923-c1ac-4796-afa4-1c801ff1a4a3'
        },
        traits: {
          lifecycle: 'annual',
          size: {
            height: { min: 100, max: 200 },
            spread: { min: 40, max: 60 }
          },
          spacingCm: { min: 40, max: 50 }
        },
        phenology: {
          sowing: {
            months: [2],
            seedsPerHole: { min: 2, max: 3 },
            germinationDays: { min: 6, max: 10 },
            methods: { direct: { depthCm: { min: 1, max: 2 } } }
          }
        },
        knowledge: {
          soil: {
            ph: { min: 6, max: 7 },
            availableDepthCm: { min: 30, max: 50 }
          },
          rootSystem: {
            type: 'taproot',
            depthCm: { min: 40, max: 80 },
            spreadCm: { min: 30, max: 50 }
          },
          watering: { frequency: 'regular' },
          light: { hoursMin: 6, type: 'full_sun' },
          propagation: { methods: {} },
          resources: [{ type: 'image', url: 'https://example.com/tomate.jpg' }]
        }
      };

      const violations = validateSchema('CreatePlant', payload);

      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('UpdatePlant schema', () => {
    it('accepts partial update patch', () => {
      const payload = {
        identity: { name: { primary: 'Tomate nuevo' } },
        traits: { size: { height: { min: 120 } } }
      };

      const violations = validateSchema('UpdatePlant', payload);

      expect(violations).toEqual([]);
    });
  });

  describe('CreateFamily schema', () => {
    it('accepts a valid family creation payload', () => {
      const payload = {
        id: '678efda2-ac3d-4623-81cd-fc1d0ab80315',
        name: 'Solanáceas',
        scientificName: 'Solanaceae',
        slug: 'solanaceae',
        shortDescription: 'Familia agronómica',
        highlights: ['Alcaloides'],
        aliases: ['Solanaceas'],
        extra: { order: 'Solanales', speciesCount: 2700 }
      };

      const violations = validateSchema('CreateFamily', payload);

      expect(violations).toEqual([]);
    });

    it('rejects family creation payload missing required name', () => {
      const payload = {
        id: '678efda2-ac3d-4623-81cd-fc1d0ab80315',
        scientificName: 'Solanaceae',
        slug: 'solanaceae',
        shortDescription: 'Familia agronómica',
        highlights: ['Alcaloides']
      };

      const violations = validateSchema('CreateFamily', payload);

      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateFamily schema', () => {
    it('accepts partial family update payload', () => {
      const payload = {
        name: 'Solanáceas modificadas'
      };

      const violations = validateSchema('UpdateFamily', payload);

      expect(violations).toEqual([]);
    });
  });

  describe('CreateAnomaly schema', () => {
    it('accepts an anomaly creation payload with resources and confusedWith', () => {
      const payload = {
        id: '4f0f9a2e-7a0b-4a0e-9d52-2d6a8d1c0a11',
        slug: 'pulgon-verde',
        name: 'Pulgón verde',
        scientificName: 'Myzus persicae',
        category: 'pest',
        description: 'Insecto chupador de savia.',
        symptoms: ['Hojas enrolladas'],
        resources: [
          {
            type: 'image',
            url: 'https://example.com/pulgon.jpg',
            title: 'Colonia en hoja',
            source: 'INIA'
          },
          {
            type: 'video',
            url: 'https://www.youtube.com/watch?v=pulgon123',
            title: 'Identificación visual'
          },
          {
            type: 'article',
            url: 'https://example.com/articulo',
            title: 'Ficha de manejo'
          }
        ],
        confusedWith: ['pulgon-negro', 'mosca-blanca']
      };

      const violations = validateSchema('CreateAnomaly', payload);

      expect(violations).toEqual([]);
    });

    it('rejects an anomaly creation payload with invalid resource url format', () => {
      const payload = {
        id: '4f0f9a2e-7a0b-4a0e-9d52-2d6a8d1c0a11',
        slug: 'pulgon-verde',
        name: 'Pulgón verde',
        category: 'pest',
        resources: [
          {
            type: 'image',
            url: 'ftp://not-http-url.com/image.jpg'
          }
        ]
      };

      const violations = validateSchema('CreateAnomaly', payload);

      expect(violations.length).toBeGreaterThan(0);
    });

    it('rejects an anomaly creation payload with invalid confusedWith slug format', () => {
      const payload = {
        id: '4f0f9a2e-7a0b-4a0e-9d52-2d6a8d1c0a11',
        slug: 'pulgon-verde',
        name: 'Pulgón verde',
        category: 'pest',
        confusedWith: ['Invalid Slug!']
      };

      const violations = validateSchema('CreateAnomaly', payload);

      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateAnomaly schema', () => {
    it('accepts partial update patch with updated resources and confusedWith', () => {
      const payload = {
        name: 'Pulgón verde común',
        resources: [
          {
            type: 'image',
            url: 'https://example.com/pulgon-nuevo.jpg'
          }
        ],
        confusedWith: ['cochinilla-algodonosa']
      };

      const violations = validateSchema('UpdateAnomaly', payload);

      expect(violations).toEqual([]);
    });

    it('accepts clearing resources and confusedWith with null', () => {
      const payload = {
        resources: null,
        confusedWith: null
      };

      const violations = validateSchema('UpdateAnomaly', payload);

      expect(violations).toEqual([]);
    });
  });

  describe('CreateGardenInput schema', () => {
    it('accepts a valid garden input creation payload with recipe', () => {
      const payload = {
        id: '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90',
        slug: 'purin-ortiga',
        name: 'Purín de ortiga',
        category: 'fertilizer',
        description: 'Extracto fermentado.',
        actions: ['fertilizer', 'biostimulant'],
        activeIngredients: ['Ácido fórmico'],
        nutrients: ['Nitrógeno orgánico'],
        targets: ['Pulgón'],
        recipes: [
          {
            name: 'Purín clásico',
            description: 'Fermentación en agua.',
            ingredients: [{ item: 'Ortiga', quantity: '1 kg' }],
            instructions: ['Macerar 10 días'],
            dosage: {
              method: 'foliar',
              dilution: '1:10',
              frequency: 'Semanal'
            }
          }
        ]
      };

      const violations = validateSchema('CreateGardenInput', payload);

      expect(violations).toEqual([]);
    });

    it('rejects a garden input creation payload with invalid category', () => {
      const payload = {
        id: '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90',
        slug: 'purin-ortiga',
        name: 'Purín de ortiga',
        category: 'invalid_category'
      };

      const violations = validateSchema('CreateGardenInput', payload);

      expect(violations.length).toBeGreaterThan(0);
    });

    it('rejects a garden input creation payload with invalid slug format', () => {
      const payload = {
        id: '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90',
        slug: 'Purin Ortiga!',
        name: 'Purín de ortiga',
        category: 'fertilizer'
      };

      const violations = validateSchema('CreateGardenInput', payload);

      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateGardenInput schema', () => {
    it('accepts partial garden input update payload', () => {
      const payload = {
        name: 'Purín de ortiga concentrado',
        category: 'biostimulant',
        actions: ['biostimulant', 'rooting']
      };

      const violations = validateSchema('UpdateGardenInput', payload);

      expect(violations).toEqual([]);
    });

    it('accepts clearing optional fields with null in garden input update', () => {
      const payload = {
        description: null,
        actions: null,
        recipes: null
      };

      const violations = validateSchema('UpdateGardenInput', payload);

      expect(violations).toEqual([]);
    });
  });

  describe('GardenInput schema', () => {
    it('validates a complete garden input entity model', () => {
      const payload = {
        id: '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90',
        version: 1,
        slug: 'purin-ortiga',
        name: 'Purín de ortiga',
        category: 'fertilizer',
        description: 'Fermentado de ortiga.',
        status: 'active',
        metadata: {
          createdAt: '2026-10-01T10:00:00.000Z',
          createdBy: 'system',
          updatedAt: '2026-10-01T10:00:00.000Z',
          updatedBy: 'system'
        }
      };

      const violations = validateSchema('GardenInput', payload);

      expect(violations).toEqual([]);
    });
  });

  describe('GardenInputListFilter schema', () => {
    it('accepts valid multicriteria filters with in and eq operators', () => {
      const payload = {
        category: { in: 'defense,fertilizer' },
        action: { in: 'fungicide,insecticide' },
        status: { eq: 'active' }
      };

      const violations = validateSchema('GardenInputListFilter', payload);

      expect(violations).toEqual([]);
    });
  });
});
