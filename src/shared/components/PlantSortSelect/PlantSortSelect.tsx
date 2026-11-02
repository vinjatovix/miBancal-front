import { useId } from 'react';

import Select, { type SelectOption } from '../Select/Select';

export type SortSelectOption = SelectOption;

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
      <Select
        id={selectId}
        value={value}
        options={options}
        onChange={(event) => onChange(event.target.value)}
      />
    </>
  );
}
