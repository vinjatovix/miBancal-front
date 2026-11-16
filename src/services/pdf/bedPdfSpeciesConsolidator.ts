import type {
  CropPlanMarker,
  SpeciesSummaryItem
} from '../../types/Export/BedPdfExport';
import type { CropPlacementItem } from '../../types/PlantInstance/plantPlacementTypes';

export interface BedSpeciesConsolidation {
  readonly summary: readonly SpeciesSummaryItem[];
  readonly markers: readonly CropPlanMarker[];
}

interface SpeciesAccumulator {
  readonly key: string;
  readonly plantId: string;
  readonly commonName: string;
  readonly scientificName: string | null;
  readonly familyName: string | null;
  count: number;
}

function toSummaryItem(entry: SpeciesAccumulator): SpeciesSummaryItem {
  return {
    key: entry.key,
    plantId: entry.plantId,
    commonName: entry.commonName,
    scientificName: entry.scientificName,
    familyName: entry.familyName,
    count: entry.count
  };
}

export function consolidateBedSpecies(
  crops: readonly CropPlacementItem[]
): BedSpeciesConsolidation {
  const speciesByPlantId = new Map<string, SpeciesAccumulator>();
  const markers: CropPlanMarker[] = [];

  for (const crop of crops) {
    let species = speciesByPlantId.get(crop.plantId);
    if (!species) {
      species = {
        key: String(speciesByPlantId.size + 1),
        plantId: crop.plantId,
        commonName: crop.commonName,
        scientificName: crop.scientificName ?? null,
        familyName: crop.familyName ?? null,
        count: 0
      };
      speciesByPlantId.set(crop.plantId, species);
    }
    species.count += 1;
    markers.push({
      cropId: crop.id,
      speciesKey: species.key,
      xCm: crop.position.x,
      yCm: crop.position.y,
      vitalRadiusCm: crop.vitalRadius,
      commonName: crop.commonName
    });
  }

  return {
    summary: [...speciesByPlantId.values()].map(toSummaryItem),
    markers
  };
}
