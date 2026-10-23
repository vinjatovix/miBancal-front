import { useRef, useState } from 'react';
import { Link, Outlet, ScrollRestoration } from 'react-router-dom';

import { IS_DEV } from '../../config/env';
import { t } from '../../i18n/core/t';
import Icon from '../../shared/components/Icon/Icon';
import AccountDropdown from './AccountDropdown/AccountDropdown';
import AppBottomNav from './AppBottomNav/AppBottomNav';
import AppNavRail from './AppNavRail/AppNavRail';
import DevBanner from './DevBanner/DevBanner';
import { useNavRailState } from './useNavRailState';
import './mainLayout.css';

export default function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const { isExpanded: isRailExpanded, toggleRail } = useNavRailState();
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);

  const shellClassName = IS_DEV ? 'app-shell app-shell--dev' : 'app-shell';

  return (
    <div className={shellClassName}>
      <ScrollRestoration />
      <header className="app-header">
        <div className="app-brand">
          <Link to="/">
            <Icon name="grain" decorative /> {t('app.brand')}
          </Link>
        </div>

        <button
          ref={toggleButtonRef}
          type="button"
          className="app-menu-toggle"
          aria-label={t('app.nav.account_menu')}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-controls="account-dropdown-menu"
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setIsOpen(true);
            }
          }}
        >
          <span className="app-menu-bar" />
          <span className="app-menu-bar" />
          <span className="app-menu-bar" />
        </button>

        <AccountDropdown
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          triggerRef={toggleButtonRef}
        />
      </header>

      <div className="app-body">
        <AppNavRail isExpanded={isRailExpanded} onToggle={toggleRail} />

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <AppBottomNav />

      <DevBanner />
    </div>
  );
}
