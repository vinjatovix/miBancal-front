import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLayoutPlantingDraft } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutPlantingDraft';
import { PreconditionFailedError } from '../../../../../src/shared/errors/PreconditionFailedError';
import {
  batchPlacePlantInstances,
  batchRemovePlantInstances,
  batchUpdatePlantInstances
} from '../../../../../src/services/plantInstances.service';
import type { CropPlacementItem } from '../../../../../src/types/PlantInstance/plantPlacementTypes';
import { buildCropPlacementItem } from '../../../../fixtures/plantInstances/buildPlantInstance';

vi.mock('../../../../../src/services/plantInstances.service', () => ({
  batchPlacePlantInstances: vi.fn(),
  batchRemovePlantInstances: vi.fn(),
  batchUpdatePlantInstances: vi.fn()
}));

const mockedBatchPlace = vi.mocked(batchPlacePlantInstances);
const mockedBatchRemove = vi.mocked(batchRemovePlantInstances);
const mockedBatchUpdate = vi.mocked(batchUpdatePlantInstances);

const BED_ID = 'd3b07384-d113-48e0-bb12-f0183f05b0c8';

function buildServer(
  crops: readonly CropPlacementItem[]
): ReadonlyMap<string, readonly CropPlacementItem[]> {
  return new Map([[BED_ID, crops]]);
}

function renderDraft(
  cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>,
  invalidateBed = vi.fn().mockResolvedValue(undefined)
) {
  const view = renderHook(() =>
    useLayoutPlantingDraft({ cropsByBed, invalidateBed })
  );
  return { ...view, invalidateBed };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useLayoutPlantingDraft', () => {
  it('stages new crops locally without calling the API', () => {
    const { result } = renderDraft(buildServer([]));

    act(() => {
      result.current.addCrop({
        bedId: BED_ID,
        plantId: 'plant-1',
        commonName: 'Lechuga',
        vitalRadius: 20,
        position: { x: 10, y: 10 }
      });
    });

    expect(result.current.hasChanges).toBe(true);
    expect(result.current.pendingCount).toBe(1);
    expect(result.current.effectiveCropsByBed.get(BED_ID)).toHaveLength(1);
    expect(mockedBatchPlace).not.toHaveBeenCalled();
  });

  it('overlays moves and deletions on the server crops without persisting', () => {
    const crop = buildCropPlacementItem({
      id: 'c1',
      bedId: BED_ID,
      position: { x: 50, y: 50 }
    });
    const { result } = renderDraft(buildServer([crop]));

    act(() => result.current.moveCrop('c1', { x: 70, y: 70 }));
    expect(
      result.current.effectiveCropsByBed.get(BED_ID)?.[0].position
    ).toEqual({ x: 70, y: 70 });

    act(() => result.current.removeCrops(['c1']));
    expect(result.current.effectiveCropsByBed.get(BED_ID)).toHaveLength(0);
    expect(result.current.pendingCount).toBe(1);
    expect(mockedBatchUpdate).not.toHaveBeenCalled();
    expect(mockedBatchRemove).not.toHaveBeenCalled();
  });

  it('drops a staged creation entirely when it is deleted before saving', () => {
    const { result } = renderDraft(buildServer([]));

    let createdId = '';
    act(() => {
      createdId = result.current.addCrop({
        bedId: BED_ID,
        plantId: 'plant-1',
        commonName: 'Lechuga',
        vitalRadius: 20,
        position: { x: 10, y: 10 }
      });
    });
    act(() => result.current.removeCrops([createdId]));

    expect(result.current.hasChanges).toBe(false);
    expect(result.current.pendingCount).toBe(0);
  });

  it('persists creations, updates and deletions on save then clears the overlay', async () => {
    const existing = buildCropPlacementItem({
      id: 'c1',
      bedId: BED_ID,
      version: 3,
      position: { x: 50, y: 50 }
    });
    const toDelete = buildCropPlacementItem({
      id: 'c2',
      bedId: BED_ID,
      version: 5,
      position: { x: 10, y: 10 }
    });
    mockedBatchPlace.mockResolvedValue({ data: [] });
    mockedBatchUpdate.mockResolvedValue({ data: [] });
    mockedBatchRemove.mockResolvedValue(undefined);

    const { result, invalidateBed } = renderDraft(
      buildServer([existing, toDelete])
    );

    act(() => {
      result.current.addCrop({
        bedId: BED_ID,
        plantId: 'np',
        commonName: 'Nueva',
        vitalRadius: 20,
        position: { x: 80, y: 80 }
      });
    });
    act(() => result.current.moveCrop('c1', { x: 60, y: 60 }));
    act(() => result.current.removeCrops(['c2']));

    let status: string | undefined;
    await act(async () => {
      status = await result.current.save();
    });

    expect(status).toBe('ok');
    expect(mockedBatchPlace).toHaveBeenCalledWith({
      bedId: BED_ID,
      items: [
        expect.objectContaining({
          plantId: 'np',
          position: { x: 80, y: 80 },
          growthStatus: 'planted'
        })
      ]
    });
    expect(mockedBatchUpdate).toHaveBeenCalledWith({
      items: [{ id: 'c1', version: 3, position: { x: 60, y: 60 } }]
    });
    expect(mockedBatchRemove).toHaveBeenCalledWith({
      items: [{ id: 'c2', version: 5 }]
    });
    expect(invalidateBed).toHaveBeenCalledWith(BED_ID);
    expect(result.current.hasChanges).toBe(false);
  });

  it('returns a conflict status and keeps the changes when the API rejects', async () => {
    const existing = buildCropPlacementItem({
      id: 'c1',
      bedId: BED_ID,
      version: 2
    });
    mockedBatchUpdate.mockRejectedValue(new PreconditionFailedError());

    const { result } = renderDraft(buildServer([existing]));

    act(() => result.current.moveCrop('c1', { x: 70, y: 70 }));

    let status: string | undefined;
    await act(async () => {
      status = await result.current.save();
    });

    expect(status).toBe('conflict');
    expect(result.current.hasChanges).toBe(true);
  });

  it('drops persisted creations on partial failure so a retry does not duplicate them', async () => {
    const existing = buildCropPlacementItem({
      id: 'c1',
      bedId: BED_ID,
      version: 2,
      position: { x: 50, y: 50 }
    });
    mockedBatchPlace.mockResolvedValue({ data: [] });
    mockedBatchUpdate.mockRejectedValue(new PreconditionFailedError());

    const { result } = renderDraft(buildServer([existing]));

    act(() => {
      result.current.addCrop({
        bedId: BED_ID,
        plantId: 'np',
        commonName: 'Nueva',
        vitalRadius: 20,
        position: { x: 80, y: 80 }
      });
    });
    act(() => result.current.moveCrop('c1', { x: 60, y: 60 }));

    let status: string | undefined;
    await act(async () => {
      status = await result.current.save();
    });

    expect(status).toBe('conflict');
    expect(mockedBatchPlace).toHaveBeenCalledTimes(1);
    expect(result.current.pendingCount).toBe(1);
    expect(
      result.current.effectiveCropsByBed
        .get(BED_ID)
        ?.some((crop) => crop.plantId === 'np')
    ).toBe(false);
  });
});
