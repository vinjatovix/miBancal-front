import { useId } from 'react';

import Icon from '../../shared/components/Icon/Icon';
import type { IconName } from '../../shared/components/Icon/iconPaths';

interface Props {
  readonly label: string;
  readonly icon?: IconName;
  readonly options: readonly string[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly renderLabel?: (value: string) => string;
  readonly describedBy?: string;
}

export default function ToggleGroup({
  label,
  icon,
  options,
  value,
  onChange,
  renderLabel,
  describedBy
}: Props) {
  const labelId = useId();

  return (
    <div
      className="plant-filters__group"
      role="group"
      aria-labelledby={labelId}
      aria-describedby={describedBy}
    >
      <span id={labelId} className="plant-filters__group-label">
        {icon && <Icon name={icon} decorative />}
        {icon ? ` ${label}` : label}
      </span>

      <div className="plant-filters__buttons">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            className={getToggleClass(value === option)}
            onClick={() => onChange(option)}
          >
            {renderLabel ? renderLabel(option) : option}
          </button>
        ))}
      </div>
    </div>
  );
}

function getToggleClass(active: boolean) {
  return active
    ? 'plant-filters__toggle plant-filters__toggle--active'
    : 'plant-filters__toggle';
}
