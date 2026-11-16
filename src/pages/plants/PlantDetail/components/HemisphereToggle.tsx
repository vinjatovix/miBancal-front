import { t } from '../../../../i18n/core/t';
import './hemisphereToggle.css';

interface Props {
  readonly value: 'north' | 'south';
  readonly onChange: (value: 'north' | 'south') => void;
}

export default function HemisphereToggle({ value, onChange }: Props) {
  return (
    <div className="hemisphere-toggle">
      <button
        type="button"
        className={
          value === 'north'
            ? 'hemisphere-toggle__btn hemisphere-toggle__btn--active'
            : 'hemisphere-toggle__btn'
        }
        onClick={() => onChange('north')}
      >
        {t('plant.hemisphere.north')}
      </button>

      <button
        type="button"
        className={
          value === 'south'
            ? 'hemisphere-toggle__btn hemisphere-toggle__btn--active'
            : 'hemisphere-toggle__btn'
        }
        onClick={() => onChange('south')}
      >
        {t('plant.hemisphere.south')}
      </button>
    </div>
  );
}
