import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import Button from '../../../shared/components/Button/Button';

import './placementSaveBar.css';

export interface PlacementSaveBarProps {
  readonly isDirty: boolean;
  readonly isSaving: boolean;
  readonly pendingCount: number;
  readonly onSave: () => void;
  readonly onDiscard: () => void;
}

function pendingLabel(count: number): string {
  return count === 1
    ? t('bed.placement.pending_one')
    : t('bed.placement.pending_many', { count: String(count) });
}

export default function PlacementSaveBar({
  isDirty,
  isSaving,
  pendingCount,
  onSave,
  onDiscard
}: PlacementSaveBarProps): JSX.Element | null {
  if (!isDirty) {
    return null;
  }

  return (
    <section
      className="placement-save-bar"
      aria-label={t('bed.placement.save_bar_label')}
    >
      <span className="placement-save-bar__count">
        {pendingLabel(pendingCount)}
      </span>
      <div className="placement-save-bar__actions">
        <Button
          variant="neutral"
          size="sm"
          onClick={onDiscard}
          disabled={isSaving}
        >
          {t('bed.placement.discard')}
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon="save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('bed.placement.saving') : t('bed.placement.save')}
        </Button>
      </div>
    </section>
  );
}
