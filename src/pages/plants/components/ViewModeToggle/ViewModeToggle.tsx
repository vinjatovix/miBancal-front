import { useId } from 'react';

import { t } from '../../../../i18n/core/t';

import type { ViewMode } from './viewMode';

import './viewModeToggle.css';

export type { ViewMode } from './viewMode';

function segmentClass(active: boolean): string {
  return active
    ? 'view-toggle__segment view-toggle__segment--active'
    : 'view-toggle__segment';
}

interface Props {
  readonly value: ViewMode;
  readonly onChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({ value, onChange }: Props) {
  const labelId = useId();

  return (
    <div className="view-toggle" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="view-toggle__label">
        {t('plant.view.label')}
      </span>

      <div className="view-toggle__segments">
        <button
          type="button"
          aria-pressed={value === 'grid'}
          className={segmentClass(value === 'grid')}
          onClick={() => onChange('grid')}
        >
          {t('plant.view.grid')}
        </button>
        <button
          type="button"
          aria-pressed={value === 'list'}
          className={segmentClass(value === 'list')}
          onClick={() => onChange('list')}
        >
          {t('plant.view.list')}
        </button>
      </div>
    </div>
  );
}
