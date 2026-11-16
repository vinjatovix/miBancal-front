import { t } from '../../../../i18n/core/t';
import BodySection from '../../../../shared/components/BodySection/BodySection';
import type { Family } from '../../../../types/Family';

interface Props {
  readonly family: Family;
}

export default function FamilyInfo({ family }: Props) {
  return (
    <>
      <BodySection title={t('family.info.description')} icon="description">
        <p>{family.shortDescription}</p>
      </BodySection>

      <BodySection title={t('family.info.highlights')} icon="auto_awesome">
        <ul className="family-list family-list--highlights">
          {family.highlights.map((highlight: string) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </BodySection>
    </>
  );
}
