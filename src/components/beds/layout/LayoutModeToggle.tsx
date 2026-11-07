import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';

import './layoutControls.css';

export interface LayoutModeToggleProps {
  readonly active: boolean;
  readonly onToggle: () => void;
}

export default function LayoutModeToggle({
  active,
  onToggle
}: LayoutModeToggleProps): JSX.Element {
  const select = (position: boolean): void => {
    if (position !== active) onToggle();
  };

  return (
    <div
      className="layout-mode-toggle"
      role="group"
      aria-label={t('bed.layout.mode_group_label')}
    >
      <button
        type="button"
        className="layout-mode-toggle__segment"
        aria-pressed={!active}
        onClick={() => select(false)}
      >
        {t('bed.layout.mode_view')}
      </button>
      <button
        type="button"
        className="layout-mode-toggle__segment"
        aria-pressed={active}
        onClick={() => select(true)}
      >
        {t('bed.layout.mode_position_short')}
      </button>
    </div>
  );
}
