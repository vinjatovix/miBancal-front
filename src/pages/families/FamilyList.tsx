import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { t } from '../../i18n/core/t';
import { AuthContext } from '../../shared/auth/authContextDef';
import { ErrorResponse } from '../../shared/components/ErrorResponse/ErrorResponse';
import Icon from '../../shared/components/Icon/Icon';
import { Loader } from '../../shared/components/Loader/Loader';
import ScientificName from '../../shared/components/ScientificName/ScientificName';
import { useFamilies } from '../../shared/hooks/useFamilies';
import { getQueryViewState } from '../../shared/reactQuery/queryViewState';
import type { FamilyListItem } from '../../types/Family';

import './familyList.css';

function FamilyCards({ families }: { readonly families: FamilyListItem[] }) {
  if (families.length === 0) return <p>{t('family.empty')}</p>;

  return (
    <div className="family-grid">
      {families.map((family) => (
        <Link
          key={family.id}
          to={`/families/${family.id}`}
          className="family-card"
        >
          <h3>
            <ScientificName variant="title">
              {family.scientificName}
            </ScientificName>
          </h3>
          <p>{family.name}</p>
        </Link>
      ))}
    </div>
  );
}

export default function FamilyList() {
  const query = useFamilies();
  const auth = useContext(AuthContext);
  const isEditor = auth?.isEditor ?? false;
  const viewState = getQueryViewState(query);

  if (viewState === 'loading') return <Loader />;

  if (viewState === 'error') {
    return (
      <ErrorResponse error={query.error} onRetry={() => void query.refetch()} />
    );
  }

  return (
    <div>
      <div className="family-list__header">
        <h1>{t('family.families')}</h1>
        {isEditor && (
          <Link
            to="/families/new"
            className="family-list__create-btn"
            aria-label={t('family.catalog.new_family')}
          >
            <Icon name="spa" decorative />
            <span>{t('family.catalog.new_family')}</span>
          </Link>
        )}
      </div>

      <FamilyCards families={query.data ?? []} />
    </div>
  );
}
