import { useId } from 'react';

import { SUPPORTED_LIMITS } from '../constants';

import './pageSizeSelector.css';

interface Props {
  readonly label: string;
  readonly value: number;
  readonly onChange: (value: number) => void;
}

function segmentClass(active: boolean): string {
  return active
    ? 'page-size__segment page-size__segment--active'
    : 'page-size__segment';
}

export default function PageSizeSelector({ label, value, onChange }: Props) {
  const labelId = useId();

  return (
    <div className="page-size" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="page-size__label">
        {label}
      </span>

      <div className="page-size__segments">
        {SUPPORTED_LIMITS.map((limit) => (
          <button
            key={limit}
            type="button"
            aria-pressed={value === limit}
            className={segmentClass(value === limit)}
            onClick={() => onChange(limit)}
          >
            {limit}
          </button>
        ))}
      </div>
    </div>
  );
}
