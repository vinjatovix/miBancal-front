import type {
  CreatePlantRelationInput,
  PaginatedPlantRelationsResponse,
  PlantRelation,
  PlantRelationListRequest,
  PlantRelationWithMeta,
  UpdatePlantRelationInput
} from '../types/Plants/PlantRelation';
import { apiFetch, apiFetchWithMeta } from './api';
import {
  buildPlantRelationsQuery,
  DEFAULT_PLANT_RELATION_INCLUDES
} from './plantRelationListQuery';

export const PLANT_RELATIONS_PATH = '/api/v1/plant-relations';

export async function getPlantRelations(
  request: PlantRelationListRequest = {}
): Promise<PaginatedPlantRelationsResponse> {
  const query = buildPlantRelationsQuery(request);
  const endpoint = query
    ? `${PLANT_RELATIONS_PATH}?${query}`
    : PLANT_RELATIONS_PATH;

  return apiFetch<PaginatedPlantRelationsResponse>(endpoint);
}

export async function getPlantRelationById(
  id: string
): Promise<PlantRelationWithMeta> {
  const { data: relation, etag } = await apiFetchWithMeta<PlantRelation>(
    `${PLANT_RELATIONS_PATH}/${id}?include=${DEFAULT_PLANT_RELATION_INCLUDES.join(',')}`
  );

  return { relation, etag: etag ?? '' };
}

export async function createPlantRelation(
  payload: CreatePlantRelationInput
): Promise<PlantRelationWithMeta> {
  const body = {
    ...payload,
    id: payload.id || crypto.randomUUID()
  };

  const { data: relation, etag } = await apiFetchWithMeta<PlantRelation>(
    PLANT_RELATIONS_PATH,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  return { relation, etag: etag ?? '' };
}

export async function updatePlantRelation(
  id: string,
  patch: UpdatePlantRelationInput,
  etag: string
): Promise<PlantRelationWithMeta> {
  const { data: relation, etag: nextEtag } =
    await apiFetchWithMeta<PlantRelation>(`${PLANT_RELATIONS_PATH}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'If-Match': etag
      },
      body: JSON.stringify(patch)
    });

  return { relation, etag: nextEtag ?? '' };
}

export async function deletePlantRelation(
  id: string,
  etag: string
): Promise<void> {
  await apiFetchWithMeta<void>(`${PLANT_RELATIONS_PATH}/${id}`, {
    method: 'DELETE',
    headers: {
      'If-Match': etag
    }
  });
}
