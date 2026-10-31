import { useMemo } from 'react';
import { t } from '../../../i18n/core/t';
import { useFamilies } from '../../../shared/hooks/useFamilies';
import { capitalizeFirstLetter } from '../../../shared/utils/capitalizeFirstLetter';

interface PlantRelationFamilySelectProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (familyId: string) => void;
}

export default function PlantRelationFamilySelect({
  id,
  value,
  onChange
}: PlantRelationFamilySelectProps) {
  const { data, isPending, isError } = useFamilies();

  const sortedFamilies = useMemo(
    () =>
      [...(data ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      ),
    [data]
  );

  return (
    <>
      <select
        id={id}
        className="plant-relation-form-modal__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isPending || isError}
      >
        <option value="">
          {isPending
            ? t('common.loading')
            : t('plantRelation.curator.companionFamilySelectPrompt')}
        </option>
        {sortedFamilies.map((family) => (
          <option key={family.id} value={family.id}>
            {capitalizeFirstLetter(family.name)}
          </option>
        ))}
      </select>
      {isError && (
        <p role="alert" className="plant-relation-form-modal__error">
          {t('plantRelation.curator.companionFamiliesError')}
        </p>
      )}
    </>
  );
}
