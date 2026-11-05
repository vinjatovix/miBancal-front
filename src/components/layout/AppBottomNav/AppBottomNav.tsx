import { NavLink, useLocation } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import { NAVIGATION_ITEMS } from '../navigationItems';
import './appBottomNav.css';

export default function AppBottomNav() {
  const location = useLocation();

  return (
    <nav className="app-bottom-nav" aria-label={t('app.nav.bottom_title')}>
      <ul className="app-bottom-nav__list">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = item.isMatch(location.pathname);
          const linkClassName = isActive
            ? 'app-bottom-nav__link app-bottom-nav__link--active'
            : 'app-bottom-nav__link';

          return (
            <li key={item.id} className="app-bottom-nav__item">
              <NavLink
                to={item.path}
                className={linkClassName}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon name={item.icon} decorative />
                <span className="app-bottom-nav__label">
                  {t(item.labelKey)}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
