import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import LayoutGlyph, { type LayoutGlyphName } from './LayoutGlyph';

import './layoutControls.css';

export interface SnapToggleProps {
  readonly enabled: boolean;
  readonly onToggle: () => void;
  readonly glyph: LayoutGlyphName;
  readonly label?: string;
  readonly shortLabel?: string;
  readonly iconOnly?: boolean;
}

export default function SnapToggle({
  enabled,
  onToggle,
  glyph,
  label,
  shortLabel,
  iconOnly = false
}: SnapToggleProps): JSX.Element {
  const resolvedLabel = label ?? t('bed.layout.snap_label');

  return (
    <button
      type="button"
      className={
        iconOnly
          ? 'layout-snap-icon-toggle layout-snap-icon-toggle--icon-only'
          : 'layout-snap-icon-toggle'
      }
      role="switch"
      aria-checked={enabled}
      aria-label={resolvedLabel}
      title={resolvedLabel}
      onClick={onToggle}
    >
      <LayoutGlyph name={glyph} />
      {shortLabel && !iconOnly && (
        <span className="layout-snap-icon-toggle__label">{shortLabel}</span>
      )}
    </button>
  );
}
