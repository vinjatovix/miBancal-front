import type {
  FavoritePlantItem,
  UserBookmarksResponse
} from '../../../src/types/Bookmarks/Bookmark';

export function buildBookmark(
  overrides: Partial<FavoritePlantItem> = {}
): FavoritePlantItem {
  return {
    plantId: '678efda2-ac3d-4623-81cd-fc1d0ab80315',
    bookmarkedAt: '2026-10-22T14:30:00.000Z',
    ...overrides
  };
}

export function buildUserBookmarksResponse(
  plants: readonly FavoritePlantItem[] = [buildBookmark()]
): UserBookmarksResponse {
  return { plants: [...plants] };
}
