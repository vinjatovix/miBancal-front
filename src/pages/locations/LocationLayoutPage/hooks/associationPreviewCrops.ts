import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type { GroupMovePreview } from '../../../../types/PlantInstance/brushSelectionTypes';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import type { LayoutPlacementPreview } from './useLayoutPalettePlacement';

export interface AssociationPreviewInput {
  readonly effectiveCropsByBed: ReadonlyMap<
    string,
    readonly CropPlacementItem[]
  >;
  readonly draggingCropId: string | null;
  readonly singlePreview: LayoutPlacementPreview | null;
  readonly groupMovePreview: GroupMovePreview | null;
}

export function buildAssociationCropsByBed({
  effectiveCropsByBed,
  draggingCropId,
  singlePreview,
  groupMovePreview
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

  if (overrides.size === 0) return effectiveCropsByBed;

  const next = new Map<string, readonly CropPlacementItem[]>();
  for (const [bedId, crops] of effectiveCropsByBed) {
    next.set(
      bedId,
      crops.map((crop) => {
        const override = overrides.get(crop.id);
        return override ? { ...crop, position: override } : crop;
      })
    );
  }
  return next;
}
