import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GardenInputDetailPage from '../../../src/pages/gardenInputs/GardenInputDetail/GardenInputDetailPage';
import GardenInputsPage from '../../../src/pages/gardenInputs/GardenInputsPage';
import {
  getGardenInput,
  getGardenInputList
} from '../../../src/services/gardenInputs.service';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import {
  ADMIN_TEST_TOKEN,
  COLLABORATOR_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';
import {
  buildGardenInput,
  buildGardenInputListItem
} from '../../fixtures/gardenInputs/gardenInputFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

vi.mock('../../../src/services/gardenInputs.service', () => ({
  getGardenInputList: vi.fn(),
  getGardenInput: vi.fn(),
  getGardenInputWithMeta: vi.fn()
}));

const mockedGetGardenInputList = vi.mocked(getGardenInputList);
const mockedGetGardenInput = vi.mocked(getGardenInput);

describe('Garden Inputs Editorial Permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    clearStoredToken();

    mockedGetGardenInputList.mockResolvedValue({
      data: [buildGardenInputListItem()],
      pagination: { page: 1, limit: 25, totalPages: 1, totalItems: 1 }
    });
    mockedGetGardenInput.mockResolvedValue(buildGardenInput());
  });

  it('hides create button on catalog page for anonymous user', async () => {
    renderWithProviders(<GardenInputsPage />, {
      route: '/garden-inputs',
      path: '/garden-inputs'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    expect(
      screen.queryByRole('link', { name: 'Nuevo insumo' })
    ).not.toBeInTheDocument();
  });

  it('hides create button on catalog page for regular authenticated user', async () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderWithProviders(<GardenInputsPage />, {
      route: '/garden-inputs',
      path: '/garden-inputs'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    expect(
      screen.queryByRole('link', { name: 'Nuevo insumo' })
    ).not.toBeInTheDocument();
  });

  it.each([
    ['admin', ADMIN_TEST_TOKEN],
    ['collaborator', COLLABORATOR_TEST_TOKEN]
  ])(
    'displays create button on catalog page for %s role',
    async (_role, token) => {
      setStoredToken(token);

      renderWithProviders(<GardenInputsPage />, {
        route: '/garden-inputs',
        path: '/garden-inputs'
      });

      await screen.findByRole('link', { name: /Ver ficha de/ });

      expect(
        screen.getByRole('link', { name: 'Nuevo insumo' })
      ).toBeInTheDocument();
    }
  );

  it('hides edit and delete buttons on detail page for anonymous user', async () => {
    renderWithProviders(<GardenInputDetailPage />, {
      route: '/garden-inputs/purin-ortiga',
      path: '/garden-inputs/:slug'
    });

    await screen.findByRole('heading', { level: 1 });

    expect(
      screen.queryByRole('button', { name: 'Editar' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Eliminar' })
    ).not.toBeInTheDocument();
  });

  it('hides edit and delete buttons on detail page for regular user', async () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderWithProviders(<GardenInputDetailPage />, {
      route: '/garden-inputs/purin-ortiga',
      path: '/garden-inputs/:slug'
    });

    await screen.findByRole('heading', { level: 1 });

    expect(
      screen.queryByRole('button', { name: 'Editar' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Eliminar' })
    ).not.toBeInTheDocument();
  });

  it.each([
    ['admin', ADMIN_TEST_TOKEN],
    ['collaborator', COLLABORATOR_TEST_TOKEN]
  ])(
    'displays edit and delete buttons on detail page for %s role',
    async (_role, token) => {
      setStoredToken(token);

      renderWithProviders(<GardenInputDetailPage />, {
        route: '/garden-inputs/purin-ortiga',
        path: '/garden-inputs/:slug'
      });

      await screen.findByRole('heading', { level: 1 });

      expect(
        screen.getByRole('button', { name: 'Editar' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Eliminar' })
      ).toBeInTheDocument();
    }
  );
});
