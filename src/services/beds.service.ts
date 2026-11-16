import type { Bed, CreateBedRequest, UpdateBedRequest } from '../types/Bed/Bed';
import { apiFetch, apiFetchWithMeta } from './api';
import {
  buildBedListQuery,
  type BedInclude,
  type BedListRequest
} from './bedListQuery';

const BEDS_PATH = '/api/v1/beds';

export interface BedWithMeta {
  readonly bed: Bed;
  readonly etag: string;
}

export async function getBedList(
  request?: BedListRequest
): Promise<readonly Bed[]> {
  const query = buildBedListQuery(request);
  const path = query ? `${BEDS_PATH}?${query}` : BEDS_PATH;
  return apiFetch<Bed[]>(path);
}

export async function getBedById(
  id: string,
  include: BedInclude = 'location'
): Promise<Bed> {
  const path = `${BEDS_PATH}/${id}?include=${include}`;
  return apiFetch<Bed>(path);
}

export async function createBed(input: CreateBedRequest): Promise<BedWithMeta> {
  const { data, etag } = await apiFetchWithMeta<Bed>(BEDS_PATH, {
    method: 'POST',
    body: JSON.stringify(input)
  });
  return { bed: data, etag: etag ?? '' };
}

export async function getBedForEdit(id: string): Promise<BedWithMeta> {
  const { data, etag } = await apiFetchWithMeta<Bed>(`${BEDS_PATH}/${id}`);
  return { bed: data, etag: etag ?? '' };
}

export async function updateBed(
  id: string,
  patch: UpdateBedRequest,
  etag: string
): Promise<BedWithMeta> {
  const { data, etag: nextEtag } = await apiFetchWithMeta<Bed>(
    `${BEDS_PATH}/${id}`,
    {
      method: 'PATCH',
      headers: { 'If-Match': etag },
      body: JSON.stringify(patch)
    }
  );
  return { bed: data, etag: nextEtag ?? '' };
}

export async function deleteBed(id: string, etag: string): Promise<void> {
  await apiFetchWithMeta<void>(`${BEDS_PATH}/${id}`, {
    method: 'DELETE',
    headers: { 'If-Match': etag }
  });
}
