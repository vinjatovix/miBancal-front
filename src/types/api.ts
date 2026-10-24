import type { PaginationResult } from './Pagination';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationResult;
}
