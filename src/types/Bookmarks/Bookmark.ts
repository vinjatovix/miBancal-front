export interface FavoritePlantItem {
  readonly plantId: string;
  readonly bookmarkedAt: string;
}

export interface UserBookmarksResponse {
  readonly plants: FavoritePlantItem[];
}

export interface AddPlantBookmarkRequest {
  readonly plantId: string;
}
