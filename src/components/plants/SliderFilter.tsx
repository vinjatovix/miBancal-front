import { useId } from 'react';

import { t } from '../../i18n/core/t';
import Icon from '../../shared/components/Icon/Icon';
import type { IconName } from '../../shared/components/Icon/iconPaths';

interface Props {
  readonly label: string;
  readonly icon?: IconName;
  readonly value: number | null;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly testId?: string;
  readonly onChange: (value: number | null) => void;
  readonly onCommit: (value: number | null) => void;
}

export default function SliderFilter({
  label,
  icon,
  value,
  min,
  max,
  step,
  testId,
  onChange,
  onCommit
}: Props) {
  const sliderId = useId();

  return (
    <div className="plant-filters__group">
      <div className="plant-filters__label-row">
        <label className="plant-filters__label" htmlFor={sliderId}>
          {icon && <Icon name={icon} decorative />}
          {icon ? ` ${label}` : label} {value}
        </label>

        {value !== null && (
          <button
            type="button"
            className="plant-filters__slider-clear"
            aria-label={t('plant.filters.clear_range', { label })}
            onClick={() => {
              onChange(null);
              onCommit(null);
            }}
          >
            <Icon name="close" decorative />
          </button>
        )}
      </div>

      <input
        id={sliderId}
        data-testid={testId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? min}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={(e) => onCommit(Number(e.currentTarget.value))}
      />
    </div>
  );
}
