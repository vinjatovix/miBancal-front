import type {
  PlantEcologicalTraits,
  PlantListItem
} from '../../../src/types/Plants/Plant';
import { buildPlant } from './buildPlant';

export function buildPlantListItem(
  overrides: Partial<PlantListItem> = {}
): PlantListItem {
  const { id, identity, traits, image, likesCount } = buildPlant();
  return {
    id,
    identity,
    traits,
    image,
    likesCount,
    status: 'ACTIVE',
    ...overrides
  };
}

export function buildPlantListItemWithEcological(
  ecological: PlantEcologicalTraits | undefined
): PlantListItem {
  const item = buildPlantListItem();
  return { ...item, traits: { ...item.traits, ecological } };
}
