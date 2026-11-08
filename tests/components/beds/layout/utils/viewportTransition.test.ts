import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  animateViewportTransition,
  type ViewportCoordinates
} from '../../../../../src/components/beds/layout/utils/viewportTransition';

describe('animateViewportTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('interpolates towards the target coordinates on each animation frame', () => {
    const start: ViewportCoordinates = { zoom: 1, panX: 0, panY: 0 };
    const target: ViewportCoordinates = { zoom: 2, panX: 100, panY: 50 };
    const updates: ViewportCoordinates[] = [];

    animateViewportTransition(start, target, {
      durationMs: 300,
      onUpdate: (coords) => {
        updates.push(coords);
      }
    });

    vi.advanceTimersByTime(150);

    expect(updates.length).toBeGreaterThan(0);
    const midPoint = updates[updates.length - 1];
    expect(midPoint.zoom).toBeGreaterThan(1);
    expect(midPoint.zoom).toBeLessThan(2);
    expect(midPoint.panX).toBeGreaterThan(0);
    expect(midPoint.panX).toBeLessThan(100);
  });

  it('completes at target coordinates and triggers onComplete when duration finishes', () => {
    const start: ViewportCoordinates = { zoom: 1, panX: 0, panY: 0 };
    const target: ViewportCoordinates = { zoom: 2, panX: 100, panY: 50 };
    const onComplete = vi.fn();
    let finalCoords: ViewportCoordinates | null = null;

    animateViewportTransition(start, target, {
      durationMs: 300,
      onUpdate: (coords) => {
        finalCoords = coords;
      },
      onComplete
    });

    vi.advanceTimersByTime(350);

    expect(finalCoords).toEqual(target);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('immediately applies target coordinates when prefersReducedMotion option is true', () => {
    const start: ViewportCoordinates = { zoom: 1, panX: 0, panY: 0 };
    const target: ViewportCoordinates = { zoom: 2, panX: 100, panY: 50 };
    const onComplete = vi.fn();
    const updates: ViewportCoordinates[] = [];

    animateViewportTransition(start, target, {
      durationMs: 300,
      prefersReducedMotion: true,
      onUpdate: (coords) => {
        updates.push(coords);
      },
      onComplete
    });

    expect(updates).toEqual([target]);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('immediately applies target coordinates when system prefers reduced motion', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
    const start: ViewportCoordinates = { zoom: 1, panX: 0, panY: 0 };
    const target: ViewportCoordinates = { zoom: 2, panX: 100, panY: 50 };
    const updates: ViewportCoordinates[] = [];

    try {
      animateViewportTransition(start, target, {
        durationMs: 300,
        onUpdate: (coords) => {
          updates.push(coords);
        }
      });

      expect(updates).toEqual([target]);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('cancels the animation and stops further updates when returned cancel function is called', () => {
    const start: ViewportCoordinates = { zoom: 1, panX: 0, panY: 0 };
    const target: ViewportCoordinates = { zoom: 2, panX: 100, panY: 50 };
    const onComplete = vi.fn();
    const updates: ViewportCoordinates[] = [];

    const cancel = animateViewportTransition(start, target, {
      durationMs: 300,
      onUpdate: (coords) => {
        updates.push(coords);
      },
      onComplete
    });

    vi.advanceTimersByTime(100);
    const countAtCancel = updates.length;
    cancel();
    vi.advanceTimersByTime(250);

    expect(updates.length).toBe(countAtCancel);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
