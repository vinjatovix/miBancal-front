import type { JSX } from 'react';

export type LayoutGlyphName =
  | 'cursor'
  | 'seed'
  | 'brush'
  | 'row-single'
  | 'row-double'
  | 'row-staggered'
  | 'layers'
  | 'eye'
  | 'move'
  | 'zoom-in'
  | 'zoom-out'
  | 'fit'
  | 'info';

export interface LayoutGlyphProps {
  readonly name: LayoutGlyphName;
  readonly className?: string;
}

const DOT_R = 2.3;

function Dots({
  points
}: {
  readonly points: readonly (readonly [number, number])[];
}): JSX.Element {
  return (
    <>
      {points.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={DOT_R} />
      ))}
    </>
  );
}

const GLYPHS: Record<LayoutGlyphName, JSX.Element> = {
  cursor: (
    <path
      fill="currentColor"
      d="M5 3.2 5 18.4 9.1 14.4 11.7 19.9 13.8 19 11.2 13.5 16.4 13.1Z"
    />
  ),
  seed: (
    <g fill="currentColor">
      <rect x="11.1" y="11" width="1.8" height="9.2" rx="0.9" />
      <path d="M11.6 12.4C11.6 8.7 9 6 5.3 6 5.3 9.7 7.9 12.4 11.6 12.4Z" />
      <path d="M12.6 13.6C12.6 9.4 15.5 6.6 19.6 6.6 19.6 10.8 16.7 13.6 12.6 13.6Z" />
    </g>
  ),
  brush: (
    <g fill="currentColor">
      <path d="M20.9 3.1c-.9-.9-2.3-.9-3.2 0l-6.6 6.6 3.2 3.2 6.6-6.6c.9-.9.9-2.3 0-3.2Z" />
      <path d="M9.6 11.3 13 14.7c.3.3.3.8 0 1.2l-.9.9c-1.3 1.3-3.2 1.7-5.3 1.9-.9.1-1.6-.6-1.5-1.5.2-2.1.6-4 1.9-5.3l.9-.9c.4-.4 1-.4 1.3 0Z" />
    </g>
  ),
  'row-single': (
    <Dots
      points={[
        [5.5, 12],
        [12, 12],
        [18.5, 12]
      ]}
    />
  ),
  'row-double': (
    <Dots
      points={[
        [5.5, 8],
        [12, 8],
        [18.5, 8],
        [5.5, 16],
        [12, 16],
        [18.5, 16]
      ]}
    />
  ),
  'row-staggered': (
    <Dots
      points={[
        [5.5, 8],
        [12, 8],
        [18.5, 8],
        [8.75, 16],
        [15.25, 16]
      ]}
    />
  ),
  layers: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M12 3 21 7.8 12 12.6 3 7.8Z" />
      <path d="M3.4 12 12 16.6 20.6 12" />
      <path d="M3.4 16 12 20.6 20.6 16" />
    </g>
  ),
  eye: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.7" fill="currentColor" stroke="none" />
    </g>
  ),
  move: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3.2V20.8M3.2 12H20.8" />
      <path d="M12 3.2 9.6 5.8M12 3.2 14.4 5.8M12 20.8 9.6 18.2M12 20.8 14.4 18.2" />
      <path d="M3.2 12 5.8 9.6M3.2 12 5.8 14.4M20.8 12 18.2 9.6M20.8 12 18.2 14.4" />
    </g>
  ),
  'zoom-in': (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
      <path d="M10.5 7.6V13.4M7.6 10.5H13.4" />
    </g>
  ),
  'zoom-out': (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
      <path d="M7.6 10.5H13.4" />
    </g>
  ),
  fit: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8.5V5.5A1.5 1.5 0 0 1 5.5 4H8.5" />
      <path d="M15.5 4H18.5A1.5 1.5 0 0 1 20 5.5V8.5" />
      <path d="M20 15.5V18.5A1.5 1.5 0 0 1 18.5 20H15.5" />
      <path d="M8.5 20H5.5A1.5 1.5 0 0 1 4 18.5V15.5" />
    </g>
  ),
  info: (
    <g>
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      />
      <circle cx="12" cy="7.9" r="1.25" fill="currentColor" />
      <rect x="11" y="10.6" width="2" height="7" rx="1" fill="currentColor" />
    </g>
  )
};

export default function LayoutGlyph({
  name,
  className
}: LayoutGlyphProps): JSX.Element {
  return (
    <svg
      className={className ? `layout-glyph ${className}` : 'layout-glyph'}
      viewBox="0 0 24 24"
      width="1.15em"
      height="1.15em"
      fill="currentColor"
      focusable="false"
      aria-hidden="true"
    >
      {GLYPHS[name]}
    </svg>
  );
}
