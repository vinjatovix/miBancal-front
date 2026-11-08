import { useCallback, useMemo, useRef, useState, type JSX } from 'react';

import { t } from '../../../i18n/core/t';
import type { Coordinates } from '../../../types/PlantInstance/PlantInstance';
import BedDimensionLines from './BedDimensionLines';
import BedViewportControls from './BedViewportControls';
import { BedVisualizerBedLayer } from './BedVisualizerBedLayer';
import { useBedViewport } from './hooks/useBedViewport';
import { useCanvasBrushStroke } from './hooks/useCanvasBrushStroke';
import { useCanvasContainer } from './hooks/useCanvasContainer';
import { useCanvasMarqueeSelection } from './hooks/useCanvasMarqueeSelection';
import { useCanvasPlacement } from './hooks/useCanvasPlacement';
import { calculateBedGeometry } from './utils/bedGeometry';
import { clientToBedCoordinates } from './utils/placementCoordinates';
import { computeGroupBoundingBox } from './utils/selectionGeometry';
import type { BedVisualizerCanvasProps } from './types/bedVisualizerCanvasTypes';

import './bedVisualizerCanvas.css';

export type { BedVisualizerCanvasProps };

export default function BedVisualizerCanvas({
  bed,
  activeLayers,
  crops = [],
  collisions = [],
  perimeterWarnings = new Set<string>(),
  selectedCropId = null,
  selectedCropIds = new Set<string>(),
  isPlacingActive = false,
  placingPlant = null,
  activeToolMode = 'plant-single',
  activeBrushPattern = 'single-row',
  activePlantPlacement = null,
  evaluatePlacement,
  onSelectCrop,
  onSelectCropIds,
  onToggleCropSelection,
  onClearSelection,
  onMoveCrop,
  onDropPlacement,
  onTapPlacement,
  onAttemptInvalidPlacement,
  onApplyBrush,
  onAnnounce
}: BedVisualizerCanvasProps): JSX.Element {
  const svgRef = useRef<SVGSVGElement>(null);
  const [brushAnnouncement, setBrushAnnouncement] = useState('');
  const viewport = useBedViewport();
  const { containerRef, containerDimensions, isFullscreen, toggleFullscreen } =
    useCanvasContainer();

  const largo = Math.max(bed.width, bed.height);
  const ancho = Math.min(bed.width, bed.height);

  const geometry = calculateBedGeometry({
    width: largo,
    height: ancho,
    containerWidth: containerDimensions?.width,
    containerHeight: containerDimensions?.height
  });

  const canvasLabel = t('bed.visualizer.canvas_label', {
    name: bed.name,
    width: String(largo),
    height: String(ancho)
  });

  const handleBrushAnnounce = useCallback(
    (message: string) => {
      setBrushAnnouncement(message);
      onAnnounce?.(message);
    },
    [onAnnounce]
  );

  const screenToBed = useCallback(
    (clientX: number, clientY: number): Coordinates | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      return clientToBedCoordinates(svg, clientX, clientY, geometry, viewport);
    },
    [geometry, viewport]
  );

  const spatialCrops = useMemo(
    () =>
      crops.map((c) => ({
        id: c.id,
        x: c.position.x,
        y: c.position.y,
        vitalRadius: c.vitalRadius
      })),
    [crops]
  );

  const boundingBox = useMemo(
    () => computeGroupBoundingBox(crops, selectedCropIds),
    [crops, selectedCropIds]
  );

  const marquee = useCanvasMarqueeSelection({
    isEnabled: activeToolMode === 'select',
    crops,
    selectedCropIds,
    onSelectCropIds: onSelectCropIds ?? (() => {}),
    onToggleCropSelection: onToggleCropSelection ?? (() => {}),
    onClearSelection: onClearSelection ?? (() => {}),
    screenToBedCoordinates: screenToBed
  });

  const brushStroke = useCanvasBrushStroke({
    isEnabled: activeToolMode === 'brush',
    activeBrushPattern,
    activePlant: activePlantPlacement,
    existingCrops: spatialCrops,
    bedDimensions: { width: largo, height: ancho },
    onApplyBrush: onApplyBrush ?? (() => {}),
    onAnnounce: handleBrushAnnounce,
    screenToBedCoordinates: screenToBed
  });

  const placement = useCanvasPlacement({
    svgRef,
    geometry,
    viewport: {
      panX: viewport.panX,
      panY: viewport.panY,
      zoom: viewport.zoom
    },
    isPlacingActive: isPlacingActive && activeToolMode === 'plant-single',
    placingPlant,
    evaluatePlacement,
    onDropPlacement,
    onTapPlacement,
    onSelectCrop,
    onMoveCrop,
    onAttemptInvalidPlacement
  });

  const pointerDown =
    activeToolMode === 'brush'
      ? brushStroke.handlePointerDown
      : activeToolMode === 'select'
        ? marquee.handlePointerDown
        : viewport.onPointerDown;

  const pointerMove =
    activeToolMode === 'brush'
      ? brushStroke.handlePointerMove
      : activeToolMode === 'select'
        ? marquee.handlePointerMove
        : viewport.onPointerMove;

  const pointerUp =
    activeToolMode === 'brush'
      ? brushStroke.handlePointerUp
      : activeToolMode === 'select'
        ? marquee.handlePointerUp
        : viewport.onPointerUp;

  const cx = geometry.containerWidth / 2;
  const cy = geometry.containerHeight / 2;
  const svgTransform = `translate(${viewport.panX}, ${viewport.panY}) translate(${cx}, ${cy}) scale(${viewport.zoom}) translate(${-cx}, ${-cy})`;

  return (
    <div ref={containerRef} className="bed-visualizer-canvas">
      <svg
        ref={svgRef}
        className={`bed-visualizer-canvas__svg ${
          viewport.isDragging ? 'bed-visualizer-canvas__svg--dragging' : ''
        }`}
        role="img"
        aria-label={canvasLabel}
        viewBox={geometry.viewBox}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onWheel={viewport.onWheel}
        onDoubleClick={viewport.resetZoom}
        onDragOver={placement.onDragOver}
        onDragLeave={placement.onDragLeave}
        onDrop={placement.onDrop}
        onClick={
          activeToolMode === 'plant-single'
            ? placement.onCanvasClick
            : undefined
        }
      >
        <g transform={svgTransform}>
          <BedDimensionLines geometry={geometry} />
          <BedVisualizerBedLayer
            originX={geometry.originX}
            originY={geometry.originY}
            scale={geometry.scale}
            width={largo}
            height={ancho}
            activeLayers={activeLayers}
            crops={crops}
            collisions={collisions}
            perimeterWarnings={perimeterWarnings}
            selectedCropId={selectedCropId}
            selectedCropIds={selectedCropIds}
            preview={activeToolMode === 'brush' ? null : placement.preview}
            directrix={brushStroke.directrix}
            brushCandidates={brushStroke.candidates}
            isBrushDrawing={brushStroke.isDrawing}
            boundingBox={boundingBox}
            marqueeBox={marquee.isMarqueeActive ? marquee.marqueeBox : null}
            onSelectCrop={onSelectCrop}
            onCropClick={
              activeToolMode === 'select' ? marquee.handleCropClick : undefined
            }
            onCropKeyDown={
              activeToolMode === 'select'
                ? marquee.handleCropKeyDown
                : undefined
            }
            onPointerDownCrop={placement.onCropPointerDown}
            onPointerMoveCrop={placement.onCropPointerMove}
            onPointerUpCrop={placement.onCropPointerUp}
            onKeyboardMoveCrop={onMoveCrop}
          />
        </g>
      </svg>
      <div className="sr-only" role="status" aria-live="polite">
        {brushAnnouncement || placement.announcement}
      </div>
      <BedViewportControls
        onZoomIn={viewport.zoomIn}
        onZoomOut={viewport.zoomOut}
        onReset={viewport.resetZoom}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />
    </div>
  );
}
