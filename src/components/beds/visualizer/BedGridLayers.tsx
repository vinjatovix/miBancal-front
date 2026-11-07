import type React from 'react';

import { BED_GRID_LAYERS, type ActiveGridLayers } from './utils/bedGridConfig';

export interface BedGridLayersProps {
  readonly width: number;
  readonly height: number;
  readonly activeLayers: ActiveGridLayers;
}

export default function BedGridLayers({
  width,
  height,
  activeLayers
}: BedGridLayersProps): React.JSX.Element {
  return (
    <g className="bed-grid-layers">
      <defs>
        {BED_GRID_LAYERS.map((layer) => (
          <pattern
            key={layer.key}
            id={`grid-pattern-${layer.key}`}
            width={layer.step}
            height={layer.step}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${layer.step} 0 L 0 0 0 ${layer.step}`}
              fill="none"
              stroke={layer.strokeColor}
              strokeWidth={layer.strokeWidth}
              strokeDasharray={layer.strokeDasharray}
            />
          </pattern>
        ))}
      </defs>

      {BED_GRID_LAYERS.map((layer) => {
        if (!activeLayers?.[layer.key]) {
          return null;
        }

        return (
          <rect
            key={layer.key}
            className={`bed-grid-layer bed-grid-layer--${layer.key}`}
            x={0}
            y={0}
            width={width}
            height={height}
            fill={`url(#grid-pattern-${layer.key})`}
            pointerEvents="none"
          />
        );
      })}
    </g>
  );
}
