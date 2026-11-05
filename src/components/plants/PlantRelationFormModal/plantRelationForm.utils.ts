import type { PlantListItem } from '../../../types/Plants/Plant';
import type {
  RelationSourceScope,
  RelationTargetScope,
  RelationTargetScopeType
} from '../../../types/Plants/PlantRelation';

export type RelationFormDirection = 'giving' | 'receiving';

export interface CompanionDraft {
  readonly scope: RelationTargetScopeType;
  readonly plant: PlantListItem | null;
  readonly genus: string;
  readonly familyId: string;
}

export const INITIAL_COMPANION_DRAFT: CompanionDraft = {
  scope: 'plant',
  plant: null,
  genus: '',
  familyId: ''
};

export const GENUS_PATTERN = /^[A-Z][a-zA-Z]{1,49}$/;

export function getAvailableCompanionScopes(
  direction: RelationFormDirection
): readonly RelationTargetScopeType[] {
  return direction === 'giving'
    ? ['plant', 'genus', 'family', 'all']
    : ['plant', 'genus', 'family'];
}

export function isCompanionDraftComplete(draft: CompanionDraft): boolean {
  switch (draft.scope) {
    case 'plant':
      return draft.plant !== null;
    case 'genus':
      return GENUS_PATTERN.test(draft.genus.trim());
    case 'family':
      return draft.familyId !== '';
    case 'all':
      return true;
  }
}

function toCompanionScope(draft: CompanionDraft): RelationTargetScope {
  switch (draft.scope) {
    case 'plant':
      return { scope: 'plant', value: draft.plant?.id ?? '' };
    case 'genus':
      return { scope: 'genus', value: draft.genus.trim() };
    case 'family':
      return { scope: 'family', value: draft.familyId };
    case 'all':
      return { scope: 'all' };
  }
}

export function buildRelationScopes(
  direction: RelationFormDirection,
  basePlantId: string,
  companion: CompanionDraft
): { source: RelationSourceScope; target: RelationTargetScope } | null {
  if (!isCompanionDraftComplete(companion)) return null;
  if (companion.scope === 'plant' && companion.plant?.id === basePlantId) {
    return null;
  }

  const basePlant = { scope: 'plant', value: basePlantId } as const;
  const companionScope = toCompanionScope(companion);

  if (direction === 'giving') {
    return { source: basePlant, target: companionScope };
  }

  if (companionScope.scope === 'all') return null;

  return {
    source: {
      scope: companionScope.scope,
      value: companionScope.value ?? ''
    },
    target: basePlant
  };
}
