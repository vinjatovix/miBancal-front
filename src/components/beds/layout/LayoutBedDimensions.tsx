import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';

import './layoutBedDimensions.css';

export interface LayoutBedDimensionsProps {
  readonly width: number;
  readonly height: number;
}

const OFFSET_CM = 24;
const GAP_CM = 4;
const TICK_CM = 4;

export default function LayoutBedDimensions({
  width,
  height
}: LayoutBedDimensionsProps): JSX.Element {
  const ext = OFFSET_CM + GAP_CM;
  const widthLabel = t('bed.visualizer.dimension_width', {
    width: String(width)
  });
  const heightLabel = t('bed.visualizer.dimension_height', {
    height: String(height)
  });

  return (
    <g
      className="layout-bed-dimensions"
      aria-label={t('bed.visualizer.dimension_lines_label')}
      pointerEvents="none"
    >
      <line
        className="layout-bed-dimensions__extension"
        x1={0}
        y1={-GAP_CM}
        x2={0}
        y2={-ext}
      />
      <line
        className="layout-bed-dimensions__extension"
        x1={width}
        y1={-GAP_CM}
        x2={width}
        y2={-ext}
      />
      <line
        className="layout-bed-dimensions__line"
        x1={0}
        y1={-OFFSET_CM}
        x2={width}
        y2={-OFFSET_CM}
      />
      <line
        className="layout-bed-dimensions__tick"
        x1={-TICK_CM}
        y1={-OFFSET_CM + TICK_CM}
        x2={TICK_CM}
        y2={-OFFSET_CM - TICK_CM}
      />
      <line
        className="layout-bed-dimensions__tick"
        x1={width - TICK_CM}
        y1={-OFFSET_CM + TICK_CM}
        x2={width + TICK_CM}
        y2={-OFFSET_CM - TICK_CM}
      />
      <text
        className="layout-bed-dimensions__text"
        x={width / 2}
        y={-OFFSET_CM - GAP_CM}
      >
        {widthLabel}
      </text>

      <line
        className="layout-bed-dimensions__extension"
        x1={-GAP_CM}
        y1={0}
        x2={-ext}
        y2={0}
      />
      <line
        className="layout-bed-dimensions__extension"
        x1={-GAP_CM}
        y1={height}
        x2={-ext}
        y2={height}
      />
      <line
        className="layout-bed-dimensions__line"
        x1={-OFFSET_CM}
        y1={0}
        x2={-OFFSET_CM}
        y2={height}
      />
      <line
        className="layout-bed-dimensions__tick"
        x1={-OFFSET_CM - TICK_CM}
        y1={-TICK_CM}
        x2={-OFFSET_CM + TICK_CM}
        y2={TICK_CM}
      />
      <line
        className="layout-bed-dimensions__tick"
        x1={-OFFSET_CM - TICK_CM}
        y1={height - TICK_CM}
        x2={-OFFSET_CM + TICK_CM}
        y2={height + TICK_CM}
      />
      <text
        className="layout-bed-dimensions__text"
        x={-OFFSET_CM - GAP_CM}
        y={height / 2}
        transform={`rotate(-90 ${-OFFSET_CM - GAP_CM} ${height / 2})`}
      >
        {heightLabel}
      </text>
    </g>
  );
}
