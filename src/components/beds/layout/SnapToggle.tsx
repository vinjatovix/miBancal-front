import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';

import './layoutControls.css';

export interface SnapToggleProps {
  readonly enabled: boolean;
  readonly onToggle: () => void;
  readonly label?: string;
}

export default function SnapToggle({
  enabled,
  onToggle,
  label
}: SnapToggleProps): JSX.Element {
  const resolvedLabel = label ?? t('bed.layout.snap_label');

  return (
    <div className="layout-snap-toggle">
      <button
        type="button"
        className="layout-snap-toggle__switch"
        role="switch"
        aria-checked={enabled}
        aria-label={resolvedLabel}
        onClick={onToggle}
      >
        <span className="layout-snap-toggle__thumb" aria-hidden="true" />
      </button>
      <span className="layout-snap-toggle__label">{resolvedLabel}</span>
    </div>
  );
}
