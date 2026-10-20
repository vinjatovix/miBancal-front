import { describe, expect, it } from 'vitest';

import { validateRequest, validateSchema } from './openApiContract';

describe('OpenAPI catalog mutations contract', () => {
  it.each([
    ['post', '/api/v1/plants'],
    ['patch', '/api/v1/plants/678efda2-ac3d-4623-81cd-fc1d0ab80315'],
    ['post', '/api/v1/families'],
    ['patch', '/api/v1/families/solanaceae'],
    ['patch', '/api/v1/families/678efda2-ac3d-4623-81cd-fc1d0ab80315']
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
});
