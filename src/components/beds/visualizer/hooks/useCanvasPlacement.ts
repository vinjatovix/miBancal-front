import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject
} from 'react';

import { t } from '../../../../i18n/core/t';
import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type { CropPreview } from '../BedCropsLayer';
import type { BedGeometry } from '../utils/bedGeometry';
import { clientToBedCoordinates } from '../utils/placementCoordinates';
import { readDraggedPlantId } from '../placementDnd';

export interface PlacingPlant {
  readonly commonName: string;
  readonly vitalRadius: number;
}

export interface PlacementEvaluation {
  readonly hasCollision: boolean;
  readonly isOutOfBounds: boolean;
}

export type InvalidPlacementReason = 'collision' | 'out_of_bounds';

export interface ViewportValues {
  readonly panX: number;
  readonly panY: number;
  readonly zoom: number;
}

export interface UseCanvasPlacementParams {
  readonly svgRef: RefObject<SVGSVGElement | null>;
  readonly geometry: BedGeometry;
  readonly viewport: ViewportValues;
  readonly isPlacingActive: boolean;
  readonly placingPlant?: PlacingPlant | null;
  readonly evaluatePlacement?: (
    position: Coordinates,
    vitalRadius: number
  ) => PlacementEvaluation;
  readonly onDropPlacement?: (plantId: string, position: Coordinates) => void;
  readonly onTapPlacement?: (position: Coordinates) => void;
  readonly onSelectCrop?: (id: string | null) => void;
  readonly onMoveCrop?: (id: string, position: Coordinates) => void;
  readonly onAttemptInvalidPlacement?: (reason: InvalidPlacementReason) => void;
}

function invalidReason(
  evaluation: PlacementEvaluation
): InvalidPlacementReason | null {
  if (evaluation.isOutOfBounds) return 'out_of_bounds';
  if (evaluation.hasCollision) return 'collision';
  return null;
}

export function useCanvasPlacement(params: UseCanvasPlacementParams) {
  const {
    svgRef,
    geometry,
    viewport,
    isPlacingActive,
    placingPlant,
    evaluatePlacement,
    onDropPlacement,
    onTapPlacement,
    onSelectCrop,
    onMoveCrop,
    onAttemptInvalidPlacement
  } = params;

  const [previewPos, setPreviewPos] = useState<Coordinates | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const lastReasonRef = useRef<InvalidPlacementReason | null | 'none'>('none');
  const cropDragRef = useRef<{
    readonly id: string;
    readonly pointerId: number;
  } | null>(null);

  const evaluate = useCallback(
    (position: Coordinates): PlacementEvaluation => {
      if (!placingPlant || !evaluatePlacement) {
        return { hasCollision: false, isOutOfBounds: false };
      }
      return evaluatePlacement(position, placingPlant.vitalRadius);
    },
    [placingPlant, evaluatePlacement]
  );

  const toPosition = useCallback(
    (clientX: number, clientY: number): Coordinates | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      return clientToBedCoordinates(svg, clientX, clientY, geometry, viewport);
    },
    [svgRef, geometry, viewport]
  );

  const announceHover = useCallback(
    (position: Coordinates) => {
      const reason = invalidReason(evaluate(position));
      if (lastReasonRef.current === reason) return;
      lastReasonRef.current = reason;
      if (reason === 'collision') {
        setAnnouncement(t('bed.placement.announce_collision'));
      } else if (reason === 'out_of_bounds') {
        setAnnouncement(t('bed.placement.announce_out_of_bounds'));
      } else {
        setAnnouncement(t('bed.placement.announce_cleared'));
      }
    },
    [evaluate]
  );

  const commit = useCallback(
    (position: Coordinates, place: (position: Coordinates) => void) => {
      const reason = invalidReason(evaluate(position));
      if (reason) {
        onAttemptInvalidPlacement?.(reason);
        setAnnouncement(
          reason === 'collision'
            ? t('bed.placement.announce_collision')
            : t('bed.placement.announce_out_of_bounds')
        );
        return;
      }
      place(position);
      setAnnouncement(
        t('bed.placement.announce_placed', {
          x: String(Math.round(position.x)),
          y: String(Math.round(position.y))
        })
      );
    },
    [evaluate, onAttemptInvalidPlacement]
  );

  const onDragOver = useCallback(
    (event: DragEvent<SVGSVGElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      if (!placingPlant) return;
      const position = toPosition(event.clientX, event.clientY);
      if (!position) return;
      setPreviewPos(position);
      announceHover(position);
    },
    [placingPlant, toPosition, announceHover]
  );

  const onDragLeave = useCallback(() => {
    setPreviewPos(null);
    lastReasonRef.current = 'none';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<SVGSVGElement>) => {
      event.preventDefault();
      setPreviewPos(null);
      lastReasonRef.current = 'none';
      const plantId = readDraggedPlantId(event.dataTransfer);
      const position = toPosition(event.clientX, event.clientY);
      if (!plantId || !position) return;
      commit(position, (pos) => onDropPlacement?.(plantId, pos));
    },
    [toPosition, commit, onDropPlacement]
  );

  const onCanvasClick = useCallback(
    (event: MouseEvent<SVGSVGElement>) => {
      if (!isPlacingActive) {
        onSelectCrop?.(null);
        return;
      }
      const position = toPosition(event.clientX, event.clientY);
      if (!position) return;
      commit(position, (pos) => onTapPlacement?.(pos));
    },
    [isPlacingActive, toPosition, commit, onTapPlacement, onSelectCrop]
  );

  const onCropPointerDown = useCallback(
    (id: string, event: PointerEvent<SVGGElement>) => {
      event.stopPropagation();
      onSelectCrop?.(id);
      if (!onMoveCrop) return;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      cropDragRef.current = { id, pointerId: event.pointerId };
    },
    [onSelectCrop, onMoveCrop]
  );

  const onCropPointerMove = useCallback(
    (event: PointerEvent<SVGGElement>) => {
      const drag = cropDragRef.current;
      if (!drag || !onMoveCrop) return;
      const position = toPosition(event.clientX, event.clientY);
      if (position) {
        onMoveCrop(drag.id, position);
      }
    },
    [toPosition, onMoveCrop]
  );

  const onCropPointerUp = useCallback((event: PointerEvent<SVGGElement>) => {
    if (cropDragRef.current) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      cropDragRef.current = null;
    }
  }, []);

  const preview: CropPreview | null =
    previewPos && placingPlant
      ? {
          position: previewPos,
          vitalRadius: placingPlant.vitalRadius,
          commonName: placingPlant.commonName,
          hasCollision: evaluate(previewPos).hasCollision,
          isOutOfBounds: evaluate(previewPos).isOutOfBounds
        }
      : null;

  return {
    onDragOver,
    onDragLeave,
    onDrop,
    onCanvasClick,
    onCropPointerDown,
    onCropPointerMove,
    onCropPointerUp,
    preview,
    announcement
  };
}
