import { NavLink, useLocation } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import { NAVIGATION_ITEMS } from '../navigationItems';
import './appNavRail.css';

export interface AppNavRailProps {
  readonly isExpanded: boolean;
  readonly onToggle: () => void;
}

export default function AppNavRail({ isExpanded, onToggle }: AppNavRailProps) {
  const location = useLocation();

  const railClassName = isExpanded
    ? 'app-nav-rail app-nav-rail--expanded'
    : 'app-nav-rail app-nav-rail--collapsed';

  const toggleLabel = isExpanded
    ? t('app.nav.rail_toggle_collapse')
    : t('app.nav.rail_toggle_expand');

  return (
    <nav className={railClassName} aria-label={t('app.nav.rail_title')}>
      <ul className="app-nav-rail__list">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = item.isMatch(location.pathname);
          const linkClassName = isActive
            ? 'app-nav-rail__link app-nav-rail__link--active'
            : 'app-nav-rail__link';

          return (
            <li key={item.id} className="app-nav-rail__item">
              <NavLink
                to={item.path}
                className={linkClassName}
                aria-current={isActive ? 'page' : undefined}
                aria-label={!isExpanded ? t(item.labelKey) : undefined}
              >
                <Icon name={item.icon} decorative />
                {isExpanded ? (
                  <span className="app-nav-rail__label">
                    {t(item.labelKey)}
                  </span>
                ) : (
                  <span className="app-nav-rail__tooltip" role="tooltip">
                    {t(item.labelKey)}
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="app-nav-rail__footer">
        <button
          type="button"
          className="app-nav-rail__toggle"
          aria-expanded={isExpanded}
          aria-label={toggleLabel}
          onClick={onToggle}
        >
          <Icon
            name={isExpanded ? 'chevron_left' : 'chevron_right'}
            decorative
          />
        </button>
      </div>
    </nav>
  );
}
