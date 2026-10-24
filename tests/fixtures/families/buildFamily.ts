import type { Family } from '../../../src/types/Family';
import { listFamiliesResponse } from './listFamilies';

export function buildFamily(overrides: Partial<Family> = {}): Family {
  return { ...listFamiliesResponse.data[0], ...overrides };
}
