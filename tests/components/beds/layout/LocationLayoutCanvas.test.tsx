import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import LocationLayoutCanvas from '../../../../src/components/beds/layout/LocationLayoutCanvas';
import type { BedViewportState } from '../../../../src/components/beds/visualizer/hooks/useBedViewport';
import type { ResolvedBed } from '../../../../src/components/beds/layout/utils/layoutTypes';

function buildViewport(): BedViewportState {
  return {
    zoom: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetZoom: vi.fn(),
    panBy: vi.fn(),
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

describe('LocationLayoutCanvas', () => {
  it('renders an accessible image with the provided label', () => {
    render(
      <LocationLayoutCanvas
        beds={BEDS}
        viewBox="0 0 400 400"
        label="Layout of Huerto"
        mode="read"
        viewport={buildViewport()}
      />
    );

    expect(
      screen.getByRole('img', { name: 'Layout of Huerto' })
    ).toBeInTheDocument();
  });

  it('draws one scaled polygon per placed bed respecting orientation', () => {
    const { container } = render(
      <LocationLayoutCanvas
        beds={BEDS}
        viewBox="0 0 400 400"
        label="Layout"
        mode="read"
        viewport={buildViewport()}
      />
    );

    const polygons = container.querySelectorAll('polygon');
    expect(polygons).toHaveLength(2);
    expect(polygons[0]?.getAttribute('points')).toBe('0,0 100,0 100,50 0,50');
  });

  it('shows each bed name', () => {
    render(
      <LocationLayoutCanvas
        beds={BEDS}
        viewBox="0 0 400 400"
        label="Layout"
        mode="read"
        viewport={buildViewport()}
      />
    );

    expect(screen.getByText('Tomates')).toBeInTheDocument();
    expect(screen.getByText('Lechugas')).toBeInTheDocument();
  });

  it('allows selecting beds in read mode without dragging them', () => {
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
    fireEvent.pointerDown(bed, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(bed, { pointerId: 1, clientX: 10, clientY: -4 });

    expect(onSelectBed).toHaveBeenCalledWith('bed-1');
    expect(onBedMove).not.toHaveBeenCalled();
  });

  it('exposes selectable draggable beds in position mode', () => {
    const onSelectBed = vi.fn();
    const onBedMove = vi.fn();

    render(
      <LocationLayoutCanvas
        beds={BEDS}
        viewBox="0 0 400 400"
        label="Layout"
        mode="position"
        viewport={buildViewport()}
        onSelectBed={onSelectBed}
        onBedMove={onBedMove}
      />
    );

    const bed = screen.getByRole('button', { name: /Tomates/ });
    fireEvent.pointerDown(bed, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(bed, { pointerId: 1, clientX: 10, clientY: -4 });

    expect(onSelectBed).toHaveBeenCalledWith('bed-1');
    expect(onBedMove).toHaveBeenCalledWith('bed-1', 10, -4);
  });

  it.each([
    [{ key: 'ArrowRight', shiftKey: false }, 5, 0],
    [{ key: 'ArrowUp', shiftKey: true }, 0, -25]
  ] as const)(
    'moves the selected bed on $0.key with shiftKey=$0.shiftKey',
    (eventInit, expectedDx, expectedDy) => {
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
      fireEvent.keyDown(bed, eventInit);

      expect(onBedMove).toHaveBeenCalledWith('bed-1', expectedDx, expectedDy);
    }
  );

  it.each([
    [']', 1],
    ['[', -1]
  ] as const)(
    'rotates the selected bed with "%s" key',
    (key, expectedDelta) => {
      const onBedRotate = vi.fn();

      render(
        <LocationLayoutCanvas
          beds={BEDS}
          viewBox="0 0 400 400"
          label="Layout"
          mode="position"
          selectedId="bed-1"
          viewport={buildViewport()}
          onBedRotate={onBedRotate}
        />
      );

      const bed = screen.getByRole('button', { name: /Tomates/ });
      fireEvent.keyDown(bed, { key });

      expect(onBedRotate).toHaveBeenCalledWith('bed-1', expectedDelta);
    }
  );

  it('renders cardinal edge labels only for the selected bed when enabled', () => {
    const { container } = render(
      <LocationLayoutCanvas
        beds={BEDS}
        viewBox="0 0 400 400"
        label="Layout"
        mode="read"
        selectedId="bed-1"
        northAngle={0}
        showCardinalOrientation={true}
        viewport={buildViewport()}
      />
    );

    const badges = container.querySelectorAll(
      '.layout-bed-cardinal-labels__badge'
    );
    expect(badges).toHaveLength(4);
  });

  it('does not render cardinal edge labels when no bed is selected', () => {
    const { container } = render(
      <LocationLayoutCanvas
        beds={BEDS}
        viewBox="0 0 400 400"
        label="Layout"
        mode="read"
        selectedId={null}
        northAngle={0}
        showCardinalOrientation={true}
        viewport={buildViewport()}
      />
    );

    const badges = container.querySelectorAll(
      '.layout-bed-cardinal-labels__badge'
    );
    expect(badges).toHaveLength(0);
  });

  it('does not render cardinal edge labels when cardinal orientation is disabled even if a bed is selected', () => {
    const { container } = render(
      <LocationLayoutCanvas
        beds={BEDS}
        viewBox="0 0 400 400"
        label="Layout"
        mode="read"
        selectedId="bed-1"
        northAngle={0}
        showCardinalOrientation={false}
        viewport={buildViewport()}
      />
    );

    const badges = container.querySelectorAll(
      '.layout-bed-cardinal-labels__badge'
    );
    expect(badges).toHaveLength(0);
  });
});
