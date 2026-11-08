import type { JSX } from 'react';
import type {
  BrushCandidatePosition,
  BrushDirectrix
} from '../../../types/PlantInstance/brushSelectionTypes';
import './bedBrushPreviewLayer.css';

export interface BedBrushPreviewLayerProps {
  readonly directrix: BrushDirectrix | null;
  readonly candidates: readonly BrushCandidatePosition[];
  readonly isDrawing: boolean;
}

export function BedBrushPreviewLayer({
  directrix,
  candidates,
  isDrawing
}: BedBrushPreviewLayerProps): JSX.Element | null {
  if (!isDrawing || !directrix) {
    return null;
  }

  return (
    <g className="bed-brush-preview-layer" aria-hidden="true">
      <line
        x1={directrix.start.x}
        y1={directrix.start.y}
        x2={directrix.end.x}
        y2={directrix.end.y}
        className="bed-brush-preview-layer__directrix"
      />
      {candidates.map((candidate) => {
        const key = `${candidate.rowIndex}-${candidate.itemIndex}-${candidate.position.x.toFixed(1)}-${candidate.position.y.toFixed(1)}`;
        const statusClass = candidate.isValid ? 'is-valid' : 'is-omitted';

        return (
          <g
            key={key}
            className={`bed-brush-preview-layer__candidate ${statusClass}`}
          >
            <circle
              cx={candidate.position.x}
              cy={candidate.position.y}
              r={candidate.vitalRadius}
              className="bed-brush-preview-layer__vital-circle"
            />
            <circle
              cx={candidate.position.x}
              cy={candidate.position.y}
              r={Math.min(Math.max(candidate.vitalRadius * 0.15, 2), 4)}
              className="bed-brush-preview-layer__center-dot"
            />
          </g>
        );
      })}
    </g>
  );
}
