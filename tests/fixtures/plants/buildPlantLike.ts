import type {
  PlantLikeItem,
  CheckPlantLikeResponse
} from '../../../src/types/Plants/PlantLike';

export function buildPlantLikeItem(
  overrides?: Partial<PlantLikeItem>
): PlantLikeItem {
  return {
    plantId: '678efda2-ac3d-4623-81cd-fc1d0ab80315',
    likedAt: '2026-10-22T14:30:00.000Z',
    ...overrides
  };
}

export function buildCheckPlantLikeResponse(
  overrides?: Partial<CheckPlantLikeResponse>
): CheckPlantLikeResponse {
  const liked = overrides?.liked ?? true;
  return {
    liked,
    likedAt: liked ? '2026-10-22T14:30:00.000Z' : undefined,
    ...overrides
  };
}
