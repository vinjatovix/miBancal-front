import { useEffect, useRef, useState, type JSX } from 'react';

import { GRID_SPACING_CM } from './utils/snapConfig';

import './layoutScaleBar.css';

export interface LayoutScaleBarProps {
  readonly viewBox: string;
  readonly zoom: number;
}

const TARGET_PX = 120;

interface Size {
  readonly width: number;
  readonly height: number;
}

function parseViewBox(viewBox: string): Size | null {
  const [, , width, height] = viewBox.split(/\s+/).map(Number);
  if (![width, height].every((value) => Number.isFinite(value) && value > 0)) {
    return null;
  }
  return { width, height };
}

function gridMultipleCm(raw: number): number {
  if (raw <= GRID_SPACING_CM) return GRID_SPACING_CM;
  return Math.round(raw / GRID_SPACING_CM) * GRID_SPACING_CM;
}

function formatDistance(cm: number): string {
  if (cm >= 100) return `${cm / 100} m`;
  return `${cm} cm`;
}

export default function LayoutScaleBar({
  viewBox,
  zoom
}: LayoutScaleBarProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = (width: number, height: number): void => {
      setSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height }
      );
    };

    const rect = element.getBoundingClientRect();
    update(rect.width, rect.height);

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      update(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const parsed = parseViewBox(viewBox);
  const pxPerViewBoxUnit =
    parsed && size.width > 0 && size.height > 0
      ? Math.min(size.width / parsed.width, size.height / parsed.height)
      : 0;
  const pxPerCm = pxPerViewBoxUnit * zoom;

  const hasScale = Number.isFinite(pxPerCm) && pxPerCm > 0;
  const lengthCm = hasScale ? gridMultipleCm(TARGET_PX / pxPerCm) : 0;
  const barPx = hasScale ? lengthCm * pxPerCm : 0;

  return (
    <div className="layout-scale-bar" ref={ref} aria-hidden="true">
      {hasScale && (
        <div
          className="layout-scale-bar__ruler"
          style={{ width: `${barPx}px` }}
        >
          <span className="layout-scale-bar__label">
            {formatDistance(lengthCm)}
          </span>
        </div>
      )}
    </div>
  );
}
