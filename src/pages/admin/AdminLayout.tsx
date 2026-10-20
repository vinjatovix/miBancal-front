import { useRef, useState } from 'react';
import { Link, Outlet, ScrollRestoration } from 'react-router-dom';

import { IS_DEV } from '../../config/env';
import { t } from '../../i18n/core/t';
import Icon from '../../shared/components/Icon/Icon';
import DevBanner from '../../components/layout/DevBanner/DevBanner';
import AdminNavDrawer from './components/AdminNavDrawer';
import './adminLayout.css';

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);
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
          aria-label={t('app.nav.menu')}
          aria-expanded={isOpen}
          aria-controls="app-nav-dialog"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className="app-menu-bar" />
          <span className="app-menu-bar" />
          <span className="app-menu-bar" />
        </button>
      </header>

      <AdminNavDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={toggleButtonRef}
      />

      <main className="app-content">
        <Outlet />
      </main>

      <DevBanner />
    </div>
  );
}
