import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  batchCreateCrops,
  batchDeleteCrops,
  batchDuplicateCrops,
  batchUpdateCrops,
  evaluateStoredPlacement
} from '../../../../../src/pages/locations/LocationLayoutPage/hooks/layoutPlantingOperations';
import {
  batchPlacePlantInstances,
  batchRemovePlantInstances,
  batchUpdatePlantInstances
} from '../../../../../src/services/plantInstances.service';
import { buildCropPlacementItem } from '../../../../fixtures/plantInstances/buildPlantInstance';

vi.mock('../../../../../src/services/plantInstances.service', () => ({
  batchPlacePlantInstances: vi.fn(),
  batchRemovePlantInstances: vi.fn(),
  batchUpdatePlantInstances: vi.fn()
}));

const mockedBatchPlace = vi.mocked(batchPlacePlantInstances);
const mockedBatchRemove = vi.mocked(batchRemovePlantInstances);
const mockedBatchUpdate = vi.mocked(batchUpdatePlantInstances);

const BED_ID = 'bed-123';
const BED_DIMENSIONS = { width: 200, height: 100 };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('evaluateStoredPlacement', () => {
  it('detects collision when candidate overlaps with an existing crop', () => {
    const existingCrop = buildCropPlacementItem({
      id: 'existing-1',
      position: { x: 50, y: 50 },
      vitalRadius: 20
    });

    const result = evaluateStoredPlacement(
      BED_DIMENSIONS,
      { x: 55, y: 50 },
      20,
      [existingCrop]
    );

    expect(result.hasCollision).toBe(true);
    expect(result.isOutOfBounds).toBe(false);
  });

  it('detects out of bounds when candidate is positioned outside bed edges', () => {
    const result = evaluateStoredPlacement(
      BED_DIMENSIONS,
      { x: 205, y: 50 },
      10,
      []
    );

    expect(result.isOutOfBounds).toBe(true);
    expect(result.hasCollision).toBe(false);
  });

  it('allows valid placement when inside bounds without collisions', () => {
    const existingCrop = buildCropPlacementItem({
      id: 'existing-1',
      position: { x: 20, y: 20 },
      vitalRadius: 10
    });

    const result = evaluateStoredPlacement(
      BED_DIMENSIONS,
      { x: 100, y: 50 },
      10,
      [existingCrop]
    );

    expect(result.hasCollision).toBe(false);
    expect(result.isOutOfBounds).toBe(false);
  });

  it('ignores the crop matching ignoreCropId when evaluating collisions', () => {
    const movingCrop = buildCropPlacementItem({
      id: 'moving-1',
      position: { x: 50, y: 50 },
      vitalRadius: 20
    });

    const result = evaluateStoredPlacement(
      BED_DIMENSIONS,
      { x: 52, y: 50 },
      20,
      [movingCrop],
      'moving-1'
    );

    expect(result.hasCollision).toBe(false);
  });
});

describe('batchCreateCrops', () => {
  it('submits a single batch place request with generated client ids', async () => {
    mockedBatchPlace.mockResolvedValue({ data: [] });
    const items = [
      { plantId: 'plant-a', position: { x: 10, y: 10 } },
      { plantId: 'plant-b', position: { x: 30, y: 30 } }
    ];

    await batchCreateCrops(BED_ID, items);

    expect(mockedBatchPlace).toHaveBeenCalledTimes(1);
    expect(mockedBatchPlace).toHaveBeenCalledWith({
      bedId: BED_ID,
      items: [
        {
          id: expect.any(String),
          plantId: 'plant-a',
          position: { x: 10, y: 10 },
          growthStatus: 'planted'
        },
        {
          id: expect.any(String),
          plantId: 'plant-b',
          position: { x: 30, y: 30 },
          growthStatus: 'planted'
        }
      ]
    });
  });

  it('does not call the batch place service when items list is empty', async () => {
    await batchCreateCrops(BED_ID, []);

    expect(mockedBatchPlace).not.toHaveBeenCalled();
  });
});

describe('batchDeleteCrops', () => {
  it('submits a single batch remove request using crop ids and versions', async () => {
    mockedBatchRemove.mockResolvedValue();
    const crops = [
      buildCropPlacementItem({ id: 'crop-1', version: 2 }),
      buildCropPlacementItem({ id: 'crop-2', version: 5 })
    ];

    await batchDeleteCrops(crops);

    expect(mockedBatchRemove).toHaveBeenCalledTimes(1);
    expect(mockedBatchRemove).toHaveBeenCalledWith({
      items: [
        { id: 'crop-1', version: 2 },
        { id: 'crop-2', version: 5 }
      ]
    });
  });

  it('does not call the batch remove service when crops list is empty', async () => {
    await batchDeleteCrops([]);

    expect(mockedBatchRemove).not.toHaveBeenCalled();
  });
});

describe('batchUpdateCrops', () => {
  it('submits a single batch update request with move coordinates and versions', async () => {
    mockedBatchUpdate.mockResolvedValue({ data: [] });
    const moves = [
      { id: 'crop-1', version: 3, position: { x: 80, y: 40 } },
      { id: 'crop-2', version: 1, position: { x: 120, y: 40 } }
    ];

    await batchUpdateCrops(moves);

    expect(mockedBatchUpdate).toHaveBeenCalledTimes(1);
    expect(mockedBatchUpdate).toHaveBeenCalledWith({
      items: [
        { id: 'crop-1', version: 3, position: { x: 80, y: 40 } },
        { id: 'crop-2', version: 1, position: { x: 120, y: 40 } }
      ]
    });
  });

  it('defaults version to 0 when move item does not specify version', async () => {
    mockedBatchUpdate.mockResolvedValue({ data: [] });
    const moves = [{ id: 'crop-1', position: { x: 80, y: 40 } }];

    await batchUpdateCrops(moves);

    expect(mockedBatchUpdate).toHaveBeenCalledWith({
      items: [{ id: 'crop-1', version: 0, position: { x: 80, y: 40 } }]
    });
  });

  it('does not call the batch update service when moves list is empty', async () => {
    await batchUpdateCrops([]);

    expect(mockedBatchUpdate).not.toHaveBeenCalled();
  });
});

describe('batchDuplicateCrops', () => {
  it('places duplicates offset from their original positions within bed limits', async () => {
    mockedBatchPlace.mockResolvedValue({ data: [] });
    const crops = [
      buildCropPlacementItem({
        id: 'crop-1',
        bedId: BED_ID,
        plantId: 'plant-tomato',
        position: { x: 20, y: 20 }
      })
    ];

    await batchDuplicateCrops(crops, BED_DIMENSIONS, { x: 15, y: 15 });

    expect(mockedBatchPlace).toHaveBeenCalledTimes(1);
    expect(mockedBatchPlace).toHaveBeenCalledWith({
      bedId: BED_ID,
      items: [
        {
          id: expect.any(String),
          plantId: 'plant-tomato',
          position: { x: 35, y: 35 },
          growthStatus: 'planted'
        }
      ]
    });
  });

  it('omits crops whose duplicated position lands outside bed dimensions', async () => {
    mockedBatchPlace.mockResolvedValue({ data: [] });
    const crops = [
      buildCropPlacementItem({
        id: 'crop-edge',
        bedId: BED_ID,
        position: { x: 195, y: 95 }
      })
    ];

    await batchDuplicateCrops(crops, BED_DIMENSIONS, { x: 20, y: 20 });

    expect(mockedBatchPlace).not.toHaveBeenCalled();
  });

  it('groups duplicate requests by bed when crops belong to multiple beds', async () => {
    mockedBatchPlace.mockResolvedValue({ data: [] });
    const crops = [
      buildCropPlacementItem({
        id: 'crop-bed-1',
        bedId: 'bed-1',
        plantId: 'p1',
        position: { x: 10, y: 10 }
      }),
      buildCropPlacementItem({
        id: 'crop-bed-2',
        bedId: 'bed-2',
        plantId: 'p2',
        position: { x: 20, y: 20 }
      })
    ];

    await batchDuplicateCrops(crops, BED_DIMENSIONS, { x: 10, y: 10 });

    expect(mockedBatchPlace).toHaveBeenCalledTimes(2);
    expect(mockedBatchPlace).toHaveBeenCalledWith({
      bedId: 'bed-1',
      items: [
        expect.objectContaining({
          plantId: 'p1',
          position: { x: 20, y: 20 }
        })
      ]
    });
    expect(mockedBatchPlace).toHaveBeenCalledWith({
      bedId: 'bed-2',
      items: [
        expect.objectContaining({
          plantId: 'p2',
          position: { x: 30, y: 30 }
        })
      ]
    });
  });
});
