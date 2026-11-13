import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LocationLayoutCanvas from '../../../../src/components/beds/layout/LocationLayoutCanvas';
import type { BedViewportState } from '../../../../src/components/beds/visualizer/hooks/useBedViewport';
import type { ResolvedBed } from '../../../../src/components/beds/layout/utils/layoutTypes';
import type { CropPlacementItem } from '../../../../src/types/PlantInstance/plantPlacementTypes';
import { buildCropPlacementItem } from '../../../fixtures/plantInstances/buildPlantInstance';

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

    const polygons = container.querySelectorAll(
      '.location-layout-canvas__rect'
    );
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
        onSelectBed={onSelectBed}
        onBedDragStart={onBedDragStart}
        onBedDragMove={onBedDragMove}
        onBedDragEnd={onBedDragEnd}
      />
    );

    const bed = screen.getByRole('button', { name: /Tomates/ });
    fireEvent.pointerDown(bed, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(bed, { pointerId: 1, clientX: 10, clientY: -4 });
    fireEvent.pointerUp(bed, { pointerId: 1, clientX: 10, clientY: -4 });

    expect(onSelectBed).toHaveBeenCalledWith('bed-1');
    expect(onBedDragStart).toHaveBeenCalledWith('bed-1', expect.any(String));
    expect(onBedDragMove).toHaveBeenCalledWith(10, -4);
    expect(onBedDragEnd).toHaveBeenCalled();
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

  describe('bed selection in planting mode', () => {
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

    function tapSurface(x: number, y: number): void {
      const svg = screen.getByRole('img', { name: 'Layout' });
      fireEvent.pointerDown(svg, { pointerId: 1, clientX: x, clientY: y });
      fireEvent.pointerUp(svg, { pointerId: 1, clientX: x, clientY: y });
    }

    it('selects the bed under a tap in planting mode', () => {
      const onSelectBed = vi.fn();
      const onDeselect = vi.fn();

      render(
        <LocationLayoutCanvas
          beds={BEDS}
          viewBox="0 0 400 400"
          label="Layout"
          mode="plants"
          selectedId={null}
          cropsByBed={new Map()}
          viewport={buildViewport()}
          onSelectBed={onSelectBed}
          onDeselect={onDeselect}
        />
      );

      tapSurface(10, 10);

      expect(onSelectBed).toHaveBeenCalledWith('bed-1');
      expect(onDeselect).not.toHaveBeenCalled();
    });

    it('deselects when tapping empty floor in planting mode', () => {
      const onSelectBed = vi.fn();
      const onDeselect = vi.fn();

      render(
        <LocationLayoutCanvas
          beds={BEDS}
          viewBox="0 0 400 400"
          label="Layout"
          mode="plants"
          selectedId="bed-1"
          cropsByBed={new Map()}
          viewport={buildViewport()}
          onSelectBed={onSelectBed}
          onDeselect={onDeselect}
        />
      );

      tapSurface(350, 10);

      expect(onDeselect).toHaveBeenCalledTimes(1);
      expect(onSelectBed).not.toHaveBeenCalled();
    });

    it('switches the active bed when tapping another bed with the select tool', () => {
      const onSelectBed = vi.fn();

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
          onSelectBed={onSelectBed}
        />
      );

      tapSurface(210, 210);

      expect(onSelectBed).toHaveBeenCalledWith('bed-2');
    });
  });

  describe('crop pointer interaction in planting mode', () => {
    const originalDOMPoint = globalThis.DOMPoint;

    const cropNear = buildCropPlacementItem({
      id: 'crop-near',
      bedId: 'bed-1',
      commonName: 'Cerca',
      position: { x: 20, y: 20 }
    });
    const cropFar = buildCropPlacementItem({
      id: 'crop-far',
      bedId: 'bed-1',
      commonName: 'Lejos',
      position: { x: 80, y: 80 }
    });
    const cropsByBed = new Map<string, readonly CropPlacementItem[]>([
      ['bed-1', [cropNear, cropFar]]
    ]);

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

    it('starts the crop drag for the crop nearest the touch, not the one tapped', () => {
      const onCropDragStart = vi.fn();
      const onCropSelect = vi.fn();

      render(
        <LocationLayoutCanvas
          beds={BEDS}
          viewBox="0 0 400 400"
          label="Layout"
          mode="plants"
          selectedId="bed-1"
          cropsByBed={cropsByBed}
          viewport={buildViewport()}
          onCropSelect={onCropSelect}
          onCropDragStart={onCropDragStart}
        />
      );

      const tappedCrop = screen.getByRole('button', { name: /Cerca/ });
      fireEvent.pointerDown(tappedCrop, {
        pointerId: 1,
        pointerType: 'touch',
        clientX: 78,
        clientY: 78
      });

      expect(onCropSelect).toHaveBeenCalledWith('crop-far');
      expect(onCropDragStart).toHaveBeenCalledWith(
        'crop-far',
        'bed-1',
        'touch'
      );
    });

    it('does not start a crop drag while the select tool is active', () => {
      const onCropDragStart = vi.fn();

      render(
        <LocationLayoutCanvas
          beds={BEDS}
          viewBox="0 0 400 400"
          label="Layout"
          mode="plants"
          selectedId="bed-1"
          toolMode="select"
          cropsByBed={cropsByBed}
          viewport={buildViewport()}
          onCropDragStart={onCropDragStart}
        />
      );

      fireEvent.pointerDown(screen.getByRole('button', { name: /Cerca/ }), {
        pointerId: 1,
        pointerType: 'touch',
        clientX: 20,
        clientY: 20
      });

      expect(onCropDragStart).not.toHaveBeenCalled();
    });
  });
});
