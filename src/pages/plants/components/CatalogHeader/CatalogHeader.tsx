import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { t } from '../../../../i18n/core/t';
import { AuthContext } from '../../../../shared/auth/authContextDef';
import Icon from '../../../../shared/components/Icon/Icon';

import './catalogHeader.css';

const NUMBER_FORMAT = new Intl.NumberFormat('es');

interface Props {
  readonly totalItems: number | undefined;
  readonly summary: string;
}

export default function CatalogHeader({ totalItems, summary }: Props) {
  const auth = useContext(AuthContext);
  const isEditor = auth?.isEditor ?? false;

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

      {isEditor && (
        <Link
          to="/plants/new"
          className="catalog-header__create-btn"
          aria-label={t('plant.catalog.new_plant')}
        >
          <Icon name="potted_plant" decorative />
          <span>{t('plant.catalog.new_plant')}</span>
        </Link>
      )}
    </div>
  );
}
