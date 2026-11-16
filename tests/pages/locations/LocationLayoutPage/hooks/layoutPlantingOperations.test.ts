import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  batchCreateCrops,
  batchDeleteCrops,
  batchUpdateCrops,
  computeDuplicatePlacements,
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

describe('computeDuplicatePlacements', () => {
  it('places a duplicate clear of its original using a radius-based offset', () => {
    const crops = [
      buildCropPlacementItem({
        id: 'crop-1',
        bedId: BED_ID,
        plantId: 'plant-tomato',
        position: { x: 20, y: 20 },
        vitalRadius: 25
      })
    ];

    const result = computeDuplicatePlacements(crops, BED_DIMENSIONS);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      bedId: BED_ID,
      plantId: 'plant-tomato',
      vitalRadius: 25,
      position: { x: 71, y: 71 }
    });
  });

  it('relocates a duplicate inward when the default offset would leave the bed', () => {
    const crops = [
      buildCropPlacementItem({
        id: 'crop-edge',
        bedId: BED_ID,
        position: { x: 195, y: 95 },
        vitalRadius: 25
      })
    ];

    const result = computeDuplicatePlacements(crops, BED_DIMENSIONS);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ position: { x: 144, y: 95 } });
  });

  it('omits crops when no collision-free position fits inside the bed', () => {
    const crops = [
      buildCropPlacementItem({
        id: 'crop-cramped',
        bedId: BED_ID,
        position: { x: 2, y: 2 },
        vitalRadius: 25
      })
    ];

    const result = computeDuplicatePlacements(crops, { width: 5, height: 5 });

    expect(result).toHaveLength(0);
  });

  it('keeps duplicates of a group from colliding with each other', () => {
    const crops = [
      buildCropPlacementItem({
        id: 'crop-a',
        bedId: BED_ID,
        plantId: 'p',
        position: { x: 40, y: 40 },
        vitalRadius: 25
      }),
      buildCropPlacementItem({
        id: 'crop-b',
        bedId: BED_ID,
        plantId: 'p',
        position: { x: 60, y: 40 },
        vitalRadius: 25
      })
    ];

    const result = computeDuplicatePlacements(crops, BED_DIMENSIONS, crops);

    expect(result).toHaveLength(2);
    const [first, second] = result;
    if (!first || !second) throw new Error('expected two placements');
    const distance = Math.hypot(
      first.position.x - second.position.x,
      first.position.y - second.position.y
    );
    expect(distance).toBeGreaterThanOrEqual(50);
  });

  it('keeps duplicates grouped by bed when crops belong to multiple beds', () => {
    const crops = [
      buildCropPlacementItem({
        id: 'crop-bed-1',
        bedId: 'bed-1',
        plantId: 'p1',
        position: { x: 10, y: 10 },
        vitalRadius: 25
      }),
      buildCropPlacementItem({
        id: 'crop-bed-2',
        bedId: 'bed-2',
        plantId: 'p2',
        position: { x: 20, y: 20 },
        vitalRadius: 25
      })
    ];

    const result = computeDuplicatePlacements(crops, BED_DIMENSIONS);

    expect(result).toHaveLength(2);
    expect(result.find((item) => item.bedId === 'bed-1')).toMatchObject({
      plantId: 'p1',
      position: { x: 61, y: 61 }
    });
    expect(result.find((item) => item.bedId === 'bed-2')).toMatchObject({
      plantId: 'p2',
      position: { x: 71, y: 71 }
    });
  });
});
