import type { JSX } from 'react';

import { t } from '../../../../../i18n/core/t';
import Button from '../../../../../shared/components/Button/Button';
import type { ResolvedBed } from '../../../../../components/beds/layout/utils/layoutTypes';

export interface BedSelectorListProps {
  readonly beds: readonly ResolvedBed[];
  readonly selectedBedIds: readonly string[];
  readonly onToggleBed: (bedId: string) => void;
  readonly onSelectAll: () => void;
  readonly onDeselectAll: () => void;
  readonly disabled: boolean;
}

export default function BedSelectorList({
  beds,
  selectedBedIds,
  onToggleBed,
  onSelectAll,
  onDeselectAll,
  disabled
}: BedSelectorListProps): JSX.Element {
  if (beds.length === 0) {
    return (
      <p className="bed-pdf-export-modal__empty">
        {t('bed.export.beds_empty')}
      </p>
    );
  }

  const selected = new Set(selectedBedIds);

  return (
    <div className="bed-pdf-export-modal__beds">
      <div className="bed-pdf-export-modal__beds-actions">
        <Button
          variant="secondary"
          size="sm"
          onClick={onSelectAll}
          disabled={disabled}
        >
          {t('bed.export.beds_select_all')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onDeselectAll}
          disabled={disabled}
        >
          {t('bed.export.beds_deselect_all')}
        </Button>
      </div>
      <ul className="bed-pdf-export-modal__bed-list">
        {beds.map((bed) => (
          <li key={bed.id}>
            <label className="bed-pdf-export-modal__option">
              <input
                type="checkbox"
                checked={selected.has(bed.id)}
                onChange={() => onToggleBed(bed.id)}
                disabled={disabled}
              />
              <span>{bed.name}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
