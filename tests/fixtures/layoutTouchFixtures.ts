import type { ResolvedBed } from '../../src/components/beds/layout/utils/layoutTypes';
import type { CropPlacementItem } from '../../src/types/PlantInstance/plantPlacementTypes';

export function buildResolvedBed(
  overrides: Partial<ResolvedBed> = {}
): ResolvedBed {
  return {
    id: 'bed-1',
    name: 'Bancal Tomates',
    width: 120,
    height: 240,
    position: { x: 300, y: 400 },
    rotation: 0,
    ...overrides
  };
}

export function buildCropPlacement(
  overrides: Partial<CropPlacementItem> = {}
): CropPlacementItem {
  return {
    id: 'crop-1',
    bedId: 'bed-1',
    plantId: 'plant-tomato',
    commonName: 'Tomate',
    scientificName: 'Solanum lycopersicum',
    position: { x: 60, y: 120 },
    vitalRadius: 20,
    growthStatus: 'planted',
    version: 1,
    ...overrides
  };
}

export const overlappingBed: ResolvedBed = buildResolvedBed({
  id: 'bed-overlap',
  width: 200,
  height: 200,
  position: { x: 0, y: 0 },
  rotation: 0
});

export const overlappingCrops: readonly CropPlacementItem[] = [
  buildCropPlacement({
    id: 'crop-a',
    bedId: 'bed-overlap',
    commonName: 'Tomate A',
    position: { x: 100, y: 100 },
    vitalRadius: 30,
    version: 1
  }),
  buildCropPlacement({
    id: 'crop-b',
    bedId: 'bed-overlap',
    commonName: 'Tomate B',
    position: { x: 118, y: 108 },
    vitalRadius: 30,
    version: 1
  }),
  buildCropPlacement({
    id: 'crop-c',
    bedId: 'bed-overlap',
    commonName: 'Tomate C',
    position: { x: 92, y: 122 },
    vitalRadius: 28,
    version: 1
  })
];

export function buildCropsByBed(
  crops: readonly CropPlacementItem[] = overlappingCrops
): ReadonlyMap<string, readonly CropPlacementItem[]> {
  const grouped = new Map<string, CropPlacementItem[]>();
  for (const crop of crops) {
    const bucket = grouped.get(crop.bedId) ?? [];
    bucket.push(crop);
    grouped.set(crop.bedId, bucket);
  }
  return grouped;
}
