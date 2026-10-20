import { useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import { useAuth } from '../../../shared/auth/useAuth';
import Icon from '../../../shared/components/Icon/Icon';
import './navDrawer.css';

interface NavDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function AdminNavDrawer({
  isOpen,
  onClose,
  triggerRef
}: NavDrawerProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLElement | null>(null);

  const handleLogout = useCallback(() => {
    logout();
    onClose();
    navigate('/');
  }, [logout, onClose, navigate]);

  useEffect(() => {
    if (!isOpen) return;

    const previousActive = document.activeElement as HTMLElement | null;
    const triggerElement = triggerRef?.current;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const drawer = drawerRef.current;
    const focusable = drawer?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab' && drawer) {
        const elements = drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        if (elements.length === 0) return;
        const first = elements[0];
        const last = elements[elements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      const target = triggerElement ?? previousActive;
      target?.focus();
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="nav-drawer-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        id="app-nav-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t('app.nav.menu_title')}
        className="nav-drawer"
        ref={drawerRef}
      >
        <div className="nav-drawer-header">
          <div className="nav-drawer-brand">
            <Icon name="grain" decorative />
            <span>{t('app.brand')}</span>
          </div>
          <button
            type="button"
            className="nav-drawer-close"
            onClick={onClose}
            aria-label={t('app.nav.close')}
          >
            <Icon name="close" decorative />
          </button>
        </div>

        <div className="nav-drawer-content">
          <section className="nav-drawer-section nav-account-section">
            <div className="nav-drawer-user">
              <span>{user?.username ?? user?.email}</span>
            </div>
            <Link to="/admin" onClick={onClose} className="nav-drawer-link">
              <Icon name="admin_panel_settings" decorative />
              <span>{t('admin.heading')}</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="nav-drawer-button"
            >
              <Icon name="close" decorative />
              <span>{t('auth.logout')}</span>
            </button>
          </section>
        </div>
      </aside>
    </>
  );
}
