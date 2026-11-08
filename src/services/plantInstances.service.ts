import type {
  BatchPlacePlantInstancesRequest,
  BatchRemovePlantInstancesRequest,
  BatchUpdatePlantInstancesRequest,
  CropGrowthStatus,
  Coordinates,
  PaginatedPlantInstances,
  PlantInstanceResponse
} from '../types/PlantInstance/PlantInstance';
import { apiFetchWithMeta } from './api';
import {
  buildPlantInstanceListQuery,
  type PlantInstanceListRequest
} from './plantInstanceListQuery';

const PLANT_INSTANCES_PATH = '/api/v1/plant-instances';
const PLANT_INSTANCES_BATCH_PATH = '/api/v1/plant-instances/batch';

export interface CreatePlantInstancePayload {
  readonly id: string;
  readonly bedId: string;
  readonly plantId: string;
  readonly position?: Coordinates;
  readonly growthStatus?: CropGrowthStatus;
  readonly plantedAt?: string;
  readonly variety?: string;
  readonly notes?: string;
}

export interface UpdatePlantInstancePayload {
  readonly position?: Coordinates;
  readonly growthStatus?: CropGrowthStatus;
  readonly variety?: string | null;
  readonly notes?: string | null;
}

export interface PlantInstanceWithMeta {
  readonly data: PlantInstanceResponse;
  readonly etag?: string;
}

export interface PlantInstanceListResult {
  readonly data: readonly PlantInstanceResponse[];
  readonly etag?: string;
}

export async function createPlantInstance(
  payload: CreatePlantInstancePayload
): Promise<PlantInstanceWithMeta> {
  const { data, etag } = await apiFetchWithMeta<PlantInstanceResponse>(
    PLANT_INSTANCES_PATH,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
  return { data, etag: etag ?? undefined };
}

export async function getPlantInstancesByBed(
  bedId: string,
  params?: Omit<PlantInstanceListRequest, 'bedId'>
): Promise<PlantInstanceListResult> {
  const query = buildPlantInstanceListQuery({ bedId, ...params });
  const path = query
    ? `${PLANT_INSTANCES_PATH}?${query}`
    : PLANT_INSTANCES_PATH;
  const { data, etag } = await apiFetchWithMeta<PaginatedPlantInstances>(path);
  return { data: data.data, etag: etag ?? undefined };
}

export async function getPlantInstance(
  id: string
): Promise<PlantInstanceWithMeta> {
  const { data, etag } = await apiFetchWithMeta<PlantInstanceResponse>(
    `${PLANT_INSTANCES_PATH}/${id}`
  );
  return { data, etag: etag ?? undefined };
}

export async function updatePlantInstance(
  id: string,
  payload: UpdatePlantInstancePayload,
  etag: string
): Promise<PlantInstanceWithMeta> {
  const { data, etag: nextEtag } =
    await apiFetchWithMeta<PlantInstanceResponse>(
      `${PLANT_INSTANCES_PATH}/${id}`,
      {
        method: 'PATCH',
        headers: { 'If-Match': etag },
        body: JSON.stringify(payload)
      }
    );
  return { data, etag: nextEtag ?? undefined };
}

export async function deletePlantInstance(
  id: string,
  etag: string
): Promise<void> {
  await apiFetchWithMeta<void>(`${PLANT_INSTANCES_PATH}/${id}`, {
    method: 'DELETE',
    headers: { 'If-Match': etag }
  });
}

export async function batchPlacePlantInstances(
  payload: BatchPlacePlantInstancesRequest
): Promise<PlantInstanceListResult> {
  const { data, etag } = await apiFetchWithMeta<PlantInstanceResponse[]>(
    PLANT_INSTANCES_BATCH_PATH,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
  return { data, etag: etag ?? undefined };
}

export async function batchUpdatePlantInstances(
  payload: BatchUpdatePlantInstancesRequest
): Promise<PlantInstanceListResult> {
  const { data, etag } = await apiFetchWithMeta<PlantInstanceResponse[]>(
    PLANT_INSTANCES_BATCH_PATH,
    {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }
  );
  return { data, etag: etag ?? undefined };
}

export async function batchRemovePlantInstances(
  payload: BatchRemovePlantInstancesRequest
): Promise<void> {
  await apiFetchWithMeta<void>(PLANT_INSTANCES_BATCH_PATH, {
    method: 'DELETE',
    body: JSON.stringify(payload)
  });
}
