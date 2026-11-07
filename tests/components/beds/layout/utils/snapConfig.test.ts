import { describe, expect, it } from 'vitest';

import { applySnap } from '../../../../../src/components/beds/layout/utils/snapConfig';
import type { RotatedRectInput } from '../../../../../src/components/beds/layout/utils/layoutGeometry';

const neighbor: RotatedRectInput = {
  position: { x: 0, y: 0 },
  width: 100,
  height: 50,
  rotation: 0
};

describe('applySnap', () => {
  it('aligns the dragged bed edge to a nearby neighbor when enabled', () => {
    const dragged: RotatedRectInput = {
      position: { x: 108, y: 0 },
      width: 100,
      height: 50,
      rotation: 0
    };

    const result = applySnap(dragged, [neighbor], { enabled: true });

    expect(result.position.x).toBeCloseTo(100);
    expect(result.position.y).toBeCloseTo(0);
    expect(result.rotation).toBe(0);
  });

  it('copies the neighbor orientation on snap', () => {
    const rotatedNeighbor: RotatedRectInput = {
      position: { x: 0, y: 0 },
      width: 100,
      height: 50,
      rotation: 90
    };
    const dragged: RotatedRectInput = {
      position: { x: 5, y: 0 },
      width: 100,
      height: 50,
      rotation: 0
    };

    const result = applySnap(dragged, [rotatedNeighbor], { enabled: true });

    expect(result.position.x).toBeCloseTo(0);
    expect(result.rotation).toBe(90);
  });

  it('has no effect when disabled', () => {
    const dragged: RotatedRectInput = {
      position: { x: 108, y: 0 },
      width: 100,
      height: 50,
      rotation: 0
    };

    const result = applySnap(dragged, [neighbor], { enabled: false });

    expect(result).toEqual({ position: { x: 108, y: 0 }, rotation: 0 });
  });

  it('aligns on the vertical axis when the gap is below the neighbor', () => {
    const dragged: RotatedRectInput = {
      position: { x: 0, y: 58 },
      width: 100,
      height: 50,
      rotation: 0
    };

    const result = applySnap(dragged, [neighbor], { enabled: true });

    expect(result.position.x).toBeCloseTo(0);
    expect(result.position.y).toBeCloseTo(50);
  });

  it('aligns to the left edge of a neighbor', () => {
    const dragged: RotatedRectInput = {
      position: { x: -108, y: 0 },
      width: 100,
      height: 50,
      rotation: 0
    };

    const result = applySnap(dragged, [neighbor], { enabled: true });

    expect(result.position.x).toBeCloseTo(-100);
    expect(result.position.y).toBeCloseTo(0);
  });

  it('has no effect when no neighbor is within the threshold', () => {
    const dragged: RotatedRectInput = {
      position: { x: 400, y: 400 },
      width: 100,
      height: 50,
      rotation: 0
    };

    const result = applySnap(dragged, [neighbor], { enabled: true });

    expect(result).toEqual({ position: { x: 400, y: 400 }, rotation: 0 });
  });
});
