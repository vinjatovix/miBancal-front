import type { PaginatedResponse } from '../../../src/types/api';
import type { FamilyListItem } from '../../../src/types/Family';
import { listFamiliesResponse } from './listFamilies';

export const listFamilyItems: FamilyListItem[] = listFamiliesResponse.data.map(
  ({ id, name, scientificName }) => ({ id, name, scientificName })
);

export const listFamilyItemsResponse: PaginatedResponse<FamilyListItem> = {
  data: listFamilyItems,
  pagination: listFamiliesResponse.pagination
};
