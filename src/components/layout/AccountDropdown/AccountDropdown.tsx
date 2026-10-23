import type React from 'react';
import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import { useAuth } from '../../../shared/auth/useAuth';
import Icon from '../../../shared/components/Icon/Icon';
import './accountDropdown.css';

export interface AccountDropdownProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export default function AccountDropdown({
  isOpen,
  onClose,
  triggerRef
}: AccountDropdownProps) {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const getMenuItems = (): HTMLElement[] => {
      if (!dropdownRef.current) {
        return [];
      }
      return Array.from(
        dropdownRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]')
      );
    };

    const initialItems = getMenuItems();
    initialItems[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        triggerRef.current?.focus();
        return;
      }

      if (event.key === 'Tab') {
        onClose();
        if (event.shiftKey) {
          event.preventDefault();
          triggerRef.current?.focus();
        }
        return;
      }

      const items = getMenuItems();
      if (items.length === 0) {
        return;
      }

      const currentIndex = items.findIndex(
        (item) => item === document.activeElement
      );

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex =
          currentIndex === -1 || currentIndex === items.length - 1
            ? 0
            : currentIndex + 1;
        items[nextIndex]?.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex =
          currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        items[prevIndex]?.focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        items[0]?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        items[items.length - 1]?.focus();
      } else if (
        (event.key === ' ' || event.key === 'Spacebar') &&
        document.activeElement instanceof HTMLAnchorElement
      ) {
        event.preventDefault();
        document.activeElement.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, triggerRef]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) {
    return null;
  }

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <div
      id="account-dropdown-menu"
      role="menu"
      aria-label={t('app.nav.account_menu')}
      className="account-dropdown"
      ref={dropdownRef}
    >
      {isAuthenticated ? (
        <>
          <div className="account-dropdown__user" role="none">
            <span>{user?.username ?? user?.email}</span>
          </div>

          <Link
            to="/settings"
            onClick={onClose}
            role="menuitem"
            tabIndex={-1}
            className="account-dropdown__item"
          >
            <Icon name="settings" decorative />
            <span>{t('settings.nav_link')}</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              role="menuitem"
              tabIndex={-1}
              className="account-dropdown__item"
            >
              <Icon name="admin_panel_settings" decorative />
              <span>{t('admin.heading')}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            role="menuitem"
            tabIndex={-1}
            className="account-dropdown__item account-dropdown__item--button"
          >
            <Icon name="close" decorative />
            <span>{t('auth.logout')}</span>
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            onClick={onClose}
            role="menuitem"
            tabIndex={-1}
            className="account-dropdown__item"
          >
            <Icon name="login" decorative />
            <span>{t('auth.login')}</span>
          </Link>

          <Link
            to="/register"
            onClick={onClose}
            role="menuitem"
            tabIndex={-1}
            className="account-dropdown__item"
          >
            <Icon name="person_add" decorative />
            <span>{t('auth.register')}</span>
          </Link>
        </>
      )}
    </div>
  );
}
