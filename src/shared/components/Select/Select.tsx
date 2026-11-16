import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';

import './select.css';

export interface SelectOption {
  readonly value: string | number;
  readonly label: ReactNode;
  readonly disabled?: boolean;
}

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> {
  readonly options?: readonly SelectOption[];
  readonly placeholder?: string;
  readonly isInvalid?: boolean;
  readonly selectSize?: SelectSize;
}

function resolveAriaInvalid(
  isInvalid: boolean | undefined,
  fallback: SelectHTMLAttributes<HTMLSelectElement>['aria-invalid']
): SelectHTMLAttributes<HTMLSelectElement>['aria-invalid'] {
  if (isInvalid === undefined) {
    return fallback;
  }
  return isInvalid ? 'true' : 'false';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    options,
    placeholder,
    isInvalid,
    selectSize = 'md',
    className = '',
    children,
    ...restProps
  },
  ref
) {
  const isAriaInvalid =
    isInvalid ??
    (restProps['aria-invalid'] === 'true' ||
      restProps['aria-invalid'] === true);

  const ariaInvalidAttr = resolveAriaInvalid(
    isInvalid,
    restProps['aria-invalid']
  );

  const classes = [
    'app-select',
    `app-select--${selectSize}`,
    isAriaInvalid ? 'app-select--invalid' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <select
      ref={ref}
      className={classes}
      aria-invalid={ariaInvalidAttr}
      {...restProps}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options?.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
      {children}
    </select>
  );
});

export default Select;
