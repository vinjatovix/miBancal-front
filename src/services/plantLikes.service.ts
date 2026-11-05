import { apiFetch } from './api';
import type {
  PlantLikeItem,
  CheckPlantLikeResponse
} from '../types/Plants/PlantLike';

export async function likePlant(plantId: string): Promise<PlantLikeItem> {
  return apiFetch<PlantLikeItem>(`/api/v1/plants/${plantId}/likes`, {
    method: 'POST'
  });
}

export async function unlikePlant(plantId: string): Promise<void> {
  await apiFetch<void>(`/api/v1/plants/${plantId}/likes`, {
    method: 'DELETE'
  });
}

export async function checkPlantLike(
  plantId: string
): Promise<CheckPlantLikeResponse> {
  return apiFetch<CheckPlantLikeResponse>(
    `/api/v1/plants/${plantId}/likes/me`,
    {
      method: 'GET'
    }
  );
}
