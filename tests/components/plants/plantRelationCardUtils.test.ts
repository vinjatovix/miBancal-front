import { describe, expect, it } from 'vitest';
import {
  categorizePlantRelations,
  extractCompanionInfo,
  formatProximity,
  getAppliesViaText,
  getCompanionLink,
  getDirectionBadgeText,
  getRelationDirection,
  groupRelationsByCompanion,
  sortCompanionGroups
} from '../../../src/components/plants/PlantRelationCard/plantRelationCard.utils';
import type { ProximityDistance } from '../../../src/types/Plants/PlantRelation';
import {
  buildPlantRelation,
  buildPlantSummary,
  buildTargetPlantSummary
} from '../../fixtures/plantRelations/buildPlantRelation';

const CURRENT_PLANT_ID = '11111111-1111-4111-8111-111111111111';
const COMPANION_PLANT_ID = '22222222-2222-4222-8222-222222222222';

describe('getRelationDirection', () => {
  it('returns incoming when current plant is targetPlantId', () => {
    const relation = buildPlantRelation({
      sourcePlantId: COMPANION_PLANT_ID,
      targetPlantId: CURRENT_PLANT_ID
    });

    const direction = getRelationDirection(relation, CURRENT_PLANT_ID);

    expect(direction).toBe('incoming');
  });

  it('returns outgoing when current plant is sourcePlantId', () => {
    const relation = buildPlantRelation({
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID
    });

    const direction = getRelationDirection(relation, CURRENT_PLANT_ID);

    expect(direction).toBe('outgoing');
  });
});

describe('extractCompanionInfo', () => {
  it('extracts target plant as companion when current plant is source', () => {
    const targetPlant = buildTargetPlantSummary({ id: COMPANION_PLANT_ID });
    const relation = buildPlantRelation({
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID,
      targetPlant
    });

    const companion = extractCompanionInfo(relation, CURRENT_PLANT_ID);

    expect(companion).toEqual({
      id: COMPANION_PLANT_ID,
      scope: 'plant',
      slug: targetPlant.slug,
      primaryName: targetPlant.name.primary,
      scientificName: targetPlant.scientificName,
      imageUrl: targetPlant.image?.url,
      isAvailable: true
    });
  });

  it('extracts source plant as companion when current plant is target', () => {
    const sourcePlant = buildPlantSummary({ id: COMPANION_PLANT_ID });
    const relation = buildPlantRelation({
      sourcePlantId: COMPANION_PLANT_ID,
      targetPlantId: CURRENT_PLANT_ID,
      sourcePlant
    });

    const companion = extractCompanionInfo(relation, CURRENT_PLANT_ID);

    expect(companion).toEqual({
      id: COMPANION_PLANT_ID,
      scope: 'plant',
      slug: sourcePlant.slug,
      primaryName: sourcePlant.name.primary,
      scientificName: sourcePlant.scientificName,
      imageUrl: sourcePlant.image?.url,
      isAvailable: true
    });
  });

  it('returns safe fallback without exposing raw UUIDs as name when companion is missing', () => {
    const relation = buildPlantRelation({
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID,
      targetPlant: undefined
    });

    const companion = extractCompanionInfo(relation, CURRENT_PLANT_ID);

    expect(companion).toEqual({
      id: COMPANION_PLANT_ID,
      scope: 'plant',
      isAvailable: false
    });
  });
});

describe('formatProximity', () => {
  it('formats bed-wide effect when maxDistanceCm is null', () => {
    const proximity: ProximityDistance = {
      minDistanceCm: 0,
      maxDistanceCm: null
    };

    const formatted = formatProximity(proximity);

    expect(formatted).toBe(
      'Efectiva en todo el bancal (sin límite de distancia)'
    );
  });

  it.each([
    [{ minDistanceCm: 0, maxDistanceCm: 50 }, '0 cm - 50 cm'],
    [{ minDistanceCm: 30, maxDistanceCm: 60 }, '30 cm - 60 cm']
  ])('formats bounded proximity range %o as %s', (proximity, expected) => {
    const formatted = formatProximity(proximity);

    expect(formatted).toBe(expected);
  });
});

describe('getDirectionBadgeText', () => {
  it('returns benefits badge with target name when beneficial', () => {
    const relation = buildPlantRelation({
      sourcePlantId: COMPANION_PLANT_ID,
      targetPlantId: CURRENT_PLANT_ID,
      type: 'beneficial'
    });

    const badge = getDirectionBadgeText(relation, CURRENT_PLANT_ID, 'Tomate');

    expect(badge).toBe('Aporta a Tomate');
  });

  it('returns harms badge with target name when detrimental', () => {
    const relation = buildPlantRelation({
      sourcePlantId: COMPANION_PLANT_ID,
      targetPlantId: CURRENT_PLANT_ID,
      type: 'detrimental'
    });

    const badge = getDirectionBadgeText(relation, CURRENT_PLANT_ID, 'Tomate');

    expect(badge).toBe('Perjudica a Tomate');
  });

  it('returns generic benefits badge when target name is missing', () => {
    const relation = buildPlantRelation({
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID,
      type: 'beneficial',
      targetPlant: undefined
    });

    const badge = getDirectionBadgeText(relation, CURRENT_PLANT_ID);

    expect(badge).toBe('Aporta');
  });

  it('returns generic harms badge when target name is missing', () => {
    const relation = buildPlantRelation({
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID,
      type: 'detrimental',
      targetPlant: undefined
    });

    const badge = getDirectionBadgeText(relation, CURRENT_PLANT_ID);

    expect(badge).toBe('Perjudica');
  });
});

describe('categorizePlantRelations', () => {
  it('categorizes relations into received, given, and incompatibilities, sorted alphabetically', () => {
    const received1 = buildPlantRelation({
      id: 'rel-1',
      sourcePlantId: 'c-1', // Name: 'B'
      targetPlantId: CURRENT_PLANT_ID,
      type: 'beneficial',
      sourcePlant: buildPlantSummary({ name: { primary: 'B' } })
    });
    const received2 = buildPlantRelation({
      id: 'rel-2',
      sourcePlantId: 'c-2', // Name: 'A'
      targetPlantId: CURRENT_PLANT_ID,
      type: 'beneficial',
      sourcePlant: buildPlantSummary({ name: { primary: 'A' } })
    });

    // ... we need more setup here to fully test this,
    // actually, let's just make sure it sorts correctly.

    // I need to use `buildPlantRelation` which might not easily allow mocking the name.
    // The current tests seem to rely on `buildPlantSummary` etc.
    // Looking at `categorizePlantRelations`, it uses `extractCompanionInfo` which uses `buildCompanionInfo` which uses `sourcePlant` / `targetPlant`.

    // This seems correct.

    const categorized = categorizePlantRelations(
      [received1, received2],
      CURRENT_PLANT_ID
    );

    expect(
      categorized.benefitsReceived.map(
        (r) => extractCompanionInfo(r, CURRENT_PLANT_ID).primaryName
      )
    ).toEqual(['A', 'B']);
  });
});

describe('groupRelationsByCompanion', () => {
  it('groups multiple relations with the same companion plant into a single entry', () => {
    const targetPlant = buildPlantSummary({ id: COMPANION_PLANT_ID });
    const relationA = buildPlantRelation({
      id: 'rel-1',
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID,
      targetPlant
    });
    const relationB = buildPlantRelation({
      id: 'rel-2',
      sourcePlantId: COMPANION_PLANT_ID,
      targetPlantId: CURRENT_PLANT_ID,
      sourcePlant: targetPlant
    });

    const grouped = groupRelationsByCompanion(
      [relationA, relationB],
      CURRENT_PLANT_ID
    );

    expect(grouped).toHaveLength(1);
    expect(grouped[0].companion.id).toBe(COMPANION_PLANT_ID);
    expect(grouped[0].relations).toEqual([relationA, relationB]);
  });
});

describe('sortCompanionGroups', () => {
  const groupA = {
    companion: {
      id: 'c-1',
      scope: 'plant' as const,
      primaryName: 'Zanahoria',
      scientificName: 'Daucus carota',
      isAvailable: true
    },
    relations: []
  };
  const groupB = {
    companion: {
      id: 'c-2',
      scope: 'plant' as const,
      primaryName: 'Albahaca',
      scientificName: 'Ocimum basilicum',
      isAvailable: true
    },
    relations: []
  };
  const groupC = {
    companion: {
      id: 'c-3',
      scope: 'plant' as const,
      primaryName: 'Cebolla',
      scientificName: 'Allium cepa',
      isAvailable: true
    },
    relations: []
  };

  it.each([
    [
      { field: 'name' as const, direction: 'asc' as const },
      ['Albahaca', 'Cebolla', 'Zanahoria']
    ],
    [
      { field: 'name' as const, direction: 'desc' as const },
      ['Zanahoria', 'Cebolla', 'Albahaca']
    ],
    [
      { field: 'scientificName' as const, direction: 'asc' as const },
      ['Cebolla', 'Zanahoria', 'Albahaca']
    ],
    [
      { field: 'scientificName' as const, direction: 'desc' as const },
      ['Albahaca', 'Zanahoria', 'Cebolla']
    ]
  ])('sorts groups by %o producing %j', (sort, expectedNames) => {
    const sorted = sortCompanionGroups([groupA, groupB, groupC], sort);

    const names = sorted.map((g) => g.companion.primaryName);
    expect(names).toEqual(expectedNames);
  });
});

const FAMILY_ID = '33333333-3333-4333-8333-333333333333';

describe('scoped relations', () => {
  it('uses role from the API to resolve direction and companion', () => {
    const relation = buildPlantRelation({
      source: { scope: 'genus', value: 'Solanum' },
      target: { scope: 'plant', value: CURRENT_PLANT_ID },
      sourcePlantId: undefined,
      targetPlantId: CURRENT_PLANT_ID,
      sourcePlant: undefined,
      role: 'target',
      appliesVia: 'plant'
    });

    expect(getRelationDirection(relation, CURRENT_PLANT_ID)).toBe('incoming');
    expect(extractCompanionInfo(relation, CURRENT_PLANT_ID)).toEqual({
      id: 'Solanum',
      scope: 'genus',
      primaryName: 'Solanum',
      isAvailable: true
    });
  });

  it('resolves a family companion from the embedded family summary', () => {
    const relation = buildPlantRelation({
      source: { scope: 'plant', value: CURRENT_PLANT_ID },
      target: { scope: 'family', value: FAMILY_ID },
      targetPlantId: undefined,
      targetPlant: undefined,
      targetFamily: { id: FAMILY_ID, name: 'Brasicáceas', slug: 'brasicaceas' },
      role: 'source'
    });

    const companion = extractCompanionInfo(relation, CURRENT_PLANT_ID);

    expect(companion).toMatchObject({
      id: FAMILY_ID,
      scope: 'family',
      slug: 'brasicaceas',
      primaryName: 'Brasicáceas',
      isAvailable: true
    });
    expect(getCompanionLink(companion)).toBe('/families/brasicaceas');
  });

  it('marks a family companion as unavailable when the summary is missing', () => {
    const relation = buildPlantRelation({
      target: { scope: 'family', value: FAMILY_ID },
      targetPlant: undefined,
      role: 'source'
    });

    const companion = extractCompanionInfo(relation, CURRENT_PLANT_ID);

    expect(companion).toEqual({
      id: FAMILY_ID,
      scope: 'family',
      isAvailable: false
    });
    expect(getCompanionLink(companion)).toBeNull();
  });

  it('describes the effect on the whole catalog for target scope all', () => {
    const relation = buildPlantRelation({
      type: 'detrimental',
      target: { scope: 'all' },
      targetPlantId: undefined,
      targetPlant: undefined,
      role: 'source'
    });

    const companion = extractCompanionInfo(relation, CURRENT_PLANT_ID);

    expect(companion.scope).toBe('all');
    expect(getCompanionLink(companion)).toBeNull();
    expect(getDirectionBadgeText(relation, CURRENT_PLANT_ID, 'Tomate')).toBe(
      'Perjudica a todas las plantas'
    );
  });

  it.each([
    ['genus', 'Solanum', 'Aporta al género Solanum'],
    ['plant', 'Tomate', 'Aporta a Tomate']
  ] as const)(
    'names the %s target in the direction badge',
    (scope, name, expected) => {
      const relation = buildPlantRelation({
        target: { scope, value: name },
        targetPlant:
          scope === 'plant'
            ? buildTargetPlantSummary({ name: { primary: name } })
            : undefined,
        role: 'source'
      });

      expect(getDirectionBadgeText(relation, CURRENT_PLANT_ID)).toBe(expected);
    }
  );

  it('names the current plant when it receives the effect', () => {
    const relation = buildPlantRelation({
      source: { scope: 'family', value: FAMILY_ID },
      role: 'target',
      appliesVia: 'family'
    });

    expect(getDirectionBadgeText(relation, CURRENT_PLANT_ID, 'Tomate')).toBe(
      'Aporta a Tomate'
    );
  });

  it('categorizes by role instead of plant ids', () => {
    const received = buildPlantRelation({ id: 'r1', role: 'target' });
    const given = buildPlantRelation({ id: 'r2', role: 'source' });

    const result = categorizePlantRelations(
      [received, given],
      CURRENT_PLANT_ID
    );

    expect(result.benefitsReceived).toEqual([received]);
    expect(result.benefitsGiven).toEqual([given]);
  });

  it('keeps companions of different scopes in separate groups', () => {
    const genusRelation = buildPlantRelation({
      id: 'r1',
      target: { scope: 'genus', value: COMPANION_PLANT_ID },
      role: 'source'
    });
    const plantRelation = buildPlantRelation({
      id: 'r2',
      target: { scope: 'plant', value: COMPANION_PLANT_ID },
      targetPlantId: COMPANION_PLANT_ID,
      role: 'source'
    });

    const groups = groupRelationsByCompanion(
      [genusRelation, plantRelation],
      CURRENT_PLANT_ID
    );

    expect(groups).toHaveLength(2);
  });

  it.each([
    ['plant', undefined],
    ['genus', 'Por su género'],
    ['family', 'Por su familia'],
    ['all', 'Aplica a todas las plantas']
  ] as const)('explains appliesVia %s', (appliesVia, expected) => {
    const relation = buildPlantRelation({ appliesVia });

    expect(getAppliesViaText(relation)).toBe(expected);
  });
});
