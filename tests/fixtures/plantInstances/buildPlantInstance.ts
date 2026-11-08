import type {
  BatchPlacePlantInstancesRequest,
  BatchRemovePlantInstancesRequest,
  BatchUpdatePlantInstancesRequest,
  PlacePlantInstance,
  PlantInstanceResponse,
  UpdatePlantInstance
} from '../../../src/types/PlantInstance/PlantInstance';
import type { CropPlacementItem } from '../../../src/types/PlantInstance/plantPlacementTypes';

export function buildCropPlacementItem(
  overrides: Partial<CropPlacementItem> = {}
): CropPlacementItem {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    bedId: 'd3b07384-d113-48e0-bb12-f0183f05b0c8',
    plantId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    commonName: 'Tomate',
    scientificName: 'Solanum lycopersicum',
    position: { x: 60, y: 40 },
    vitalRadius: 25,
    growthStatus: 'planted',
    etag: '"etag-1"',
    version: 1,
    ...overrides
  };
}

export function buildPlantInstance(
  overrides: Partial<PlantInstanceResponse> = {}
): PlantInstanceResponse {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    userId: '00000000-0000-4000-8000-000000000001',
    bedId: 'd3b07384-d113-48e0-bb12-f0183f05b0c8',
    plantId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    position: {
      x: 60,
      y: 40
    },
    growthStatus: 'planted',
    instanceStatus: 'active',
    plantedAt: '2026-11-07T12:00:00.000Z',
    variety: 'San Marzano',
    notes: 'Siembra y trasplante inicial',
    metadata: {
      createdAt: new Date('2026-11-07T12:00:00.000Z'),
      createdBy: '00000000-0000-4000-8000-000000000001',
      updatedAt: new Date('2026-11-07T12:00:00.000Z'),
      updatedBy: '00000000-0000-4000-8000-000000000001'
    },
    version: 1,
    ...overrides
  };
}

export function buildPlacePlantInstance(
  overrides: Partial<PlacePlantInstance> = {}
): PlacePlantInstance {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    bedId: 'd3b07384-d113-48e0-bb12-f0183f05b0c8',
    plantId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    position: {
      x: 60,
      y: 40
    },
    growthStatus: 'planted',
    plantedAt: '2026-11-07T12:00:00.000Z',
    variety: 'San Marzano',
    notes: 'Siembra y trasplante inicial',
    ...overrides
  };
}

export function buildUpdatePlantInstance(
  overrides: Partial<UpdatePlantInstance> = {}
): UpdatePlantInstance {
  return {
    position: {
      x: 80,
      y: 55
    },
    growthStatus: 'growing',
    variety: 'San Marzano',
    notes: 'Primer aporcado realizado',
    ...overrides
  };
}

export function buildBatchPlacePlantInstancesRequest(
  overrides: Partial<BatchPlacePlantInstancesRequest> = {}
): BatchPlacePlantInstancesRequest {
  return {
    bedId: 'd3b07384-d113-48e0-bb12-f0183f05b0c8',
    items: [
      {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        plantId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        position: { x: 60, y: 40 },
        growthStatus: 'planted',
        variety: 'San Marzano',
        notes: 'Siembra en lote'
      }
    ],
    ...overrides
  };
}

export function buildBatchUpdatePlantInstancesRequest(
  overrides: Partial<BatchUpdatePlantInstancesRequest> = {}
): BatchUpdatePlantInstancesRequest {
  return {
    items: [
      {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        version: 1,
        position: { x: 80, y: 55 },
        growthStatus: 'growing',
        variety: 'San Marzano',
        notes: 'Ajuste de lote'
      }
    ],
    ...overrides
  };
}

export function buildBatchRemovePlantInstancesRequest(
  overrides: Partial<BatchRemovePlantInstancesRequest> = {}
): BatchRemovePlantInstancesRequest {
  return {
    items: [
      {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        version: 1
      }
    ],
    ...overrides
  };
}
