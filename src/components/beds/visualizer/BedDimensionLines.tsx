import type React from 'react';

import { t } from '../../../i18n/core/t';
import type { BedGeometry } from './utils/bedGeometry';

import './bedDimensionLines.css';

export interface BedDimensionLinesProps {
  readonly geometry: BedGeometry;
}

export default function BedDimensionLines({
  geometry
}: BedDimensionLinesProps): React.JSX.Element {
  const { widthDimension, heightDimension, width, height } = geometry;

  const widthLabel = t('bed.visualizer.dimension_width', {
    width: String(width)
  });
  const heightLabel = t('bed.visualizer.dimension_height', {
    height: String(height)
  });

  return (
    <g
      className="bed-dimension-lines"
      aria-label={t('bed.visualizer.dimension_lines_label')}
    >
      <line
        className="bed-dimension-lines__extension"
        x1={widthDimension.extensionStart1.x}
        y1={widthDimension.extensionStart1.y}
        x2={widthDimension.extensionEnd1.x}
        y2={widthDimension.extensionEnd1.y}
      />
      <line
        className="bed-dimension-lines__extension"
        x1={widthDimension.extensionStart2.x}
        y1={widthDimension.extensionStart2.y}
        x2={widthDimension.extensionEnd2.x}
        y2={widthDimension.extensionEnd2.y}
      />
      <line
        className="bed-dimension-lines__line"
        x1={widthDimension.start.x}
        y1={widthDimension.start.y}
        x2={widthDimension.end.x}
        y2={widthDimension.end.y}
      />
      <line
        className="bed-dimension-lines__tick"
        x1={widthDimension.start.x - 4}
        y1={widthDimension.start.y + 4}
        x2={widthDimension.start.x + 4}
        y2={widthDimension.start.y - 4}
      />
      <line
        className="bed-dimension-lines__tick"
        x1={widthDimension.end.x - 4}
        y1={widthDimension.end.y + 4}
        x2={widthDimension.end.x + 4}
        y2={widthDimension.end.y - 4}
      />
      <text
        className="bed-dimension-lines__text"
        x={widthDimension.textPosition.x}
        y={widthDimension.textPosition.y}
      >
        {widthLabel}
      </text>

      <line
        className="bed-dimension-lines__extension"
        x1={heightDimension.extensionStart1.x}
        y1={heightDimension.extensionStart1.y}
        x2={heightDimension.extensionEnd1.x}
        y2={heightDimension.extensionEnd1.y}
      />
      <line
        className="bed-dimension-lines__extension"
        x1={heightDimension.extensionStart2.x}
        y1={heightDimension.extensionStart2.y}
        x2={heightDimension.extensionEnd2.x}
        y2={heightDimension.extensionEnd2.y}
      />
      <line
        className="bed-dimension-lines__line"
        x1={heightDimension.start.x}
        y1={heightDimension.start.y}
        x2={heightDimension.end.x}
        y2={heightDimension.end.y}
      />
      <line
        className="bed-dimension-lines__tick"
        x1={heightDimension.start.x - 4}
        y1={heightDimension.start.y + 4}
        x2={heightDimension.start.x + 4}
        y2={heightDimension.start.y - 4}
      />
      <line
        className="bed-dimension-lines__tick"
        x1={heightDimension.end.x - 4}
        y1={heightDimension.end.y + 4}
        x2={heightDimension.end.x + 4}
        y2={heightDimension.end.y - 4}
      />
      <text
        className="bed-dimension-lines__text"
        x={heightDimension.textPosition.x}
        y={heightDimension.textPosition.y}
        transform={`rotate(-90 ${heightDimension.textPosition.x} ${heightDimension.textPosition.y})`}
      >
        {heightLabel}
      </text>
    </g>
  );
}
