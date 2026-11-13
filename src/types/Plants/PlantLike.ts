export interface PlantLikeItem {
  plantId: string;
  likedAt: string;
}

export interface CheckPlantLikeResponse {
  liked: boolean;
  likedAt?: string;
}
