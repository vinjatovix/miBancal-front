import { describe, expect, it } from 'vitest';
import {
  buildPaginatedPlantRelationsResponse,
  buildPlantRelation,
  buildPlantSummary
} from '../fixtures/plantRelations/buildPlantRelation';
import { validateRequest, validateSchema } from './openApiContract';

const PLANT_ID = '11111111-1111-4111-8111-111111111111';
const TARGET_PLANT_ID = '22222222-2222-4222-8222-222222222222';
const RELATION_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('OpenAPI plant relations contract', () => {
  it.each([
    ['get', '/api/v1/plant-relations'],
    ['get', `/api/v1/plant-relations?filter[plantId][eq]=${PLANT_ID}`],
    ['get', `/api/v1/plant-relations?filter[sourcePlantId][eq]=${PLANT_ID}`],
    [
      'get',
      `/api/v1/plant-relations?filter[targetPlantId][eq]=${TARGET_PLANT_ID}`
    ],
    ['get', `/api/v1/plant-relations?filter[appliesToPlantId][eq]=${PLANT_ID}`],
    [
      'get',
      `/api/v1/plant-relations?filter[appliesToPlantId][eq]=${PLANT_ID}&filter[type][eq]=beneficial&include=sourcePlant,targetPlant,sourceFamily,targetFamily&pagination[page]=1&pagination[limit]=100`
    ],
    ['get', `/api/v1/plant-relations?filter[sourceScope][eq]=genus`],
    ['get', `/api/v1/plant-relations?filter[targetScope][eq]=all`],
    ['get', `/api/v1/plant-relations?filter[type][eq]=beneficial`],
    ['get', `/api/v1/plant-relations?filter[type][eq]=detrimental`],
    ['get', `/api/v1/plant-relations?filter[mechanism][eq]=pest_repellent`],
    ['get', `/api/v1/plant-relations?include=sourcePlant,targetPlant`],
    ['get', `/api/v1/plant-relations?pagination[page]=1&pagination[limit]=25`],
    ['get', `/api/v1/plant-relations?sort=createdAt:desc`],
    ['get', `/api/v1/plant-relations/${RELATION_ID}`]
  ] as const)('validates endpoint route %s %s', (method, path) => {
    const violations = validateRequest(method, path);

    expect(violations).toEqual([]);
  });

  describe('schema validation', () => {
    it('validates PlantSummary schema with valid fixture', () => {
      const summary = buildPlantSummary();

      const violations = validateSchema('PlantSummary', summary);

      expect(violations).toEqual([]);
    });

    it('validates a scoped PlantRelation with role and appliesVia', () => {
      const relation = JSON.parse(
        JSON.stringify(
          buildPlantRelation({
            source: { scope: 'genus', value: 'Solanum' },
            target: { scope: 'plant', value: TARGET_PLANT_ID },
            sourcePlantId: undefined,
            sourcePlant: undefined,
            appliesVia: 'plant',
            role: 'target'
          })
        )
      );

      const violations = validateSchema('PlantRelation', relation);

      expect(violations).toEqual([]);
    });

    it('validates PlantRelation schema with valid fixture', () => {
      const relation = JSON.parse(JSON.stringify(buildPlantRelation()));

      const violations = validateSchema('PlantRelation', relation);

      expect(violations).toEqual([]);
    });

    it('validates PaginatedPlantRelationsResponse schema with valid fixture', () => {
      const response = JSON.parse(
        JSON.stringify(buildPaginatedPlantRelationsResponse())
      );

      const violations = validateSchema(
        'PaginatedPlantRelationsResponse',
        response
      );

      expect(violations).toEqual([]);
    });

    it('validates CreatePlantRelation schema when client assigns id', () => {
      const payload = {
        id: '0192e201-0000-7000-8000-000000000001',
        sourcePlantId: PLANT_ID,
        targetPlantId: TARGET_PLANT_ID,
        type: 'beneficial',
        mechanism: 'pest_repellent',
        strength: 4,
        proximity: { minDistanceCm: 0, maxDistanceCm: 50 },
        reason:
          'El aroma de la albahaca enmascara los compuestos volátiles del tomate.'
      };

      const violations = validateSchema('CreatePlantRelation', payload);

      expect(violations).toEqual([]);
    });

    it.each([
      [
        'genus to family',
        {
          source: { scope: 'genus', value: 'Solanum' },
          target: { scope: 'family', value: TARGET_PLANT_ID }
        }
      ],
      [
        'plant to all',
        {
          source: { scope: 'plant', value: PLANT_ID },
          target: { scope: 'all' }
        }
      ]
    ])('validates CreatePlantRelation with scoped %s', (_label, scopes) => {
      const payload = {
        id: '0192e201-0000-7000-8000-000000000001',
        ...scopes,
        type: 'detrimental',
        mechanism: 'allelopathy',
        strength: 3,
        proximity: { minDistanceCm: 0, maxDistanceCm: null },
        reason: 'Inhibe el crecimiento de las plantas cercanas.'
      };

      const violations = validateSchema('CreatePlantRelation', payload);

      expect(violations).toEqual([]);
    });

    it('reports violation when CreatePlantRelation is missing client-assigned id', () => {
      const payloadWithoutId = {
        sourcePlantId: PLANT_ID,
        targetPlantId: TARGET_PLANT_ID,
        type: 'beneficial',
        mechanism: 'pest_repellent',
        strength: 4,
        proximity: { minDistanceCm: 0, maxDistanceCm: 50 },
        reason:
          'El aroma de la albahaca enmascara los compuestos volátiles del tomate.'
      };

      const violations = validateSchema(
        'CreatePlantRelation',
        payloadWithoutId
      );

      expect(violations).not.toEqual([]);
      expect(
        violations.some((v) =>
          v.message.includes("must have required property 'id'")
        )
      ).toBe(true);
    });
  });
});
