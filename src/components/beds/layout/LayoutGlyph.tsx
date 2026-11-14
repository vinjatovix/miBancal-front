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
  | 'info'
  | 'magnet-grid'
  | 'magnet-beds'
  | 'rotate'
  | 'unplace'
  | 'edit'
  | 'trash'
  | 'undo'
  | 'redo'
  | 'fullscreen'
  | 'fullscreen-exit';

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
      <rect x="3.6" y="5.6" width="16.8" height="12.8" rx="2.2" />
      <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
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
  ),
  'magnet-grid': (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M3 15.4 V10 a3.7 3.7 0 0 1 7.4 0 V15.4"
        fill="none"
        strokeWidth={2.6}
      />
      <rect
        x="1.4"
        y="15"
        width="3.2"
        height="3.4"
        rx="0.5"
        fill="currentColor"
      />
      <rect
        x="8.8"
        y="15"
        width="3.2"
        height="3.4"
        rx="0.5"
        fill="currentColor"
      />
      <g fill="none" strokeWidth={1.8}>
        <path d="M16.2 8 L15.2 19" />
        <path d="M20.8 8 L19.8 19" />
        <path d="M14 11.8 H21.4" />
        <path d="M13.5 15.4 H20.9" />
      </g>
    </g>
  ),
  'magnet-beds': (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M3 15.4 V10 a3.7 3.7 0 0 1 7.4 0 V15.4"
        fill="none"
        strokeWidth={2.6}
      />
      <rect
        x="1.4"
        y="15"
        width="3.2"
        height="3.4"
        rx="0.5"
        fill="currentColor"
      />
      <rect
        x="8.8"
        y="15"
        width="3.2"
        height="3.4"
        rx="0.5"
        fill="currentColor"
      />
      <g fill="none" strokeWidth={1.8}>
        <rect x="13.6" y="7.6" width="7.8" height="4.4" rx="1" />
        <rect x="13.6" y="13.4" width="7.8" height="4.4" rx="1" />
      </g>
    </g>
  ),
  undo: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 9 H13.5 A5 5 0 0 1 13.5 19 H9" />
      <path d="M8.5 5.5 L5 9 L8.5 12.5" />
    </g>
  ),
  redo: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 9 H10.5 A5 5 0 0 0 10.5 19 H15" />
      <path d="M15.5 5.5 L19 9 L15.5 12.5" />
    </g>
  ),
  fullscreen: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 9 V4 H9" />
      <path d="M15 4 H20 V9" />
      <path d="M20 15 V20 H15" />
      <path d="M9 20 H4 V15" />
    </g>
  ),
  'fullscreen-exit': (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 4 V9 H4" />
      <path d="M20 9 H15 V4" />
      <path d="M15 20 V15 H20" />
      <path d="M4 15 H9 V20" />
    </g>
  ),
  rotate: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.6 8.4 A7 7 0 1 0 19 12.6" />
      <path d="M18.9 4.6 L18.9 8.6 L14.9 8.6" />
    </g>
  ),
  unplace: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 13 V18 A1 1 0 0 0 6 19 H18 A1 1 0 0 0 19 18 V13" />
      <path d="M12 15 V4.5" />
      <path d="M8.3 8 L12 4.3 L15.7 8" />
    </g>
  ),
  edit: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20 L4.2 16.3 L15.5 5 L19 8.5 L7.7 19.8 Z" />
      <path d="M13.5 7 L17 10.5" />
    </g>
  ),
  trash: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 7 H19" />
      <path d="M8 7 V5.2 A1 1 0 0 1 9 4.2 H15 A1 1 0 0 1 16 5.2 V7" />
      <path d="M6.6 7 L7.4 19 A1 1 0 0 0 8.4 20 H15.6 A1 1 0 0 0 16.6 19 L17.4 7" />
      <path d="M10 10 V17 M14 10 V17" />
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
