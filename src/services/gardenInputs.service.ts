import type { PaginatedResponse } from '../types/api';
import type {
  CreateGardenInputRequest,
  GardenInput,
  GardenInputListItem,
  UpdateGardenInputRequest
} from '../types/GardenInput/GardenInput';
import { apiFetch, apiFetchWithMeta } from './api';
import {
  buildGardenInputQuery,
  type GardenInputListRequest
} from './gardenInputListQuery';

const GARDEN_INPUTS_PATH = '/api/v1/garden-inputs';

export interface GardenInputWithMeta {
  readonly gardenInput: GardenInput;
  readonly etag: string;
}

export function getGardenInputList(
  request: GardenInputListRequest
): Promise<PaginatedResponse<GardenInputListItem>> {
  const query = buildGardenInputQuery(request);
  return apiFetch(`${GARDEN_INPUTS_PATH}?${query}`);
}

export function getGardenInput(idOrSlug: string): Promise<GardenInput> {
  return apiFetch<GardenInput>(`${GARDEN_INPUTS_PATH}/${idOrSlug}`);
}

export async function getGardenInputWithMeta(
  idOrSlug: string
): Promise<GardenInputWithMeta> {
  const { data, etag } = await apiFetchWithMeta<GardenInput>(
    `${GARDEN_INPUTS_PATH}/${idOrSlug}`
  );
  return { gardenInput: data, etag: etag ?? '' };
}

export async function createGardenInput(
  input: CreateGardenInputRequest
): Promise<GardenInputWithMeta> {
  const payload: CreateGardenInputRequest = {
    ...input,
    id: input.id || crypto.randomUUID()
  };
  const { data, etag } = await apiFetchWithMeta<GardenInput>(
    GARDEN_INPUTS_PATH,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
  return { gardenInput: data, etag: etag ?? '' };
}

export async function updateGardenInput(
  idOrSlug: string,
  patch: UpdateGardenInputRequest,
  etag: string
): Promise<GardenInputWithMeta> {
  const { data, etag: nextEtag } = await apiFetchWithMeta<GardenInput>(
    `${GARDEN_INPUTS_PATH}/${idOrSlug}`,
    {
      method: 'PATCH',
      headers: { 'If-Match': etag },
      body: JSON.stringify(patch)
    }
  );
  return { gardenInput: data, etag: nextEtag ?? '' };
}

export async function deleteGardenInput(
  idOrSlug: string,
  etag: string
): Promise<void> {
  await apiFetchWithMeta<void>(`${GARDEN_INPUTS_PATH}/${idOrSlug}`, {
    method: 'DELETE',
    headers: { 'If-Match': etag }
  });
}
