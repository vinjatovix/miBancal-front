import type {
  AddPlantBookmarkRequest,
  FavoritePlantItem,
  UserBookmarksResponse
} from '../types/Bookmarks/Bookmark';
import { apiFetch } from './api';

export async function getBookmarkedPlantIds(): Promise<Set<string>> {
  const response = await apiFetch<UserBookmarksResponse>('/api/v1/bookmarks');
  return new Set(response.plants.map((item) => item.plantId));
}

export async function addPlantBookmark(
  plantId: string
): Promise<FavoritePlantItem> {
  const payload: AddPlantBookmarkRequest = { plantId };
  return apiFetch<FavoritePlantItem>('/api/v1/bookmarks/plants', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function removePlantBookmark(plantId: string): Promise<void> {
  await apiFetch<void>(`/api/v1/bookmarks/plants/${plantId}`, {
    method: 'DELETE'
  });
}
