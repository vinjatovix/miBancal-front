import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type JSX,
  type KeyboardEvent,
  type PointerEvent
} from 'react';

import { t } from '../../../i18n/core/t';
import FloatingObjectActions from './FloatingObjectActions';
import LayoutBedDimensions from './LayoutBedDimensions';
import LayoutBedCardinalEdgeLabels from './LayoutBedCardinalEdgeLabels';
import LocationCropsLayer from './LocationCropsLayer';
import LocationPlacementLayer, {
  type LocationPlacementPreview
} from './LocationPlacementLayer';
import { readDraggedPlantId } from '../visualizer/placementDnd';
import { findBedAtPoint } from './utils/plantPlacementGeometry';
import {
  calculateNetAzimuth,
  getBedEdgeCardinals
} from './utils/cardinalGeometry';
import BedGridLayers from '../visualizer/BedGridLayers';
import type { BedViewportState } from '../visualizer/hooks/useBedViewport';
import type { ActiveGridLayers } from '../visualizer/utils/bedGridConfig';
import {
  pixelToCm,
  rotatedRectVertices,
  type BoundingBox,
  type Point
} from './utils/layoutGeometry';
import { GRID_SPACING_CM } from './utils/snapConfig';
import type { AnchorPoint, LayoutMode, ResolvedBed } from './utils/layoutTypes';
import type { CropPlacementItem } from '../../../types/PlantInstance/plantPlacementTypes';
import type {
  BrushCandidatePosition,
  BrushDirectrix,
  GroupBoundingBox,
  GroupMovePreview,
  MarqueeBox,
  PlantingToolMode
} from '../../../types/PlantInstance/brushSelectionTypes';

import './locationLayoutCanvas.css';

export interface LocationLayoutCanvasProps {
  readonly beds: readonly ResolvedBed[];
  readonly viewBox: string;
  readonly label: string;
  readonly mode: LayoutMode;
  readonly selectedId?: string | null;
  readonly viewport: BedViewportState;
  readonly gridLayers?: ActiveGridLayers | null;
  readonly showNames?: boolean;
  readonly showDimensions?: boolean;
  readonly northAngle?: number | null;
  readonly showCardinalOrientation?: boolean;
  readonly floorWidth?: number | null;
  readonly floorHeight?: number | null;
  readonly cropsByBed?: ReadonlyMap<string, readonly CropPlacementItem[]>;
  readonly showPlants?: boolean;
  readonly placementPreview?: LocationPlacementPreview | null;
  readonly selectedCropId?: string | null;
  readonly selectedCropIds?: ReadonlySet<string>;
  readonly toolMode?: PlantingToolMode;
  readonly brushDirectrix?: BrushDirectrix | null;
  readonly brushCandidates?: readonly BrushCandidatePosition[];
  readonly isBrushDrawing?: boolean;
  readonly brushBedId?: string | null;
  readonly boundingBox?: GroupBoundingBox | null;
  readonly boundingBoxBedId?: string | null;
  readonly marqueeBox?: MarqueeBox | null;
  readonly marqueeBedId?: string | null;
  readonly groupMovePreview?: GroupMovePreview | null;
  readonly onSelectBed?: (id: string) => void;
  readonly onDeselect?: () => void;
  readonly onBedMove?: (id: string, deltaCmX: number, deltaCmY: number) => void;
  readonly onBedRotate?: (id: string, deltaDegrees: number) => void;
  readonly onPlacementDragOver?: (global: Point) => void;
  readonly onPlacementDragLeave?: () => void;
  readonly onPlacementDrop?: (global: Point, plantId: string) => void;
  readonly onPlacementTap?: (global: Point) => void;
  readonly onCropSelect?: (cropId: string) => void;
  readonly onCropClick?: (
    event: React.MouseEvent,
    cropId: string,
    bedId: string
  ) => void;
  readonly onCropDragStart?: (
    cropId: string,
    bedId: string,
    global: Point
  ) => void;
  readonly onCropDragMove?: (global: Point) => void;
  readonly onCropDragEnd?: (global: Point) => void;
  readonly onBrushPointerDown?: (global: Point) => void;
  readonly onBrushPointerMove?: (global: Point) => void;
  readonly onBrushPointerUp?: () => void;
  readonly onMarqueePointerDown?: (global: Point, shiftKey: boolean) => void;
  readonly onMarqueePointerMove?: (global: Point, shiftKey: boolean) => void;
  readonly onMarqueePointerUp?: () => void;
  readonly onBedUnplace?: () => void;
  readonly onBedEdit?: () => void;
  readonly onBedDelete?: () => void;
}

const FINE_STEP_CM = 5;
const COARSE_STEP_CM = 25;
const ROTATE_STEP_DEGREES = 1;
const CLICK_MOVE_THRESHOLD_PX = 4;
const FLOOR_DOT_PATTERN_ID = 'location-layout-floor-dots';

function toPoints(vertices: readonly Point[]): string {
  return vertices.map((vertex) => `${vertex.x},${vertex.y}`).join(' ');
}

function centroid(vertices: readonly Point[]): Point {
  const total = vertices.reduce(
    (acc, vertex) => ({ x: acc.x + vertex.x, y: acc.y + vertex.y }),
    { x: 0, y: 0 }
  );
  return { x: total.x / vertices.length, y: total.y / vertices.length };
}

function viewBoxBounds(viewBox: string): BoundingBox | null {
  const [x, y, width, height] = viewBox.split(/\s+/).map(Number);
  if ([x, y, width, height].some((value) => !Number.isFinite(value))) {
    return null;
  }
  return { minX: x, minY: y, maxX: x + width, maxY: y + height };
}

function viewBoxCenter(viewBox: string): Point {
  const bounds = viewBoxBounds(viewBox);
  if (!bounds) return { x: 0, y: 0 };
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2
  };
}

function floorBounds(
  viewBox: string,
  floorWidth: number | null,
  floorHeight: number | null
): BoundingBox | null {
  if (
    floorWidth !== null &&
    floorHeight !== null &&
    floorWidth > 0 &&
    floorHeight > 0
  ) {
    return { minX: 0, minY: 0, maxX: floorWidth, maxY: floorHeight };
  }
  return viewBoxBounds(viewBox);
}

export default function LocationLayoutCanvas({
  beds,
  viewBox,
  label,
  mode,
  selectedId = null,
  viewport,
  gridLayers = null,
  showNames = true,
  showDimensions = true,
  northAngle = null,
  showCardinalOrientation = true,
  floorWidth = null,
  floorHeight = null,
  cropsByBed,
  showPlants = false,
  placementPreview = null,
  selectedCropId = null,
  selectedCropIds = new Set<string>(),
  toolMode = 'plant-single',
  brushDirectrix = null,
  brushCandidates = [],
  isBrushDrawing = false,
  brushBedId = null,
  boundingBox = null,
  boundingBoxBedId = null,
  marqueeBox = null,
  marqueeBedId = null,
  groupMovePreview = null,
  onSelectBed,
  onDeselect,
  onBedMove,
  onBedRotate,
  onPlacementDragOver,
  onPlacementDragLeave,
  onPlacementDrop,
  onPlacementTap,
  onCropSelect,
  onCropClick,
  onCropDragStart,
  onCropDragMove,
  onCropDragEnd,
  onBrushPointerDown,
  onBrushPointerMove,
  onBrushPointerUp,
  onMarqueePointerDown,
  onMarqueePointerMove,
  onMarqueePointerUp,
  onBedUnplace,
  onBedEdit,
  onBedDelete
}: LocationLayoutCanvasProps): JSX.Element {
  const interactive = mode === 'position';
  const isPlanting = mode === 'plants';
  const showCrops = mode === 'read' && showPlants && cropsByBed !== undefined;
  const showPlacementLayer = isPlanting && cropsByBed !== undefined;
  const floor = floorBounds(viewBox, floorWidth, floorHeight);
  const selectedBed = beds.find((bed) => bed.id === selectedId);
  const showGrid =
    (mode === 'read' || mode === 'plants') && gridLayers !== null;
  const gridBeds = selectedBed ? [selectedBed] : beds;
  const dragRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const surfaceDownRef = useRef<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const transformGroupRef = useRef<SVGGElement>(null);
  const cropDragActiveRef = useRef(false);
  const surfaceGestureRef = useRef<'brush' | 'select' | 'pan' | null>(null);

  const [containerSize, setContainerSize] = useState<{
    readonly width: number;
    readonly height: number;
  }>({ width: 800, height: 600 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof ResizeObserver === 'undefined') return;

    const update = () => {
      const rect = svg.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  const bedAnchor = useMemo<AnchorPoint | null>(() => {
    if (mode !== 'position' || !selectedId) return null;
    const bed = beds.find((b) => b.id === selectedId);
    if (!bed) return null;

    const vertices = rotatedRectVertices(bed);
    const center = centroid(vertices);
    const vbCenter = viewBoxCenter(viewBox);
    const bounds = viewBoxBounds(viewBox);
    const vw = bounds ? bounds.maxX - bounds.minX : 1000;

    const svgWidth = containerSize.width;
    const svgHeight = containerSize.height;
    const scale = (svgWidth / vw) * viewport.zoom;

    const screenX =
      svgWidth / 2 + viewport.panX + (center.x - vbCenter.x) * scale;
    const screenY =
      svgHeight / 2 + viewport.panY + (center.y - vbCenter.y) * scale;

    return {
      x: Math.round(screenX),
      y: Math.max(30, Math.round(screenY))
    };
  }, [
    mode,
    selectedId,
    beds,
    viewBox,
    containerSize.width,
    containerSize.height,
    viewport.zoom,
    viewport.panX,
    viewport.panY
  ]);

  const clientToGlobal = (clientX: number, clientY: number): Point | null => {
    const group = transformGroupRef.current;
    const ctm = group?.getScreenCTM?.();
    if (!ctm || typeof DOMPoint === 'undefined') return null;
    const point = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: point.x, y: point.y };
  };

  const handlePlacementDragOver = (event: DragEvent<SVGSVGElement>): void => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    const global = clientToGlobal(event.clientX, event.clientY);
    if (global) onPlacementDragOver?.(global);
  };

  const handlePlacementDrop = (event: DragEvent<SVGSVGElement>): void => {
    event.preventDefault();
    const plantId = readDraggedPlantId(event.dataTransfer);
    const global = clientToGlobal(event.clientX, event.clientY);
    if (plantId && global) onPlacementDrop?.(global, plantId);
  };

  const handleCropPointerDown = (
    cropId: string,
    bedId: string,
    event: PointerEvent<SVGGElement>
  ): void => {
    if (isPlanting && toolMode === 'select') {
      return;
    }
    event.stopPropagation();
    onCropSelect?.(cropId);
    const global = clientToGlobal(event.clientX, event.clientY);
    if (!global || !onCropDragStart) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    cropDragActiveRef.current = true;
    onCropDragStart(cropId, bedId, global);
  };

  const handleCropPointerMove = (event: PointerEvent<SVGGElement>): void => {
    if (!cropDragActiveRef.current) return;
    const global = clientToGlobal(event.clientX, event.clientY);
    if (global) onCropDragMove?.(global);
  };

  const handleCropPointerUp = (event: PointerEvent<SVGGElement>): void => {
    if (!cropDragActiveRef.current) return;
    cropDragActiveRef.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const global = clientToGlobal(event.clientX, event.clientY);
    if (global) onCropDragEnd?.(global);
  };

  const startSurfacePan = (event: PointerEvent<SVGSVGElement>): void => {
    surfaceGestureRef.current = 'pan';
    surfaceDownRef.current = { x: event.clientX, y: event.clientY };
    viewport.onPointerDown(event);
  };

  const handleSurfacePointerDown = (
    event: PointerEvent<SVGSVGElement>
  ): void => {
    if (isPlanting && (toolMode === 'brush' || toolMode === 'select')) {
      const global = clientToGlobal(event.clientX, event.clientY);
      const insideBed = global ? findBedAtPoint(beds, global) : null;
      if (!global || !insideBed) {
        startSurfacePan(event);
        return;
      }
      if (insideBed.id !== selectedId) {
        onSelectBed?.(insideBed.id);
        return;
      }
      if (toolMode === 'brush') {
        surfaceGestureRef.current = 'brush';
        onBrushPointerDown?.(global);
      } else {
        surfaceGestureRef.current = 'select';
        onMarqueePointerDown?.(global, event.shiftKey);
      }
      return;
    }
    startSurfacePan(event);
  };

  const handleSurfacePointerMove = (
    event: PointerEvent<SVGSVGElement>
  ): void => {
    if (isPlanting && (toolMode === 'brush' || toolMode === 'select')) {
      if (surfaceGestureRef.current === 'pan') {
        viewport.onPointerMove(event);
        return;
      }
      const global = clientToGlobal(event.clientX, event.clientY);
      if (!global) return;
      if (toolMode === 'brush') onBrushPointerMove?.(global);
      else onMarqueePointerMove?.(global, event.shiftKey);
      return;
    }
    viewport.onPointerMove(event);
  };

  const handleSurfacePointerUp = (event: PointerEvent<SVGSVGElement>): void => {
    if (isPlanting && (toolMode === 'brush' || toolMode === 'select')) {
      const gesture = surfaceGestureRef.current;
      surfaceGestureRef.current = null;
      if (gesture === 'pan') {
        viewport.onPointerUp(event);
        const panStart = surfaceDownRef.current;
        surfaceDownRef.current = null;
        if (panStart) {
          const panDistance = Math.hypot(
            event.clientX - panStart.x,
            event.clientY - panStart.y
          );
          if (panDistance <= CLICK_MOVE_THRESHOLD_PX) onDeselect?.();
        }
        return;
      }
      if (toolMode === 'brush') onBrushPointerUp?.();
      else onMarqueePointerUp?.();
      return;
    }
    viewport.onPointerUp(event);
    const start = surfaceDownRef.current;
    surfaceDownRef.current = null;
    if (!start) return;
    const movedDistance = Math.hypot(
      event.clientX - start.x,
      event.clientY - start.y
    );
    if (movedDistance > CLICK_MOVE_THRESHOLD_PX) return;
    if (isPlanting) {
      const global = clientToGlobal(event.clientX, event.clientY);
      if (global) {
        const insideBed = findBedAtPoint(beds, global);
        if (insideBed) onSelectBed?.(insideBed.id);
        else onDeselect?.();
        onPlacementTap?.(global);
      }
      return;
    }
    onDeselect?.();
  };
  const center = viewBoxCenter(viewBox);
  const transform = `translate(${viewport.panX}, ${viewport.panY}) translate(${center.x}, ${center.y}) scale(${viewport.zoom}) translate(${-center.x}, ${-center.y})`;

  const handleBedPointerDown = (
    id: string,
    event: PointerEvent<SVGGElement>
  ): void => {
    event.stopPropagation();
    onSelectBed?.(id);
    if (!interactive) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { id, x: event.clientX, y: event.clientY };
  };

  const handleBedPointerMove = (event: PointerEvent<SVGGElement>): void => {
    const drag = dragRef.current;
    if (!drag) return;
    const dxPixels = event.clientX - drag.x;
    const dyPixels = event.clientY - drag.y;
    dragRef.current = { id: drag.id, x: event.clientX, y: event.clientY };
    onBedMove?.(
      drag.id,
      pixelToCm(dxPixels, viewport.zoom),
      pixelToCm(dyPixels, viewport.zoom)
    );
  };

  const handleBedPointerUp = (event: PointerEvent<SVGGElement>): void => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  };

  const handleLostPointerCapture = (): void => {
    dragRef.current = null;
  };

  const handleBedKeyDown = (
    id: string,
    event: KeyboardEvent<SVGGElement>
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectBed?.(id);
      return;
    }
    if (!interactive) return;
    const step = event.shiftKey ? COARSE_STEP_CM : FINE_STEP_CM;
    const moves: Record<string, [number, number]> = {
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0]
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      onBedMove?.(id, move[0], move[1]);
      return;
    }
    if (event.key === ']') onBedRotate?.(id, ROTATE_STEP_DEGREES);
    if (event.key === '[') onBedRotate?.(id, -ROTATE_STEP_DEGREES);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        className={`location-layout-canvas__svg ${
          viewport.isDragging ? 'location-layout-canvas__svg--dragging' : ''
        }`}
        role="img"
        aria-label={label}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={handleSurfacePointerDown}
        onPointerMove={handleSurfacePointerMove}
        onPointerUp={handleSurfacePointerUp}
        onDoubleClick={viewport.resetZoom}
        onDragOver={isPlanting ? handlePlacementDragOver : undefined}
        onDragLeave={isPlanting ? onPlacementDragLeave : undefined}
        onDrop={isPlanting ? handlePlacementDrop : undefined}
      >
        {floor && (
          <defs>
            <pattern
              id={FLOOR_DOT_PATTERN_ID}
              x={0}
              y={0}
              width={GRID_SPACING_CM}
              height={GRID_SPACING_CM}
              patternUnits="userSpaceOnUse"
            >
              <circle
                className="location-layout-canvas__floor-dot"
                cx={0}
                cy={0}
                r={1.4}
              />
            </pattern>
          </defs>
        )}
        <g ref={transformGroupRef} transform={transform}>
          {floor && (
            <rect
              className="location-layout-canvas__floor"
              x={floor.minX}
              y={floor.minY}
              width={floor.maxX - floor.minX}
              height={floor.maxY - floor.minY}
              fill={`url(#${FLOOR_DOT_PATTERN_ID})`}
              pointerEvents="none"
            />
          )}
          {beds.map((bed) => {
            const vertices = rotatedRectVertices(bed);
            const center = centroid(vertices);
            const isSelected = bed.id === selectedId;
            const bedLabel = t('bed.layout.bed_label', {
              name: bed.name,
              width: String(bed.width),
              height: String(bed.height)
            });

            return (
              <g
                key={bed.id}
                className={`location-layout-canvas__bed ${
                  isSelected ? 'location-layout-canvas__bed--selected' : ''
                }`}
                data-bed-id={bed.id}
                role="button"
                tabIndex={0}
                aria-label={bedLabel}
                aria-pressed={isSelected}
                onPointerDown={
                  isPlanting
                    ? undefined
                    : (event) => handleBedPointerDown(bed.id, event)
                }
                onPointerMove={interactive ? handleBedPointerMove : undefined}
                onPointerUp={interactive ? handleBedPointerUp : undefined}
                onLostPointerCapture={
                  interactive ? handleLostPointerCapture : undefined
                }
                onKeyDown={(event) => handleBedKeyDown(bed.id, event)}
              >
                <polygon
                  className="location-layout-canvas__rect"
                  points={toPoints(vertices)}
                />
                {showNames && (
                  <text
                    className="location-layout-canvas__name"
                    x={center.x}
                    y={center.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {bed.name}
                  </text>
                )}
              </g>
            );
          })}
          {selectedBed && showDimensions && (
            <g
              className="location-layout-canvas__dimensions"
              transform={`translate(${selectedBed.position.x} ${selectedBed.position.y}) rotate(${selectedBed.rotation})`}
              pointerEvents="none"
            >
              <LayoutBedDimensions
                width={selectedBed.width}
                height={selectedBed.height}
              />
            </g>
          )}
          {selectedBed && showCardinalOrientation && (
            <g
              className="location-layout-canvas__cardinal-labels"
              transform={`translate(${selectedBed.position.x} ${selectedBed.position.y}) rotate(${selectedBed.rotation})`}
              pointerEvents="none"
            >
              <LayoutBedCardinalEdgeLabels
                width={selectedBed.width}
                height={selectedBed.height}
                cardinals={getBedEdgeCardinals(
                  calculateNetAzimuth(northAngle, selectedBed.rotation)
                )}
                zoom={viewport.zoom}
              />
            </g>
          )}
          {showGrid &&
            gridLayers &&
            gridBeds.map((bed) => (
              <g
                key={`grid-${bed.id}`}
                className="location-layout-canvas__grid-overlay"
                transform={`translate(${bed.position.x} ${bed.position.y}) rotate(${bed.rotation})`}
                pointerEvents="none"
              >
                <BedGridLayers
                  width={bed.width}
                  height={bed.height}
                  activeLayers={gridLayers}
                />
              </g>
            ))}
          {showCrops && cropsByBed && (
            <LocationCropsLayer beds={beds} cropsByBed={cropsByBed} />
          )}
          {showPlacementLayer && cropsByBed && (
            <LocationPlacementLayer
              beds={beds}
              cropsByBed={cropsByBed}
              selectedCropId={selectedCropId}
              selectedCropIds={selectedCropIds}
              preview={placementPreview}
              brushDirectrix={brushDirectrix}
              brushCandidates={brushCandidates}
              isBrushDrawing={isBrushDrawing}
              brushBedId={brushBedId}
              boundingBox={boundingBox}
              boundingBoxBedId={boundingBoxBedId}
              marqueeBox={marqueeBox}
              marqueeBedId={marqueeBedId}
              groupMovePreview={groupMovePreview}
              onSelectCrop={(cropId) => onCropSelect?.(cropId)}
              onCropClick={onCropClick}
              onCropPointerDown={handleCropPointerDown}
              onCropPointerMove={handleCropPointerMove}
              onCropPointerUp={handleCropPointerUp}
            />
          )}
        </g>
      </svg>
      {interactive && selectedId && bedAnchor && (
        <FloatingObjectActions
          anchor={bedAnchor}
          kind="bed"
          onRotate={() => onBedRotate?.(selectedId, 90)}
          onUnplace={onBedUnplace}
          onEdit={onBedEdit}
          onDelete={onBedDelete}
        />
      )}
    </div>
  );
}
