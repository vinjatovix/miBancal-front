import { calculateVitalRadius } from '../../../components/beds/visualizer/utils/spatialCollisions';
import type { PlacingPlant } from '../../../components/beds/visualizer/hooks/useCanvasPlacement';
import type { PlantListItem } from '../../../types/Plants/Plant';
import type { PlantPlacementInput } from '../../../types/PlantInstance/brushSelectionTypes';

export function toPlacementInput(plant: PlantListItem): PlantPlacementInput {
  return {
    plantId: plant.id,
    commonName: plant.identity.name.primary,
    scientificName: plant.identity.scientificName,
    spacingCmMin: plant.traits.spacingCm?.min
  };
}

export function toPlacingPlant(plant: PlantListItem): PlacingPlant {
  return {
    commonName: plant.identity.name.primary,
    vitalRadius: calculateVitalRadius(plant.traits.spacingCm?.min)
  };
}
