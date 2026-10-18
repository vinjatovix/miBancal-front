import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let mockGithubClientId: string | undefined = 'test-github-client-id';

vi.mock('../../../../src/config/env', () => ({
  get GITHUB_CLIENT_ID() {
    return mockGithubClientId;
  }
}));

import GitHubAuthButton from '../../../../src/pages/auth/components/GitHubAuthButton';
import { PKCE_RETURN_URL_KEY } from '../../../../src/shared/auth/pkce';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

describe('GitHubAuthButton', () => {
  beforeEach(() => {
    mockGithubClientId = 'test-github-client-id';
    sessionStorage.clear();
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
        pathname: '/login',
        href: ''
      },
      writable: true
    });
  });

  it('renders nothing when GITHUB_CLIENT_ID is not configured', () => {
    mockGithubClientId = undefined;

    const { container } = renderWithProviders(<GitHubAuthButton />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders button with correct text', () => {
    renderWithProviders(<GitHubAuthButton />);

    const button = screen.getByRole('button', {
      name: /continuar con github/i
    });

    expect(button).toBeInTheDocument();
  });

  it.each([
    ['/admin', '/admin'],
    ['/plants?cycle=annual#gallery', '/plants?cycle=annual#gallery']
  ])(
    'preserves normalized string returnUrl %s into sessionStorage when initiating from /login',
    async (fromPath, expected) => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAuthButton />, {
        route: {
          pathname: '/login',
          state: { from: fromPath }
        }
      });

      const button = screen.getByRole('button', {
        name: /continuar con github/i
      });
      await user.click(button);

      await waitFor(() => {
        expect(sessionStorage.getItem(PKCE_RETURN_URL_KEY)).toBe(expected);
      });
    }
  );

  it.each([
    [{ pathname: '/admin' }, '/admin'],
    [
      { pathname: '/plants', search: '?cycle=annual', hash: '#gallery' },
      '/plants?cycle=annual#gallery'
    ]
  ])(
    'preserves normalized Location object returnUrl into sessionStorage when initiating from /login',
    async (locationObject, expected) => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAuthButton />, {
        route: {
          pathname: '/login',
          state: { from: locationObject }
        }
      });

      const button = screen.getByRole('button', {
        name: /continuar con github/i
      });
      await user.click(button);

      await waitFor(() => {
        expect(sessionStorage.getItem(PKCE_RETURN_URL_KEY)).toBe(expected);
      });
    }
  );

  it.each(['//malicious.com', '/login', '/register'])(
    'normalizes unsafe destination %s to root into sessionStorage',
    async (unsafeDestination) => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAuthButton />, {
        route: {
          pathname: '/login',
          state: { from: unsafeDestination }
        }
      });

      const button = screen.getByRole('button', {
        name: /continuar con github/i
      });
      await user.click(button);

      await waitFor(() => {
        expect(sessionStorage.getItem(PKCE_RETURN_URL_KEY)).toBe('/');
      });
    }
  );

  it('preserves current pathname when initiating outside /login', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GitHubAuthButton />, {
      route: '/plants'
    });

    const button = screen.getByRole('button', {
      name: /continuar con github/i
    });
    await user.click(button);

    await waitFor(() => {
      expect(sessionStorage.getItem(PKCE_RETURN_URL_KEY)).toBe('/plants');
    });
  });

  it('disables button when disabled prop is true', () => {
    renderWithProviders(<GitHubAuthButton disabled={true} />);

    const button = screen.getByRole('button', {
      name: /continuar con github/i
    });

    expect(button).toBeDisabled();
  });
});
