import type { FamilyPlantItem } from '../../../src/types/Plants/Plant';
import { buildPlant } from './buildPlant';

export function buildFamilyPlantItem(
  overrides: Partial<FamilyPlantItem> = {}
): FamilyPlantItem {
  const { id, identity } = buildPlant();
  return { id, identity, status: 'ACTIVE', ...overrides };
}
