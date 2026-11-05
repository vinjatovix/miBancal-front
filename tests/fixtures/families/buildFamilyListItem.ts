import type { FamilyListItem } from '../../../src/types/Family';
import { buildFamily } from './buildFamily';

export function buildFamilyListItem(
  overrides: Partial<FamilyListItem> = {}
): FamilyListItem {
  const { id, name, scientificName } = buildFamily();
  return { id, name, scientificName, ...overrides };
}
