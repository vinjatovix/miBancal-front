import { describe, expect, it } from 'vitest';
import {
  buildRelationScopes,
  getAvailableCompanionScopes,
  INITIAL_COMPANION_DRAFT,
  isCompanionDraftComplete,
  type CompanionDraft
} from '../../../src/components/plants/PlantRelationFormModal/plantRelationForm.utils';
import type { PlantListItem } from '../../../src/types/Plants/Plant';

const BASE_ID = '11111111-1111-4111-8111-111111111111';
const COMPANION_ID = '22222222-2222-4222-8222-222222222222';
const FAMILY_ID = '33333333-3333-4333-8333-333333333333';

const companionPlant = { id: COMPANION_ID } as PlantListItem;

function draft(overrides: Partial<CompanionDraft>): CompanionDraft {
  return { ...INITIAL_COMPANION_DRAFT, ...overrides };
}

describe('getAvailableCompanionScopes', () => {
  it('offers all only when the base plant gives the effect', () => {
    expect(getAvailableCompanionScopes('giving')).toContain('all');
    expect(getAvailableCompanionScopes('receiving')).not.toContain('all');
  });
});

describe('isCompanionDraftComplete', () => {
  it.each([
    [draft({ scope: 'plant' }), false],
    [draft({ scope: 'plant', plant: companionPlant }), true],
    [draft({ scope: 'genus', genus: 'solanum' }), false],
    [draft({ scope: 'genus', genus: 'S' }), false],
    [draft({ scope: 'genus', genus: ' Solanum ' }), true],
    [draft({ scope: 'family' }), false],
    [draft({ scope: 'family', familyId: FAMILY_ID }), true],
    [draft({ scope: 'all' }), true]
  ])('evaluates %o as %s', (value, expected) => {
    expect(isCompanionDraftComplete(value)).toBe(expected);
  });
});

describe('buildRelationScopes', () => {
  it('puts the base plant as source when giving', () => {
    const scopes = buildRelationScopes(
      'giving',
      BASE_ID,
      draft({ scope: 'genus', genus: 'Solanum' })
    );

    expect(scopes).toEqual({
      source: { scope: 'plant', value: BASE_ID },
      target: { scope: 'genus', value: 'Solanum' }
    });
  });

  it('puts the base plant as target when receiving', () => {
    const scopes = buildRelationScopes(
      'receiving',
      BASE_ID,
      draft({ scope: 'family', familyId: FAMILY_ID })
    );

    expect(scopes).toEqual({
      source: { scope: 'family', value: FAMILY_ID },
      target: { scope: 'plant', value: BASE_ID }
    });
  });

  it('omits value for target scope all', () => {
    const scopes = buildRelationScopes(
      'giving',
      BASE_ID,
      draft({ scope: 'all' })
    );

    expect(scopes?.target).toEqual({ scope: 'all' });
  });

  it('rejects all as source', () => {
    expect(
      buildRelationScopes('receiving', BASE_ID, draft({ scope: 'all' }))
    ).toBeNull();
  });

  it('rejects the base plant as its own companion', () => {
    expect(
      buildRelationScopes(
        'giving',
        BASE_ID,
        draft({ plant: { id: BASE_ID } as PlantListItem })
      )
    ).toBeNull();
  });
});
