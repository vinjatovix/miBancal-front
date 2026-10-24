import { useContext, useEffect, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

import { t } from '../../../../i18n/core/t';
import { AuthContext } from '../../../../shared/auth/authContextDef';
import { createSessionTransferUrl } from '../../../../shared/auth/sessionTransfer';
import Icon from '../../../../shared/components/Icon/Icon';
import { useFamilies } from '../../../../shared/hooks/useFamilies';

export interface PlantFamilySelectProps {
  readonly value: string;
  readonly onChange: (familyId: string) => void;
  readonly error?: string;
}

export function PlantFamilySelect({
  value,
  onChange,
  error
}: PlantFamilySelectProps) {
  const auth = useContext(AuthContext);
  const { data: families = [], refetch, isFetching } = useFamilies();

  const createFamilyHref = auth?.session?.token
    ? createSessionTransferUrl('/families/new', auth.session.token)
    : '/families/new';

  useEffect(() => {
    const handleFocus = () => {
      void refetch();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="plant-form__field plant-family-select">
      <label
        htmlFor="plant-family-select-input"
        className="plant-form__label plant-family-select__label"
      >
        {t('plant.form.fields.family')}
        <span aria-hidden="true"> *</span>
      </label>
      <select
        id="plant-family-select-input"
        className="plant-form__select plant-family-select__select"
        value={value}
        onChange={handleChange}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'plant-family-select-error' : undefined}
      >
        <option value="">{t('plant.form.fields.family_placeholder')}</option>
        {families.map((fam) => (
          <option key={fam.id} value={fam.id}>
            {fam.name} ({fam.scientificName})
          </option>
        ))}
      </select>
      {error && (
        <span
          id="plant-family-select-error"
          role="alert"
          className="plant-form__error plant-family-select__error"
        >
          {error}
        </span>
      )}
      <div className="plant-family-select__meta">
        <Link
          to={createFamilyHref}
          target="_blank"
          rel="noopener noreferrer"
          className="plant-family-select__new-link"
        >
          {t('plant.form.fields.family_create_link')}
        </Link>
        <button
          type="button"
          className="plant-family-select__refresh-btn"
          onClick={() => void refetch()}
          disabled={isFetching}
          aria-label={t('plant.form.fields.family_refresh')}
        >
          <Icon name="sync_alt" decorative />
          <span>{t('plant.form.fields.family_refresh')}</span>
        </button>
      </div>
    </div>
  );
}
