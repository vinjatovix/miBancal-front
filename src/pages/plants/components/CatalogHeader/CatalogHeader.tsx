import { t } from '../../../../i18n/core/t';

import './catalogHeader.css';

const NUMBER_FORMAT = new Intl.NumberFormat('es');

interface Props {
  readonly totalItems: number | undefined;
  readonly summary: string;
}

export default function CatalogHeader({ totalItems, summary }: Props) {
  return (
    <div className="catalog-header">
      <div className="catalog-header__info">
        {totalItems !== undefined && (
          <p className="catalog-header__count">
            {t('plant.catalog.species_count', {
              n: NUMBER_FORMAT.format(totalItems)
            })}
          </p>
        )}

        {summary && <p className="catalog-header__summary">{summary}</p>}
      </div>
    </div>
  );
}
