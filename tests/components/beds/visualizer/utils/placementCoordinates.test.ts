import { describe, expect, it } from 'vitest';

import {
  bedToScreenCoordinates,
  screenToBedCoordinates,
  type PlacementViewport
} from '../../../../../src/components/beds/visualizer/utils/placementCoordinates';

const IDENTITY_VIEWPORT: PlacementViewport = {
  rectLeft: 0,
  rectTop: 0,
  panX: 0,
  panY: 0,
  zoom: 1,
  centerX: 400,
  centerY: 300,
  originX: 100,
  originY: 50,
  scale: 2
};

describe('screenToBedCoordinates', () => {
  it('converts a screen pixel into bed centimeters using origin and scale', () => {
    const result = screenToBedCoordinates(140, 90, IDENTITY_VIEWPORT);

    expect(result).toEqual({ x: 20, y: 20 });
  });

  it('compensates for pan offset when translating to bed coordinates', () => {
    const viewport: PlacementViewport = {
      ...IDENTITY_VIEWPORT,
      panX: 40,
      panY: 20
    };

    const result = screenToBedCoordinates(180, 110, viewport);

    expect(result).toEqual({ x: 20, y: 20 });
  });

  it('compensates for zoom when translating to bed coordinates', () => {
    const viewport: PlacementViewport = { ...IDENTITY_VIEWPORT, zoom: 2 };

    const result = screenToBedCoordinates(
      viewport.centerX,
      viewport.centerY,
      viewport
    );

    expect(result).toEqual({ x: 150, y: 125 });
  });

  it.each<{ readonly snap: number; readonly x: number }>([
    { snap: 1, x: 21 },
    { snap: 0.5, x: 20.5 }
  ])('rounds the result to a $snap cm grid', ({ snap, x }) => {
    const result = screenToBedCoordinates(141, 90, IDENTITY_VIEWPORT, snap);

    expect(result.x).toBe(x);
  });
});

describe('bedToScreenCoordinates', () => {
  it('is the inverse of screenToBedCoordinates', () => {
    const screen = bedToScreenCoordinates(20, 20, IDENTITY_VIEWPORT);

    expect(screen).toEqual({ x: 140, y: 90 });

    const bed = screenToBedCoordinates(screen.x, screen.y, IDENTITY_VIEWPORT);

    expect(bed).toEqual({ x: 20, y: 20 });
  });
});
