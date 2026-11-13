import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import type {
  ActiveAssociationLink,
  AssociationCropPoint,
  BotanicalRelationIndex,
  CropAssociationEngineOptions
} from '../../../components/beds/associations/types/cropAssociationTypes';
import { buildBotanicalRelationIndex } from '../../../components/beds/associations/utils/botanicalRelationIndex';
import { computeActiveAssociationLinks } from '../../../components/beds/associations/utils/cropAssociationGeometry';
import { getPlantRelations } from '../../../services/plantRelations.service';
import { plantRelationKeys } from '../../../shared/reactQuery/plantRelationKeys';
import type { CropPlacementItem } from '../../../types/PlantInstance/plantPlacementTypes';
import type { PlantRelation } from '../../../types/Plants/PlantRelation';

export interface BedCropAssociationsResult {
  readonly links: readonly ActiveAssociationLink[];
  readonly relationIndex: BotanicalRelationIndex;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

function normalizeToCropPoint(
  crop: CropPlacementItem | AssociationCropPoint
): AssociationCropPoint {
  if ('position' in crop) {
    return {
      id: crop.id,
      bedId: crop.bedId,
      plantId: crop.plantId,
      commonName: crop.commonName,
      scientificName: crop.scientificName,
      familyId: crop.familyId,
      genus: crop.genus,
      x: crop.position.x,
      y: crop.position.y,
      vitalRadius: crop.vitalRadius
    };
  }

  return crop;
}

export function useBedCropAssociations(
  crops: readonly (CropPlacementItem | AssociationCropPoint)[],
  options?: CropAssociationEngineOptions
): BedCropAssociationsResult {
  const uniquePlantIds = useMemo(() => {
    const ids = new Set<string>();
    for (const crop of crops) {
      if (crop.plantId) {
        ids.add(crop.plantId);
      }
    }
    return Array.from(ids);
  }, [crops]);

  const relationQueries = useQueries({
    queries: uniquePlantIds.map((plantId) => ({
      queryKey: plantRelationKeys.byPlant(plantId),
      queryFn: () =>
        getPlantRelations({
          filters: { appliesToPlantId: plantId },
          pagination: { limit: 100 }
        }),
      staleTime: 5 * 60 * 1000
    }))
  });

  const isLoading = relationQueries.some((query) => query.isLoading);
  const isError = relationQueries.some((query) => query.isError);

  const relations = useMemo(() => {
    const relationMap = new Map<string, PlantRelation>();
    for (const query of relationQueries) {
      const items = query.data?.data ?? [];
      for (const item of items) {
        relationMap.set(item.id, item);
      }
    }
    return Array.from(relationMap.values());
  }, [relationQueries]);

  const cropPoints = useMemo(() => crops.map(normalizeToCropPoint), [crops]);

  const relationIndex = useMemo(
    () => buildBotanicalRelationIndex(relations, cropPoints, isLoading),
    [relations, cropPoints, isLoading]
  );

  const links = useMemo(
    () =>
      computeActiveAssociationLinks({
        crops: cropPoints,
        relationIndex,
        options
      }),
    [cropPoints, relationIndex, options]
  );

  return {
    links,
    relationIndex,
    isLoading,
    isError
  };
}
