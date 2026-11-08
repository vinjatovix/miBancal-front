import { useState, type JSX } from 'react';

import { t } from '../../../i18n/core/t';
import type { I18nKey } from '../../../i18n/core/types';
import Modal from '../../../shared/components/Modal/Modal';
import Button from '../../../shared/components/Button/Button';
import type { Coordinates } from '../../../types/PlantInstance/PlantInstance';
import type { PlacementEvaluation } from './hooks/useCanvasPlacement';

import './manualPlacementModal.css';

export interface ManualPlacementModalProps {
  readonly isOpen: boolean;
  readonly bedWidth: number;
  readonly bedHeight: number;
  readonly vitalRadius: number;
  readonly evaluatePlacement?: (
    position: Coordinates,
    vitalRadius: number
  ) => PlacementEvaluation;
  readonly onConfirm: (position: Coordinates) => void;
  readonly onCancel: () => void;
}

export default function ManualPlacementModal({
  isOpen,
  bedWidth,
  bedHeight,
  vitalRadius,
  evaluatePlacement,
  onConfirm,
  onCancel
}: ManualPlacementModalProps): JSX.Element {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [error, setError] = useState<I18nKey | null>(null);

  const validate = (px: number, py: number): I18nKey | null => {
    if (
      Number.isNaN(px) ||
      Number.isNaN(py) ||
      px < 0 ||
      px > bedWidth ||
      py < 0 ||
      py > bedHeight
    ) {
      return 'bed.placement.manual_error_out_of_bounds';
    }
    const evaluation = evaluatePlacement?.({ x: px, y: py }, vitalRadius);
    if (evaluation?.hasCollision) {
      return 'bed.placement.manual_error_collision';
    }
    return null;
  };

  const handleConfirm = () => {
    const px = Number.parseFloat(x);
    const py = Number.parseFloat(y);
    const validationError = validate(px, py);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setX('');
    setY('');
    onConfirm({ x: px, y: py });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={t('bed.placement.manual_title')}
      subtitle={t('bed.placement.manual_subtitle')}
      closeLabel={t('bed.placement.manual_close')}
      footer={
        <>
          <Button variant="neutral" size="sm" onClick={onCancel}>
            {t('bed.placement.manual_cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            {t('bed.placement.manual_confirm')}
          </Button>
        </>
      }
    >
      <div className="manual-placement-modal__fields">
        <label className="manual-placement-modal__field">
          <span className="manual-placement-modal__label">
            {t('bed.placement.manual_x_label')}
          </span>
          <input
            type="number"
            step="any"
            className="manual-placement-modal__input"
            value={x}
            onChange={(event) => setX(event.target.value)}
          />
        </label>
        <label className="manual-placement-modal__field">
          <span className="manual-placement-modal__label">
            {t('bed.placement.manual_y_label')}
          </span>
          <input
            type="number"
            step="any"
            className="manual-placement-modal__input"
            value={y}
            onChange={(event) => setY(event.target.value)}
          />
        </label>
      </div>
      {error && (
        <p className="manual-placement-modal__error" role="alert">
          {t(error)}
        </p>
      )}
    </Modal>
  );
}
