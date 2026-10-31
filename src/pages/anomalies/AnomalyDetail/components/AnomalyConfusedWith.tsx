import { Link } from 'react-router-dom';

import { t } from '../../../../i18n/core/t';
import Badge from '../../../../shared/components/Badge/Badge';
import BodySection from '../../../../shared/components/BodySection/BodySection';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';

import './anomalyConfusedWith.css';

interface Props {
  readonly slugs?: readonly string[];
}

function slugToLabel(slug: string): string {
  return slug.split('-').filter(Boolean).map(capitalizeFirstLetter).join(' ');
}

export function AnomalyConfusedWith({ slugs }: Props) {
  if (!slugs || slugs.length === 0) {
    return null;
  }

  return (
    <BodySection title={t('anomaly.sections.confused_with')} icon="sync_alt">
      <div className="anomaly-confused-with__list">
        {slugs.map((slug) => (
          <Link
            key={slug}
            to={`/anomalies/${slug}`}
            className="anomaly-confused-with__link"
          >
            <Badge variant="family">{slugToLabel(slug)}</Badge>
          </Link>
        ))}
      </div>
    </BodySection>
  );
}
