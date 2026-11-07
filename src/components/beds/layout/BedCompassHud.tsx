import {
  type JSX,
  type KeyboardEvent,
  type PointerEvent,
  useRef,
  useState
} from 'react';

import { t } from '../../../i18n/core/t';
import type { I18nKey } from '../../../i18n/core/types';
import Button from '../../../shared/components/Button/Button';
import {
  getCardinalWind,
  normalizeAngle,
  type CardinalWind8
} from './utils/cardinalGeometry';

import './bedCompassHud.css';

export interface BedCompassHudProps {
  readonly northAngle: number | null;
  readonly bedAzimuth: number | null;
  readonly mode: 'read' | 'position';
  readonly onBedRotationChange?: (newRotation: number) => void;
  readonly onNorthAngleChange?: (newNorthAngle: number) => void;
  readonly onSaveNorthAngle?: () => void;
  readonly isSavingNorth?: boolean;
}

const CENTER = 48;
const RADIUS = 40;

const WIND_MESSAGE_KEYS: Record<CardinalWind8, I18nKey> = {
  north: 'bed.cardinal.wind_north',
  northeast: 'bed.cardinal.wind_northeast',
  east: 'bed.cardinal.wind_east',
  southeast: 'bed.cardinal.wind_southeast',
  south: 'bed.cardinal.wind_south',
  southwest: 'bed.cardinal.wind_southwest',
  west: 'bed.cardinal.wind_west',
  northwest: 'bed.cardinal.wind_northwest'
};

function getWindName(angle: number): string {
  const windKey = getCardinalWind(angle);
  return t(WIND_MESSAGE_KEYS[windKey]);
}

function computePointerAngle(
  clientX: number,
  clientY: number,
  dial: HTMLElement,
  shiftKey: boolean
): number | null {
  const rect = dial.getBoundingClientRect();
  const width = rect.width || 96;
  const height = rect.height || 96;
  const centerX = rect.left + width / 2;
  const centerY = rect.top + height / 2;
  const dx = clientX - centerX;
  const dy = clientY - centerY;

  if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return null;

  const rad = Math.atan2(dx, -dy);
  let deg = Math.round((rad * 180) / Math.PI);
  if (shiftKey) {
    deg = Math.round(deg / 15) * 15;
  }
  return normalizeAngle(deg);
}

export default function BedCompassHud({
  northAngle,
  bedAzimuth,
  mode,
  onBedRotationChange,
  onNorthAngleChange,
  onSaveNorthAngle,
  isSavingNorth = false
}: BedCompassHudProps): JSX.Element {
  const dialRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const interactive = mode === 'position';
  const effectiveNorth = northAngle ?? 0;
  const isBedSelected = bedAzimuth !== null;
  const currentAngle = isBedSelected ? bedAzimuth : effectiveNorth;
  const windName = getWindName(currentAngle);

  const headingText = isBedSelected
    ? t('bed.cardinal.bed_heading_title', {
        angle: String(currentAngle),
        wind: windName
      })
    : northAngle === null || northAngle === 0
      ? t('bed.cardinal.terrain_north_default')
      : t('bed.cardinal.terrain_north_title', { angle: String(northAngle) });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!interactive) return;

    const isStepUp = event.key === 'ArrowUp' || event.key === 'ArrowRight';
    const isStepDown = event.key === 'ArrowDown' || event.key === 'ArrowLeft';
    if (!isStepUp && !isStepDown) return;

    event.preventDefault();
    const step = event.shiftKey ? 15 : 1;
    const delta = isStepUp ? step : -step;
    const nextAngle = normalizeAngle(currentAngle + delta);

    if (isBedSelected) {
      onBedRotationChange?.(nextAngle);
    } else {
      onNorthAngleChange?.(nextAngle);
    }
  };

  const updateAngleFromPointer = (
    clientX: number,
    clientY: number,
    shiftKey: boolean
  ): void => {
    const dial = dialRef.current;
    if (!dial) return;
    const nextAngle = computePointerAngle(clientX, clientY, dial, shiftKey);
    if (nextAngle === null) return;

    if (isBedSelected) {
      onBedRotationChange?.(nextAngle);
    } else {
      onNorthAngleChange?.(nextAngle);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if (!interactive || event.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (!isDragging) return;
    const start = dragStartRef.current;
    if (start) {
      const distance = Math.hypot(
        event.clientX - start.x,
        event.clientY - start.y
      );
      if (distance < 3) return;
    }
    updateAngleFromPointer(event.clientX, event.clientY, event.shiftKey);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>): void => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  };

  const handlePointerCancel = (): void => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  return (
    <aside
      className="bed-compass-hud"
      role="region"
      aria-label={t('bed.cardinal.compass_hud_label')}
    >
      <div
        ref={dialRef}
        className={`bed-compass-hud__dial ${
          interactive ? 'bed-compass-hud__dial--interactive' : ''
        } ${isDragging ? 'bed-compass-hud__dial--dragging' : ''}`}
        role="spinbutton"
        tabIndex={interactive ? 0 : -1}
        aria-readonly={!interactive ? true : undefined}
        aria-valuenow={currentAngle}
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuetext={`${currentAngle}° ${windName}`}
        aria-label={headingText}
        title={interactive ? t('bed.cardinal.compass_drag_hint') : undefined}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handlePointerCancel}
      >
        <svg
          className="bed-compass-hud__svg"
          viewBox="0 0 96 96"
          width="96"
          height="96"
          aria-hidden="true"
        >
          <circle
            className="bed-compass-hud__ring"
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
          />
          <circle
            className="bed-compass-hud__inner-ring"
            cx={CENTER}
            cy={CENTER}
            r={RADIUS - 8}
          />

          <text
            className="bed-compass-hud__cardinal-mark bed-compass-hud__cardinal-mark--n"
            x={CENTER}
            y={CENTER - RADIUS + 12}
          >
            {t('bed.cardinal.point_north')}
          </text>
          <text
            className="bed-compass-hud__cardinal-mark bed-compass-hud__cardinal-mark--e"
            x={CENTER + RADIUS - 12}
            y={CENTER}
          >
            {t('bed.cardinal.point_east')}
          </text>
          <text
            className="bed-compass-hud__cardinal-mark bed-compass-hud__cardinal-mark--s"
            x={CENTER}
            y={CENTER + RADIUS - 6}
          >
            {t('bed.cardinal.point_south')}
          </text>
          <text
            className="bed-compass-hud__cardinal-mark bed-compass-hud__cardinal-mark--o"
            x={CENTER - RADIUS + 12}
            y={CENTER}
          >
            {t('bed.cardinal.point_west')}
          </text>

          <g
            className="bed-compass-hud__needle--north"
            transform={`rotate(${effectiveNorth} ${CENTER} ${CENTER})`}
          >
            <polygon
              className="bed-compass-hud__needle-tip--north"
              points={`${CENTER},${CENTER - 26} ${CENTER - 4},${CENTER} ${CENTER + 4},${CENTER}`}
            />
            <polygon
              className="bed-compass-hud__needle-tip--south"
              points={`${CENTER},${CENTER + 26} ${CENTER - 4},${CENTER} ${CENTER + 4},${CENTER}`}
            />
          </g>

          {isBedSelected && (
            <g
              className="bed-compass-hud__needle--bed"
              transform={`rotate(${bedAzimuth} ${CENTER} ${CENTER})`}
            >
              <line
                className="bed-compass-hud__bed-line"
                x1={CENTER}
                y1={CENTER}
                x2={CENTER}
                y2={CENTER - 32}
              />
              <circle
                className="bed-compass-hud__bed-arrow"
                cx={CENTER}
                cy={CENTER - 32}
                r={3}
              />
            </g>
          )}

          <circle
            className="bed-compass-hud__pivot"
            cx={CENTER}
            cy={CENTER}
            r={3}
          />
        </svg>
      </div>

      <div className="bed-compass-hud__info">
        <span className="bed-compass-hud__title">{headingText}</span>
        {interactive && (
          <span className="bed-compass-hud__hint">
            {t('bed.cardinal.compass_drag_hint')}
          </span>
        )}
        {interactive && !isBedSelected && onSaveNorthAngle && (
          <Button
            variant="primary"
            size="sm"
            onClick={onSaveNorthAngle}
            disabled={isSavingNorth}
          >
            {isSavingNorth
              ? t('bed.cardinal.calibrating_north')
              : t('bed.cardinal.calibrate_north_action')}
          </Button>
        )}
      </div>
    </aside>
  );
}
