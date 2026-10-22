import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NavDrawer from '../../../src/components/layout/NavDrawer/NavDrawer';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import {
  ADMIN_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('NavDrawer', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it('does not render dialog content when closed', () => {
    renderWithProviders(<NavDrawer isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders dialog with accessible attributes when open', () => {
    renderWithProviders(<NavDrawer isOpen={true} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('renders unauthenticated account options when no session exists', () => {
    renderWithProviders(<NavDrawer isOpen={true} onClose={vi.fn()} />);

    expect(
      screen.getByRole('link', { name: /Iniciar sesión/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Crear cuenta/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Configuración de la cuenta/i })
    ).toBeNull();
    expect(screen.queryByRole('button', { name: /Cerrar sesión/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Administración/i })).toBeNull();
  });

  it('renders catalog links in the menu', () => {
    renderWithProviders(<NavDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('link', { name: /Plantas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Familias/i })).toBeInTheDocument();
  });

  it('renders authenticated account options for normal user', () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderWithProviders(<NavDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('hortelano')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Configuración de la cuenta/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Cerrar sesión/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Iniciar sesión/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Crear cuenta/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Administración/i })).toBeNull();
  });

  it('renders administration link for admin user', () => {
    setStoredToken(ADMIN_TEST_TOKEN);

    renderWithProviders(<NavDrawer isOpen={true} onClose={vi.fn()} />);

    expect(
      screen.getByRole('link', { name: /Administración/i })
    ).toBeInTheDocument();
  });

  it('calls onClose when pressing Escape key', () => {
    const handleClose = vi.fn();
    renderWithProviders(<NavDrawer isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['close button', 'button' as const, /^Cerrar$/i],
    ['account settings link', 'link' as const, /Configuración de la cuenta/i],
    ['navigation link', 'link' as const, /Plantas/i]
  ])('calls onClose when clicking %s', async (_, role, namePattern) => {
    const user = userEvent.setup();
    setStoredToken(VALID_TEST_TOKEN);
    const handleClose = vi.fn();
    renderWithProviders(<NavDrawer isOpen={true} onClose={handleClose} />);

    const targetElement = screen.getByRole(role, { name: namePattern });
    await user.click(targetElement);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose and logs out when clicking logout button', async () => {
    const user = userEvent.setup();
    setStoredToken(VALID_TEST_TOKEN);
    const handleClose = vi.fn();
    renderWithProviders(<NavDrawer isOpen={true} onClose={handleClose} />);

    const logoutButton = screen.getByRole('button', { name: /Cerrar sesión/i });
    await user.click(logoutButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });
});
