import { QueryBuilder } from '../shared/api/QueryBuilder';

export type BedInclude =
  | 'location'
  | 'plantInstances'
  | 'plantInstances,location'
  | 'location,plantInstances';

export interface BedListRequest {
  readonly locationId?: string;
  readonly include?: BedInclude;
}

export function buildBedListQuery(request?: BedListRequest): string {
  if (!request) {
    return '';
  }

  let builder = QueryBuilder.create();

  if (request.locationId) {
    builder = builder.add('filter[locationId]', request.locationId);
  }

  if (request.include) {
    builder = builder.add('include', request.include);
  }

  return builder.build();
}
