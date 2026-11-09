import { useMemo } from 'react';
import type {
  AssociationCropPoint,
  CropAssociationEngineOptions
} from '../../../../components/beds/associations/types/cropAssociationTypes';
import { transformLocalToGlobal } from '../../../../components/beds/associations/utils/cropAssociationGeometry';
import type { ResolvedBed } from '../../../../components/beds/layout/utils/layoutTypes';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import {
  type BedCropAssociationsResult,
  useBedCropAssociations
} from '../../../beds/hooks/useBedCropAssociations';

export function useLocationCropAssociations(
  beds: readonly ResolvedBed[],
  cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>,
  options?: CropAssociationEngineOptions
): BedCropAssociationsResult {
  const globalCropPoints = useMemo(() => {
    const points: AssociationCropPoint[] = [];

    for (const bed of beds) {
      const crops = cropsByBed.get(bed.id) ?? [];
      for (const crop of crops) {
        const globalPos = transformLocalToGlobal(
          crop.position.x,
          crop.position.y,
          bed.position.x,
          bed.position.y,
          bed.rotation
        );

        points.push({
          id: crop.id,
          plantId: crop.plantId,
          bedId: bed.id,
          commonName: crop.commonName,
          scientificName: crop.scientificName,
          familyId: crop.familyId,
          genus: crop.genus,
          x: globalPos.x,
          y: globalPos.y,
          vitalRadius: crop.vitalRadius
        });
      }
    }

    return points;
  }, [beds, cropsByBed]);

  return useBedCropAssociations(globalCropPoints, options);
}
