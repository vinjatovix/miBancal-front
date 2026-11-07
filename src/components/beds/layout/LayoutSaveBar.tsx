import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import Button from '../../../shared/components/Button/Button';

import './layoutControls.css';

export interface LayoutSaveBarProps {
  readonly dirty: boolean;
  readonly saving: boolean;
  readonly onSave: () => void;
  readonly onDiscard: () => void;
}

export default function LayoutSaveBar({
  dirty,
  saving,
  onSave,
  onDiscard
}: LayoutSaveBarProps): JSX.Element {
  return (
    <div className="layout-save-bar">
      <Button
        variant="secondary"
        onClick={onDiscard}
        disabled={!dirty || saving}
      >
        {t('bed.layout.discard')}
      </Button>
      <Button
        variant="primary"
        icon="save"
        onClick={onSave}
        disabled={!dirty || saving}
      >
        {saving ? t('bed.layout.saving') : t('bed.layout.save')}
      </Button>
    </div>
  );
}
