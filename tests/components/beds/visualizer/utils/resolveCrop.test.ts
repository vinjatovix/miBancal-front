import { describe, expect, it } from 'vitest';
import {
  resolveCrop,
  type CropPlantInfo
} from '../../../../../src/components/beds/visualizer/utils/resolveCrop';
import type { PlantInstanceResponse } from '../../../../../src/types/PlantInstance/PlantInstance';

function buildInstance(
  overrides: Partial<PlantInstanceResponse> = {}
): PlantInstanceResponse {
  return {
    id: 'instance-1',
    userId: 'user-1',
    bedId: 'bed-1',
    plantId: 'plant-tomato',
    position: { x: 10, y: 20 },
    growthStatus: 'planted',
    instanceStatus: 'active',
    plantedAt: '2026-01-01T00:00:00.000Z',
    metadata: {
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      createdBy: 'user-1',
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedBy: 'user-1'
    },
    version: 1,
    ...overrides
  };
}

describe('resolveCrop', () => {
  it('maps familyId when family is a resolved summary object', () => {
    const plant: CropPlantInfo = {
      identity: {
        name: { primary: 'Tomate' },
        scientificName: 'Solanum lycopersicum',
        genus: 'Solanum',
        family: { id: 'fam-solanaceae', name: 'Solanáceas', slug: 'solanaceae' }
      },
      traits: { spacingCm: { min: 40 } }
    };

    const crop = resolveCrop(buildInstance(), plant);

    expect(crop.familyId).toBe('fam-solanaceae');
    expect(crop.familyName).toBe('Solanáceas');
    expect(crop.genus).toBe('Solanum');
  });

  it('maps familyId but leaves familyName undefined for a bare uuid string', () => {
    const plant: CropPlantInfo = {
      identity: {
        name: { primary: 'Tomate' },
        genus: 'Solanum',
        family: 'fam-solanaceae'
      },
      traits: { spacingCm: { min: 40 } }
    };

    const crop = resolveCrop(buildInstance(), plant);

    expect(crop.familyId).toBe('fam-solanaceae');
    expect(crop.familyName).toBeUndefined();
  });

  it('leaves familyId, familyName and genus undefined when plant data is missing', () => {
    const crop = resolveCrop(buildInstance(), undefined);

    expect(crop.familyId).toBeUndefined();
    expect(crop.familyName).toBeUndefined();
    expect(crop.genus).toBeUndefined();
    expect(crop.commonName).toBe('plant-tomato');
  });
});
