import { useId, type ChangeEvent, type JSX } from 'react';

import { t } from '../../../i18n/core/t';

import './layoutControls.css';

export interface BedRotationControlProps {
  readonly value: number;
  readonly onChange: (rotation: number) => void;
  readonly disabled?: boolean;
}

export default function BedRotationControl({
  value,
  onChange,
  disabled = false
}: BedRotationControlProps): JSX.Element {
  const inputId = useId();

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const parsed = Number(event.target.value);
    if (Number.isNaN(parsed)) return;
    onChange(parsed);
  };

  return (
    <div className="layout-rotation-control">
      <label htmlFor={inputId} className="layout-rotation-control__label">
        {t('bed.layout.rotation_label')}
      </label>
      <input
        id={inputId}
        className="layout-rotation-control__input"
        type="number"
        inputMode="numeric"
        min={0}
        max={359}
        step={1}
        value={value}
        disabled={disabled}
        onChange={handleChange}
      />
    </div>
  );
}
