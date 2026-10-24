import { QueryBuilder } from '../shared/api/QueryBuilder';
import type {
  Anomaly,
  AnomalyListItem,
  CreateAnomalyRequest,
  UpdateAnomalyRequest
} from '../types/Anomaly/Anomaly';
import type { PaginatedResponse } from '../types/api';
import type { PaginationParams } from '../types/Pagination';
import { apiFetch, apiFetchWithMeta } from './api';
import {
  ANOMALY_FIELDS_QUERY_KEY,
  ANOMALY_FILTER_QUERY_KEYS,
  ANOMALY_LIST_FIELDS,
  anomalySortQueryKey,
  type AnomalyFilterParams,
  type AnomalyListRequest
} from './anomalyListQuery';
import { PAGINATION_QUERY_KEYS } from './listQuery';

const ANOMALIES_PATH = '/api/v1/anomalies';

function addFilters(
  query: QueryBuilder,
  filters: AnomalyFilterParams
): QueryBuilder {
  const fields = Object.keys(ANOMALY_FILTER_QUERY_KEYS) as Array<
    keyof AnomalyFilterParams
  >;
  return fields.reduce(
    (built, field) =>
      built.add(ANOMALY_FILTER_QUERY_KEYS[field], filters[field]?.trim()),
    query
  );
}

function addPagination(
  query: QueryBuilder,
  pagination: PaginationParams
): QueryBuilder {
  return query
    .add(PAGINATION_QUERY_KEYS.page, pagination.page)
    .add(PAGINATION_QUERY_KEYS.limit, pagination.limit);
}

export function getAnomalyList({
  filters,
  pagination,
  sort
}: AnomalyListRequest): Promise<PaginatedResponse<AnomalyListItem>> {
  const query = addPagination(
    addFilters(QueryBuilder.create(), filters),
    pagination
  )
    .add(anomalySortQueryKey(sort.field), sort.direction)
    .add(ANOMALY_FIELDS_QUERY_KEY, ANOMALY_LIST_FIELDS.join(','))
    .build();

  return apiFetch(`${ANOMALIES_PATH}?${query}`);
}

export function getAnomalyBySlug(slug: string): Promise<Anomaly> {
  return apiFetch<Anomaly>(`${ANOMALIES_PATH}/${slug}`);
}

export interface AnomalyWithMeta {
  readonly anomaly: Anomaly;
  readonly etag: string;
}

export async function getAnomalyForEdit(
  idOrSlug: string
): Promise<AnomalyWithMeta> {
  const { data, etag } = await apiFetchWithMeta<Anomaly>(
    `${ANOMALIES_PATH}/${idOrSlug}`
  );
  return { anomaly: data, etag: etag ?? '' };
}

export async function createAnomaly(
  anomaly: CreateAnomalyRequest
): Promise<AnomalyWithMeta> {
  const payload: CreateAnomalyRequest = {
    ...anomaly,
    id: anomaly.id || crypto.randomUUID()
  };
  const { data, etag } = await apiFetchWithMeta<Anomaly>(ANOMALIES_PATH, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return { anomaly: data, etag: etag ?? '' };
}

export async function updateAnomaly(
  idOrSlug: string,
  patch: UpdateAnomalyRequest,
  etag: string
): Promise<AnomalyWithMeta> {
  const { data, etag: nextEtag } = await apiFetchWithMeta<Anomaly>(
    `${ANOMALIES_PATH}/${idOrSlug}`,
    {
      method: 'PATCH',
      headers: { 'If-Match': etag },
      body: JSON.stringify(patch)
    }
  );
  return { anomaly: data, etag: nextEtag ?? '' };
}

export async function deleteAnomaly(
  idOrSlug: string,
  etag: string
): Promise<void> {
  await apiFetchWithMeta<void>(`${ANOMALIES_PATH}/${idOrSlug}`, {
    method: 'DELETE',
    headers: { 'If-Match': etag }
  });
}
