import { useContext, useId } from 'react';
import { useSearchParams } from 'react-router-dom';

import { t } from '../../../../i18n/core/t';
import { AuthContext } from '../../../../shared/auth/authContextDef';
import {
  FAVORITES_TAB_VALUE,
  PLANT_LIST_URL_PARAMS,
  isFavoritesTab
} from '../../../../shared/constants/plantListUrlParams';
import {
  withListParam,
  withoutListParam
} from '../../utils/plantListParamWrites';

import './catalogTabs.css';

function tabClass(active: boolean): string {
  return active
    ? 'catalog-tabs__tab catalog-tabs__tab--active'
    : 'catalog-tabs__tab';
}

export default function CatalogTabs() {
  const auth = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const labelId = useId();

  if (!auth?.isAuthenticated) return null;

  const favoritesActive = isFavoritesTab(params);

  function selectAll() {
    setParams((prev) => withoutListParam(prev, PLANT_LIST_URL_PARAMS.tab));
  }

  function selectFavorites() {
    setParams((prev) =>
      withListParam(prev, PLANT_LIST_URL_PARAMS.tab, FAVORITES_TAB_VALUE)
    );
  }

  return (
    <div className="catalog-tabs" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="catalog-tabs__label">
        {t('plant.tabs.group_label')}
      </span>

      <button
        type="button"
        aria-pressed={!favoritesActive}
        className={tabClass(!favoritesActive)}
        onClick={selectAll}
      >
        {t('plant.tabs.all')}
      </button>
      <button
        type="button"
        aria-pressed={favoritesActive}
        className={tabClass(favoritesActive)}
        onClick={selectFavorites}
      >
        {t('plant.tabs.favorites')}
      </button>
    </div>
  );
}
