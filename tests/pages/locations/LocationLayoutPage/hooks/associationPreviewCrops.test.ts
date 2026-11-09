import { describe, expect, it } from 'vitest';
import { buildAssociationCropsByBed } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/associationPreviewCrops';
import type { LayoutPlacementPreview } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutPalettePlacement';
import type { GroupMovePreview } from '../../../../../src/types/PlantInstance/brushSelectionTypes';
import type { CropPlacementItem } from '../../../../../src/types/PlantInstance/plantPlacementTypes';

function crop(
  id: string,
  position: { x: number; y: number }
): CropPlacementItem {
  return {
    id,
    bedId: 'bed-1',
    plantId: `plant-${id}`,
    commonName: id,
    position,
    vitalRadius: 20,
    growthStatus: 'planted',
    version: 1
  };
}

const effectiveCropsByBed = new Map<string, readonly CropPlacementItem[]>([
  [
    'bed-1',
    [
      crop('a', { x: 0, y: 0 }),
      crop('b', { x: 50, y: 0 }),
      crop('c', { x: 100, y: 0 })
    ]
  ]
]);

describe('buildAssociationCropsByBed', () => {
  it('returns the same reference when there is no active preview', () => {
    const result = buildAssociationCropsByBed({
      effectiveCropsByBed,
      draggingCropId: null,
      singlePreview: null,
      groupMovePreview: null
    });

    expect(result).toBe(effectiveCropsByBed);
  });

  it('overrides the dragged crop position with the single-drag preview', () => {
    const singlePreview: LayoutPlacementPreview = {
      bedId: 'bed-1',
      local: { x: 25, y: 40 },
      vitalRadius: 20,
      commonName: 'a',
      hasCollision: false,
      isOutOfBounds: false
    };

    const result = buildAssociationCropsByBed({
      effectiveCropsByBed,
      draggingCropId: 'a',
      singlePreview,
      groupMovePreview: null
    });

    const bedCrops = result.get('bed-1') ?? [];
    expect(bedCrops.find((c) => c.id === 'a')?.position).toEqual({
      x: 25,
      y: 40
    });
    expect(bedCrops.find((c) => c.id === 'b')?.position).toEqual({
      x: 50,
      y: 0
    });
  });

  it('does not override when dragging id has no matching preview', () => {
    const result = buildAssociationCropsByBed({
      effectiveCropsByBed,
      draggingCropId: 'a',
      singlePreview: null,
      groupMovePreview: null
    });

    expect(result).toBe(effectiveCropsByBed);
  });

  it('overrides every crop position in a group move preview', () => {
    const groupMovePreview: GroupMovePreview = {
      bedId: 'bed-1',
      items: [
        {
          id: 'a',
          local: { x: 10, y: 10 },
          vitalRadius: 20,
          commonName: 'a',
          hasCollision: false,
          isOutOfBounds: false
        },
        {
          id: 'b',
          local: { x: 60, y: 10 },
          vitalRadius: 20,
          commonName: 'b',
          hasCollision: false,
          isOutOfBounds: false
        }
      ]
    };

    const result = buildAssociationCropsByBed({
      effectiveCropsByBed,
      draggingCropId: null,
      singlePreview: null,
      groupMovePreview
    });

    const bedCrops = result.get('bed-1') ?? [];
    expect(bedCrops.find((c) => c.id === 'a')?.position).toEqual({
      x: 10,
      y: 10
    });
    expect(bedCrops.find((c) => c.id === 'b')?.position).toEqual({
      x: 60,
      y: 10
    });
    expect(bedCrops.find((c) => c.id === 'c')?.position).toEqual({
      x: 100,
      y: 0
    });
  });

  it('appends brush preview crops to the stroke bed', () => {
    const previewCrop = crop('brush-preview-bed-1-0', { x: 70, y: 30 });

    const result = buildAssociationCropsByBed({
      effectiveCropsByBed,
      draggingCropId: null,
      singlePreview: null,
      groupMovePreview: null,
      brushPreviewCrops: { bedId: 'bed-1', crops: [previewCrop] }
    });

    const bedCrops = result.get('bed-1') ?? [];
    expect(bedCrops).toHaveLength(4);
    expect(
      bedCrops.find((c) => c.id === 'brush-preview-bed-1-0')
    ).toBeDefined();
    expect(bedCrops.find((c) => c.id === 'a')?.position).toEqual({
      x: 0,
      y: 0
    });
  });

  it('creates an entry for a brush stroke on a bed without existing crops', () => {
    const previewCrop: CropPlacementItem = {
      ...crop('brush-preview-bed-2-0', { x: 10, y: 10 }),
      bedId: 'bed-2'
    };

    const result = buildAssociationCropsByBed({
      effectiveCropsByBed,
      draggingCropId: null,
      singlePreview: null,
      groupMovePreview: null,
      brushPreviewCrops: { bedId: 'bed-2', crops: [previewCrop] }
    });

    expect(result.get('bed-2')).toHaveLength(1);
    expect(result.get('bed-1')).toHaveLength(3);
  });

  it('ignores an empty brush preview', () => {
    const result = buildAssociationCropsByBed({
      effectiveCropsByBed,
      draggingCropId: null,
      singlePreview: null,
      groupMovePreview: null,
      brushPreviewCrops: { bedId: 'bed-1', crops: [] }
    });

    expect(result).toBe(effectiveCropsByBed);
  });
});
