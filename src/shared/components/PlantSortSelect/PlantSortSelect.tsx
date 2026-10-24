import { useId } from 'react';

export interface SortSelectOption {
  readonly value: string;
  readonly label: string;
}

interface Props {
  readonly label: string;
  readonly value: string;
  readonly options: readonly SortSelectOption[];
  readonly onChange: (value: string) => void;
}

export default function PlantSortSelect({
  label,
  value,
  options,
  onChange
}: Props) {
  const selectId = useId();

  return (
    <>
      <label htmlFor={selectId}>{label}</label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
}
