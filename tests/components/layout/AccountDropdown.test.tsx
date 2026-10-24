import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AccountDropdown from '../../../src/components/layout/AccountDropdown/AccountDropdown';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import {
  ADMIN_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('AccountDropdown', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it('does not render menu when isOpen is false', () => {
    const triggerRef = { current: document.createElement('button') };
    renderWithProviders(
      <AccountDropdown
        isOpen={false}
        onClose={vi.fn()}
        triggerRef={triggerRef}
      />
    );

    const menu = screen.queryByRole('menu');

    expect(menu).toBeNull();
  });

  it('renders menu container with accessible label when isOpen is true', () => {
    const triggerRef = { current: document.createElement('button') };
    renderWithProviders(
      <AccountDropdown
        isOpen={true}
        onClose={vi.fn()}
        triggerRef={triggerRef}
      />
    );

    const menu = screen.getByRole('menu', {
      name: 'Menú de cuenta y configuración'
    });

    expect(menu).toBeInTheDocument();
  });

  describe('unauthenticated state', () => {
    it('renders login link pointing to /login', () => {
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />
      );

      const loginLink = screen.getByRole('menuitem', {
        name: /Iniciar sesión/i
      });

      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('renders register link pointing to /register', () => {
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />
      );

      const registerLink = screen.getByRole('menuitem', {
        name: /Crear cuenta/i
      });

      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it.each([
      ['configuración de cuenta', /Configuración de la cuenta/i],
      ['cerrar sesión', /Cerrar sesión/i],
      ['administración', /Administración/i]
    ] as const)(
      'does not render %s menu item when unauthenticated',
      (_label, pattern) => {
        const triggerRef = { current: document.createElement('button') };
        renderWithProviders(
          <AccountDropdown
            isOpen={true}
            onClose={vi.fn()}
            triggerRef={triggerRef}
          />
        );

        const menuItem = screen.queryByRole('menuitem', { name: pattern });

        expect(menuItem).toBeNull();
      }
    );
  });

  describe('authenticated regular user state', () => {
    it('renders user identification text', () => {
      setStoredToken(VALID_TEST_TOKEN);
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />,
        { initialToken: VALID_TEST_TOKEN }
      );

      const userInfo = screen.getByText(/hortelano/i);

      expect(userInfo).toBeInTheDocument();
    });

    it('renders settings link pointing to /settings', () => {
      setStoredToken(VALID_TEST_TOKEN);
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />,
        { initialToken: VALID_TEST_TOKEN }
      );

      const settingsLink = screen.getByRole('menuitem', {
        name: /Configuración de la cuenta/i
      });

      expect(settingsLink).toBeInTheDocument();
      expect(settingsLink).toHaveAttribute('href', '/settings');
    });

    it('renders logout button', () => {
      setStoredToken(VALID_TEST_TOKEN);
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />,
        { initialToken: VALID_TEST_TOKEN }
      );

      const logoutButton = screen.getByRole('menuitem', {
        name: /Cerrar sesión/i
      });

      expect(logoutButton).toBeInTheDocument();
    });

    it('does not render admin link for regular user', () => {
      setStoredToken(VALID_TEST_TOKEN);
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />,
        { initialToken: VALID_TEST_TOKEN }
      );

      const adminLink = screen.queryByRole('menuitem', {
        name: /Administración/i
      });

      expect(adminLink).toBeNull();
    });
  });

  describe('authenticated admin user state', () => {
    it('renders administration link pointing to /admin', () => {
      setStoredToken(ADMIN_TEST_TOKEN);
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />,
        { initialToken: ADMIN_TEST_TOKEN }
      );

      const adminLink = screen.getByRole('menuitem', {
        name: /Administración/i
      });

      expect(adminLink).toBeInTheDocument();
      expect(adminLink).toHaveAttribute('href', '/admin');
    });
  });

  describe('catalog isolation invariant', () => {
    it.each([
      ['anónimo', undefined],
      ['usuario estándar', VALID_TEST_TOKEN],
      ['administrador', ADMIN_TEST_TOKEN]
    ] as const)(
      'never renders catalog links (/plants, /families) for session state %s',
      (_stateName, token) => {
        if (token) {
          setStoredToken(token);
        }
        const triggerRef = { current: document.createElement('button') };
        renderWithProviders(
          <AccountDropdown
            isOpen={true}
            onClose={vi.fn()}
            triggerRef={triggerRef}
          />,
          { initialToken: token }
        );

        expect(screen.queryByRole('link', { name: /Plantas/i })).toBeNull();
        expect(screen.queryByRole('link', { name: /Familias/i })).toBeNull();
      }
    );
  });

  describe('interactions and accessibility', () => {
    it('closes menu and restores focus to triggerRef when Escape is pressed', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      const triggerRef = { current: trigger };
      const onClose = vi.fn();
      try {
        renderWithProviders(
          <AccountDropdown
            isOpen={true}
            onClose={onClose}
            triggerRef={triggerRef}
          />
        );

        fireEvent.keyDown(window, { key: 'Escape' });

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(document.activeElement).toBe(trigger);
      } finally {
        document.body.removeChild(trigger);
      }
    });

    it('closes menu when clicking outside', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      const triggerRef = { current: trigger };
      const onClose = vi.fn();
      try {
        renderWithProviders(
          <AccountDropdown
            isOpen={true}
            onClose={onClose}
            triggerRef={triggerRef}
          />
        );

        fireEvent.pointerDown(document.body);

        expect(onClose).toHaveBeenCalledTimes(1);
      } finally {
        document.body.removeChild(trigger);
      }
    });

    it('invokes onClose when a menu link is clicked', async () => {
      const user = userEvent.setup();
      const triggerRef = { current: document.createElement('button') };
      const onClose = vi.fn();
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={onClose}
          triggerRef={triggerRef}
        />
      );

      const loginLink = screen.getByRole('menuitem', {
        name: /Iniciar sesión/i
      });
      await user.click(loginLink);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('invokes logout and onClose when logout button is clicked', async () => {
      const user = userEvent.setup();
      setStoredToken(VALID_TEST_TOKEN);
      const triggerRef = { current: document.createElement('button') };
      const onClose = vi.fn();
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={onClose}
          triggerRef={triggerRef}
        />,
        { initialToken: VALID_TEST_TOKEN }
      );

      const logoutButton = screen.getByRole('menuitem', {
        name: /Cerrar sesión/i
      });
      await user.click(logoutButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('focuses the first menu item when opened', () => {
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />
      );

      const loginLink = screen.getByRole('menuitem', {
        name: /Iniciar sesión/i
      });

      expect(document.activeElement).toBe(loginLink);
    });

    it('moves focus to the next menu item on ArrowDown', () => {
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />
      );

      fireEvent.keyDown(window, { key: 'ArrowDown' });

      const registerLink = screen.getByRole('menuitem', {
        name: /Crear cuenta/i
      });
      expect(document.activeElement).toBe(registerLink);
    });

    it('wraps focus to the first menu item on ArrowDown from the last item', () => {
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />
      );

      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });

      const loginLink = screen.getByRole('menuitem', {
        name: /Iniciar sesión/i
      });
      expect(document.activeElement).toBe(loginLink);
    });

    it('wraps focus to the last menu item on ArrowUp from the first item', () => {
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />
      );

      fireEvent.keyDown(window, { key: 'ArrowUp' });

      const registerLink = screen.getByRole('menuitem', {
        name: /Crear cuenta/i
      });
      expect(document.activeElement).toBe(registerLink);
    });

    it('moves focus to the previous menu item on ArrowUp', () => {
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />
      );

      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowUp' });

      const loginLink = screen.getByRole('menuitem', {
        name: /Iniciar sesión/i
      });
      expect(document.activeElement).toBe(loginLink);
    });

    it('moves focus to the first menu item on Home key', () => {
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />
      );

      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'Home' });

      const loginLink = screen.getByRole('menuitem', {
        name: /Iniciar sesión/i
      });
      expect(document.activeElement).toBe(loginLink);
    });

    it('moves focus to the last menu item on End key', () => {
      const triggerRef = { current: document.createElement('button') };
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={vi.fn()}
          triggerRef={triggerRef}
        />
      );

      fireEvent.keyDown(window, { key: 'End' });

      const registerLink = screen.getByRole('menuitem', {
        name: /Crear cuenta/i
      });
      expect(document.activeElement).toBe(registerLink);
    });

    it('closes menu on Tab key', () => {
      const triggerRef = { current: document.createElement('button') };
      const onClose = vi.fn();
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={onClose}
          triggerRef={triggerRef}
        />
      );

      fireEvent.keyDown(window, { key: 'Tab' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes menu and restores focus to trigger on Shift+Tab key', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      const triggerRef = { current: trigger };
      const onClose = vi.fn();
      try {
        renderWithProviders(
          <AccountDropdown
            isOpen={true}
            onClose={onClose}
            triggerRef={triggerRef}
          />
        );

        fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(document.activeElement).toBe(trigger);
      } finally {
        document.body.removeChild(trigger);
      }
    });

    it('activates anchor menu item when Space key is pressed', () => {
      const triggerRef = { current: document.createElement('button') };
      const onClose = vi.fn();
      renderWithProviders(
        <AccountDropdown
          isOpen={true}
          onClose={onClose}
          triggerRef={triggerRef}
        />
      );

      fireEvent.keyDown(window, { key: ' ' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
