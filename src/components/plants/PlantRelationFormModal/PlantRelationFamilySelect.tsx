import { useMemo } from 'react';
import { t } from '../../../i18n/core/t';
import Select from '../../../shared/components/Select/Select';
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
      <Select
        id={id}
        className="plant-relation-form-modal__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isPending || isError}
        placeholder={
          isPending
            ? t('common.loading')
            : t('plantRelation.curator.companionFamilySelectPrompt')
        }
        options={sortedFamilies.map((family) => ({
          value: family.id,
          label: capitalizeFirstLetter(family.name)
        }))}
      />
      {isError && (
        <p role="alert" className="plant-relation-form-modal__error">
          {t('plantRelation.curator.companionFamiliesError')}
        </p>
      )}
    </>
  );
}
