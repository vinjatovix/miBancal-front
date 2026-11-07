import { useCallback, useEffect, useRef, useState, type JSX } from 'react';

import { t } from '../../../i18n/core/t';
import type { Bed } from '../../../types/Bed/Bed';
import BedDimensionLines from './BedDimensionLines';
import BedGridLayers from './BedGridLayers';
import BedViewportControls from './BedViewportControls';
import { useBedViewport } from './hooks/useBedViewport';
import { calculateBedGeometry } from './utils/bedGeometry';
import type { ActiveGridLayers } from './utils/bedGridConfig';

import './bedVisualizerCanvas.css';

export interface BedVisualizerCanvasProps {
  readonly bed: Bed;
  readonly activeLayers: ActiveGridLayers;
}

export default function BedVisualizerCanvas({
  bed,
  activeLayers
}: BedVisualizerCanvasProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState<{
    readonly width: number;
    readonly height: number;
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewport = useBedViewport();

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = (width: number, height: number) => {
      const roundedWidth = Math.round(width);
      const roundedHeight = Math.round(height);
      if (roundedWidth > 0 && roundedHeight > 0) {
        setContainerDimensions((prev) => {
          if (
            prev &&
            prev.width === roundedWidth &&
            prev.height === roundedHeight
          ) {
            return prev;
          }
          return { width: roundedWidth, height: roundedHeight };
        });
      }
    };

    const rect = container.getBoundingClientRect();
    updateDimensions(rect.width, rect.height);

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      updateDimensions(entry.contentRect.width, entry.contentRect.height);
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void containerRef.current?.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  }, []);

  const cx = geometry.containerWidth / 2;
  const cy = geometry.containerHeight / 2;
  const svgTransform = `translate(${viewport.panX}, ${viewport.panY}) translate(${cx}, ${cy}) scale(${viewport.zoom}) translate(${-cx}, ${-cy})`;

  return (
    <div ref={containerRef} className="bed-visualizer-canvas">
      <svg
        className={`bed-visualizer-canvas__svg ${
          viewport.isDragging ? 'bed-visualizer-canvas__svg--dragging' : ''
        }`}
        role="img"
        aria-label={canvasLabel}
        viewBox={geometry.viewBox}
        onPointerDown={viewport.onPointerDown}
        onPointerMove={viewport.onPointerMove}
        onPointerUp={viewport.onPointerUp}
        onWheel={viewport.onWheel}
        onDoubleClick={viewport.resetZoom}
      >
        <g transform={svgTransform}>
          <BedDimensionLines geometry={geometry} />
          <g
            className="bed-canvas__bed-layer"
            transform={`translate(${geometry.originX} ${geometry.originY}) scale(${geometry.scale})`}
          >
            <rect
              className="bed-canvas__bed-rect"
              x={0}
              y={0}
              width={largo}
              height={ancho}
              rx={2}
              ry={2}
            />
            <BedGridLayers
              width={largo}
              height={ancho}
              activeLayers={activeLayers}
            />
          </g>
        </g>
      </svg>
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
