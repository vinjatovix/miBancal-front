export interface ViewportCoordinates {
  readonly zoom: number;
  readonly panX: number;
  readonly panY: number;
}

export interface TransitionOptions {
  readonly durationMs?: number;
  readonly onUpdate: (coords: ViewportCoordinates) => void;
  readonly onComplete?: () => void;
  readonly prefersReducedMotion?: boolean;
}

const DEFAULT_DURATION_MS = 280;

function checkReducedMotion(): boolean {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function cubicEaseOut(t: number): number {
  const inverted = 1 - t;
  return 1 - inverted * inverted * inverted;
}

export function animateViewportTransition(
  start: ViewportCoordinates,
  target: ViewportCoordinates,
  options: TransitionOptions
): () => void {
  const duration = options.durationMs ?? DEFAULT_DURATION_MS;
  const isReduced = options.prefersReducedMotion ?? checkReducedMotion();

  if (isReduced || duration <= 0) {
    options.onUpdate(target);
    options.onComplete?.();
    return () => {};
  }

  let frameId: number | null = null;
  const startTime = performance.now();

  const step = (now: number): void => {
    const elapsed = now - startTime;
    const progress = Math.min(1, Math.max(0, elapsed / duration));
    const eased = cubicEaseOut(progress);

    const current: ViewportCoordinates = {
      zoom: Number(
        (start.zoom + (target.zoom - start.zoom) * eased).toFixed(4)
      ),
      panX: Number(
        (start.panX + (target.panX - start.panX) * eased).toFixed(2)
      ),
      panY: Number((start.panY + (target.panY - start.panY) * eased).toFixed(2))
    };

    options.onUpdate(current);

    if (progress < 1) {
      frameId = requestAnimationFrame(step);
    } else {
      options.onUpdate(target);
      options.onComplete?.();
    }
  };

  frameId = requestAnimationFrame(step);

  return () => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
}
