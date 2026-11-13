import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import type { UnplacedBedSummary } from '../../../types/Location/LocationLayout';
import type { LayoutMode } from './utils/layoutTypes';

import './unplacedBedsTray.css';

export interface UnplacedBedsTrayProps {
  readonly beds: readonly UnplacedBedSummary[];
  readonly mode: LayoutMode;
  readonly onPlace?: (id: string) => void;
}

export default function UnplacedBedsTray({
  beds,
  mode,
  onPlace
}: UnplacedBedsTrayProps): JSX.Element {
  const interactive = mode === 'position';

  return (
    <section
      className="unplaced-beds-tray"
      aria-label={t('bed.layout.tray_title')}
    >
      <h2 className="unplaced-beds-tray__title">
        {t('bed.layout.tray_title')}
      </h2>
      {beds.length === 0 ? (
        <p className="unplaced-beds-tray__empty">
          {t('bed.layout.tray_empty')}
        </p>
      ) : (
        <ul className="unplaced-beds-tray__list">
          {beds.map((bed) => (
            <li key={bed.id} className="unplaced-beds-tray__item">
              {interactive ? (
                <button
                  type="button"
                  className="unplaced-beds-tray__place"
                  onClick={() => onPlace?.(bed.id)}
                  aria-label={t('bed.layout.tray_place_action', {
                    name: bed.name
                  })}
                >
                  <span className="unplaced-beds-tray__name">{bed.name}</span>
                  <span className="unplaced-beds-tray__dimensions">
                    {t('bed.technical_header.dimensions_value', {
                      width: String(bed.width),
                      height: String(bed.height)
                    })}
                  </span>
                </button>
              ) : (
                <div className="unplaced-beds-tray__static">
                  <span className="unplaced-beds-tray__name">{bed.name}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
