import Icon from '../../../../shared/components/Icon/Icon';
import type { IconName } from '../../../../shared/components/Icon/iconPaths';

interface Props {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly testId?: string;
  readonly icon?: IconName;
  readonly maxLength?: number;
}

export default function TextFilter({
  icon,
  label,
  value,
  onChange,
  placeholder,
  testId,
  maxLength
}: Props) {
  return (
    <div className="plant-filters__group">
      <label>
        {icon && <Icon name={icon} decorative />}
        {icon ? ` ${label}` : label}
        <input
          className="plant-filters__input"
          data-testid={testId}
          placeholder={placeholder}
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}
