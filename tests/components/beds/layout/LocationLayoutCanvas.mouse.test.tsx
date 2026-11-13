import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LocationLayoutCanvas from '../../../../src/components/beds/layout/LocationLayoutCanvas';
import type { BedViewportState } from '../../../../src/components/beds/visualizer/hooks/useBedViewport';
import type { ResolvedBed } from '../../../../src/components/beds/layout/utils/layoutTypes';

function buildViewport(): BedViewportState {
  return {
    zoom: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    zoomPercent: 100,
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetZoom: vi.fn(),
    fitToBounds: vi.fn(),
    panBy: vi.fn(),
    animateTo: vi.fn(),
    compensateWidthChange: vi.fn(),
    onPointerDown: vi.fn(),
    onPointerMove: vi.fn(),
    onPointerUp: vi.fn(),
    onWheel: vi.fn()
  };
}

const BEDS: readonly ResolvedBed[] = [
  {
    id: 'bed-1',
    name: 'Tomates',
    width: 100,
    height: 50,
    position: { x: 0, y: 0 },
    rotation: 0
  },
  {
    id: 'bed-2',
    name: 'Lechugas',
    width: 80,
    height: 80,
    position: { x: 200, y: 200 },
    rotation: 0
  }
];

describe('LocationLayoutCanvas mouse non-regression', () => {
  const originalDOMPoint = globalThis.DOMPoint;

  beforeEach(() => {
    class IdentityDOMPoint {
      x: number;
      y: number;
      constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
      }
      matrixTransform(): { x: number; y: number } {
        return { x: this.x, y: this.y };
      }
    }
    globalThis.DOMPoint = IdentityDOMPoint as unknown as typeof DOMPoint;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (SVGElement.prototype as any).getScreenCTM = () => ({
      inverse: () => ({})
    });
  });

  afterEach(() => {
    globalThis.DOMPoint = originalDOMPoint;
  });

  it('selects a bed with a mouse click without moving it', () => {
    const onSelectBed = vi.fn();
    const onBedMove = vi.fn();

    render(
      <LocationLayoutCanvas
        beds={BEDS}
        viewBox="0 0 400 400"
        label="Layout"
        mode="read"
        viewport={buildViewport()}
        onSelectBed={onSelectBed}
        onBedMove={onBedMove}
      />
    );

    const bed = screen.getByRole('button', { name: /Tomates/ });
    fireEvent.pointerDown(bed, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 0,
      clientY: 0
    });
    fireEvent.pointerMove(bed, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 3,
      clientY: 2
    });

    expect(onSelectBed).toHaveBeenCalledWith('bed-1');
    expect(onBedMove).not.toHaveBeenCalled();
  });

  it('drags a bed directly with the mouse without a long press', () => {
    const onBedDragStart = vi.fn();
    const onBedDragMove = vi.fn();
    const onBedDragEnd = vi.fn();

    render(
      <LocationLayoutCanvas
        beds={BEDS}
        viewBox="0 0 400 400"
        label="Layout"
        mode="position"
        viewport={buildViewport()}
        onBedDragStart={onBedDragStart}
        onBedDragMove={onBedDragMove}
        onBedDragEnd={onBedDragEnd}
      />
    );

    const bed = screen.getByRole('button', { name: /Tomates/ });
    fireEvent.pointerDown(bed, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 0,
      clientY: 0
    });
    fireEvent.pointerMove(bed, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 10,
      clientY: -4
    });
    fireEvent.pointerUp(bed, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 10,
      clientY: -4
    });

    expect(onBedDragStart).toHaveBeenCalledWith('bed-1', 'mouse');
    expect(onBedDragMove).toHaveBeenCalledWith(10, -4);
    expect(onBedDragEnd).toHaveBeenCalledTimes(1);
  });

  it('moves the selected bed with the keyboard', () => {
    const onBedMove = vi.fn();

    render(
      <LocationLayoutCanvas
        beds={BEDS}
        viewBox="0 0 400 400"
        label="Layout"
        mode="position"
        selectedId="bed-1"
        viewport={buildViewport()}
        onBedMove={onBedMove}
      />
    );

    const bed = screen.getByRole('button', { name: /Tomates/ });
    fireEvent.keyDown(bed, { key: 'ArrowRight' });

    expect(onBedMove).toHaveBeenCalledWith('bed-1', 5, 0);
  });

  it('runs a marquee selection with the mouse in select tool mode', () => {
    const onMarqueePointerDown = vi.fn();
    const onMarqueePointerMove = vi.fn();
    const onMarqueePointerUp = vi.fn();

    render(
      <LocationLayoutCanvas
        beds={BEDS}
        viewBox="0 0 400 400"
        label="Layout"
        mode="plants"
        selectedId="bed-1"
        toolMode="select"
        cropsByBed={new Map()}
        viewport={buildViewport()}
        onMarqueePointerDown={onMarqueePointerDown}
        onMarqueePointerMove={onMarqueePointerMove}
        onMarqueePointerUp={onMarqueePointerUp}
      />
    );

    const svg = screen.getByRole('img', { name: 'Layout' });
    fireEvent.pointerDown(svg, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 10,
      clientY: 10
    });
    fireEvent.pointerMove(svg, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 40,
      clientY: 40
    });
    fireEvent.pointerUp(svg, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 40,
      clientY: 40
    });

    expect(onMarqueePointerDown).toHaveBeenCalledTimes(1);
    expect(onMarqueePointerMove).toHaveBeenCalledTimes(1);
    expect(onMarqueePointerUp).toHaveBeenCalledTimes(1);
  });

  it('pans with the mouse by forwarding surface pointer events to the viewport', () => {
    const viewport = buildViewport();

    render(
      <LocationLayoutCanvas
        beds={BEDS}
        viewBox="0 0 400 400"
        label="Layout"
        mode="read"
        viewport={viewport}
      />
    );

    const svg = screen.getByRole('img', { name: 'Layout' });
    fireEvent.pointerDown(svg, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 100,
      clientY: 100
    });
    fireEvent.pointerMove(svg, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 140,
      clientY: 120
    });
    fireEvent.pointerUp(svg, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 140,
      clientY: 120
    });

    expect(viewport.onPointerDown).toHaveBeenCalledTimes(1);
    expect(viewport.onPointerMove).toHaveBeenCalledTimes(1);
    expect(viewport.onPointerUp).toHaveBeenCalledTimes(1);
  });

  it('resets the zoom on a mouse double click', () => {
    const viewport = buildViewport();

    render(
      <LocationLayoutCanvas
        beds={BEDS}
        viewBox="0 0 400 400"
        label="Layout"
        mode="read"
        viewport={viewport}
      />
    );

    fireEvent.doubleClick(screen.getByRole('img', { name: 'Layout' }));

    expect(viewport.resetZoom).toHaveBeenCalledTimes(1);
  });
});
