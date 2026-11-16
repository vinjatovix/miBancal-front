export type PaginationResult = {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
};

export interface PaginationParams {
  page: number;
  limit: number;
}
