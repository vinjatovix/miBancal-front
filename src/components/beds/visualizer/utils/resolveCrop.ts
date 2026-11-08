import type { PlantInstanceResponse } from '../../../../types/PlantInstance/PlantInstance';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import { calculateVitalRadius } from './spatialCollisions';

export interface CropPlantInfo {
  readonly identity: {
    readonly name: { readonly primary: string };
    readonly scientificName?: string;
  };
  readonly traits: { readonly spacingCm?: { readonly min?: number } };
}

export function resolveCrop(
  instance: PlantInstanceResponse,
  plant: CropPlantInfo | undefined,
  etag?: string
): CropPlacementItem {
  const spacingMin = plant?.traits.spacingCm?.min;
  return {
    id: instance.id,
    bedId: instance.bedId,
    plantId: instance.plantId,
    commonName: plant?.identity.name.primary ?? instance.plantId,
    scientificName: plant?.identity.scientificName,
    position: instance.position ?? { x: 0, y: 0 },
    vitalRadius: calculateVitalRadius(spacingMin),
    growthStatus: instance.growthStatus,
    etag,
    version: instance.version
  };
}
