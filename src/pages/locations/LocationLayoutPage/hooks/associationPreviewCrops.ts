import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type { GroupMovePreview } from '../../../../types/PlantInstance/brushSelectionTypes';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import type { LayoutPlacementPreview } from './useLayoutPalettePlacement';

export interface BrushPreviewCrops {
  readonly bedId: string;
  readonly crops: readonly CropPlacementItem[];
}

export interface AssociationPreviewInput {
  readonly effectiveCropsByBed: ReadonlyMap<
    string,
    readonly CropPlacementItem[]
  >;
  readonly draggingCropId: string | null;
  readonly singlePreview: LayoutPlacementPreview | null;
  readonly groupMovePreview: GroupMovePreview | null;
  readonly brushPreviewCrops?: BrushPreviewCrops | null;
}

export function buildAssociationCropsByBed({
  effectiveCropsByBed,
  draggingCropId,
  singlePreview,
  groupMovePreview,
  brushPreviewCrops
}: AssociationPreviewInput): ReadonlyMap<string, readonly CropPlacementItem[]> {
  const overrides = new Map<string, Coordinates>();
  if (draggingCropId && singlePreview) {
    overrides.set(draggingCropId, singlePreview.local);
  }
  if (groupMovePreview) {
    for (const item of groupMovePreview.items) {
      overrides.set(item.id, item.local);
    }
  }

  const hasOverrides = overrides.size > 0;
  const hasBrushPreview =
    brushPreviewCrops != null && brushPreviewCrops.crops.length > 0;

  if (!hasOverrides && !hasBrushPreview) return effectiveCropsByBed;

  const next = new Map<string, readonly CropPlacementItem[]>();
  for (const [bedId, crops] of effectiveCropsByBed) {
    const repositioned = hasOverrides
      ? crops.map((crop) => {
          const override = overrides.get(crop.id);
          return override ? { ...crop, position: override } : crop;
        })
      : crops;

    if (hasBrushPreview && brushPreviewCrops.bedId === bedId) {
      next.set(bedId, [...repositioned, ...brushPreviewCrops.crops]);
    } else {
      next.set(bedId, repositioned);
    }
  }

  if (hasBrushPreview && !effectiveCropsByBed.has(brushPreviewCrops.bedId)) {
    next.set(brushPreviewCrops.bedId, [...brushPreviewCrops.crops]);
  }

  return next;
}
