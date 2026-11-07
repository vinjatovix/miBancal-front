import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import type {
  BedEdgeCardinals,
  CardinalPoint4
} from './utils/cardinalGeometry';

import './layoutBedCardinalEdgeLabels.css';

export interface LayoutBedCardinalEdgeLabelsProps {
  readonly width: number;
  readonly height: number;
  readonly cardinals: BedEdgeCardinals;
  readonly zoom: number;
}

type BedEdgeSide = 'top' | 'right' | 'bottom' | 'left';

interface EdgeConfig {
  readonly side: BedEdgeSide;
  readonly x: number;
  readonly y: number;
  readonly point: CardinalPoint4;
}

const BADGE_OFFSET_CM = 10;
const COMPACT_MIN_SIZE_PX = 32;

function getEdgeAriaLabel(point: CardinalPoint4): string {
  switch (point) {
    case 'N':
      return t('bed.cardinal.edge_north_label');
    case 'E':
      return t('bed.cardinal.edge_east_label');
    case 'S':
      return t('bed.cardinal.edge_south_label');
    case 'O':
      return t('bed.cardinal.edge_west_label');
    default: {
      const exhaustiveCheck: never = point;
      return exhaustiveCheck;
    }
  }
}

export default function LayoutBedCardinalEdgeLabels({
  width,
  height,
  cardinals,
  zoom
}: LayoutBedCardinalEdgeLabelsProps): JSX.Element {
  const isCompact = zoom * Math.min(width, height) < COMPACT_MIN_SIZE_PX;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const edges: readonly EdgeConfig[] = [
    { side: 'top', x: halfWidth, y: -BADGE_OFFSET_CM, point: cardinals.top },
    {
      side: 'right',
      x: width + BADGE_OFFSET_CM,
      y: halfHeight,
      point: cardinals.right
    },
    {
      side: 'bottom',
      x: halfWidth,
      y: height + BADGE_OFFSET_CM,
      point: cardinals.bottom
    },
    { side: 'left', x: -BADGE_OFFSET_CM, y: halfHeight, point: cardinals.left }
  ];

  return (
    <g
      className={`layout-bed-cardinal-labels ${
        isCompact ? 'layout-bed-cardinal-labels--compact' : ''
      }`}
      pointerEvents="none"
    >
      {edges.map(({ side, x, y, point }) => (
        <g
          key={side}
          className={`layout-bed-cardinal-labels__badge layout-bed-cardinal-labels__badge--${side}`}
          transform={`translate(${x}, ${y})`}
          role="img"
          aria-label={getEdgeAriaLabel(point)}
        >
          <rect
            className="layout-bed-cardinal-labels__pill"
            x={-10}
            y={-7}
            width={20}
            height={14}
            rx={7}
          />
          <text
            className={`layout-bed-cardinal-labels__text layout-bed-cardinal-labels__text--${side}`}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {point}
          </text>
        </g>
      ))}
    </g>
  );
}
