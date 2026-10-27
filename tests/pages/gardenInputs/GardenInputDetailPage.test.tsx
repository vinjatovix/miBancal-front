import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GardenInputDetailPage from '../../../src/pages/gardenInputs/GardenInputDetail/GardenInputDetailPage';
import { getGardenInput } from '../../../src/services/gardenInputs.service';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { ADMIN_TEST_TOKEN } from '../../fixtures/auth/authFixtures';
import {
  buildGardenInput,
  buildRecipe
} from '../../fixtures/gardenInputs/gardenInputFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

vi.mock('../../../src/services/gardenInputs.service', () => ({
  getGardenInput: vi.fn(),
  getGardenInputWithMeta: vi.fn()
}));

const mockedGetGardenInput = vi.mocked(getGardenInput);

describe('GardenInputDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders garden input hero information with name and category', async () => {
    const input = buildGardenInput({
      name: 'Purín de ortiga',
      category: 'defense',
      actions: []
    });
    mockedGetGardenInput.mockResolvedValue(input);

    renderWithProviders(<GardenInputDetailPage />, {
      route: '/garden-inputs/purin-ortiga',
      path: '/garden-inputs/:slug'
    });

    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Purín de ortiga'
    });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText('Defensa')).toBeInTheDocument();
  });

  it('renders collapsible recipe cards for each recipe', async () => {
    const recipe = buildRecipe({ name: 'Receta de ortiga concentrada' });
    const input = buildGardenInput({ recipes: [recipe] });
    mockedGetGardenInput.mockResolvedValue(input);

    renderWithProviders(<GardenInputDetailPage />, {
      route: '/garden-inputs/purin-ortiga',
      path: '/garden-inputs/:slug'
    });

    const recipeTitle = await screen.findByText('Receta de ortiga concentrada');
    expect(recipeTitle).toBeInTheDocument();
  });

  it('renders empty recipes notice when input has no recipes', async () => {
    const input = buildGardenInput({ recipes: [] });
    mockedGetGardenInput.mockResolvedValue(input);

    renderWithProviders(<GardenInputDetailPage />, {
      route: '/garden-inputs/purin-ortiga',
      path: '/garden-inputs/:slug'
    });

    const emptyNotice = await screen.findByText(
      'Este insumo no tiene recetas registradas todavía.'
    );
    expect(emptyNotice).toBeInTheDocument();
  });

  it('renders NotFound view when api returns 404', async () => {
    mockedGetGardenInput.mockRejectedValue(new ApiError('Not found', 404));

    renderWithProviders(<GardenInputDetailPage />, {
      route: '/garden-inputs/no-existe',
      path: '/garden-inputs/:slug'
    });

    const notFoundHeading = await screen.findByRole('heading', {
      level: 1,
      name: 'Insumo no encontrado'
    });
    expect(notFoundHeading).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Volver al catálogo de insumos' })
    ).toHaveAttribute('href', '/garden-inputs');
  });

  it('opens edit modal when editor clicks edit button', async () => {
    const user = userEvent.setup();
    const input = buildGardenInput();
    mockedGetGardenInput.mockResolvedValue(input);

    renderWithProviders(<GardenInputDetailPage />, {
      route: '/garden-inputs/purin-ortiga',
      path: '/garden-inputs/:slug',
      initialToken: ADMIN_TEST_TOKEN
    });

    const editButton = await screen.findByRole('button', { name: 'Editar' });
    await user.click(editButton);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Editar insumo' })
    ).toBeInTheDocument();
  });

  it('opens delete dialog when editor clicks delete button', async () => {
    const user = userEvent.setup();
    const input = buildGardenInput();
    mockedGetGardenInput.mockResolvedValue(input);

    renderWithProviders(<GardenInputDetailPage />, {
      route: '/garden-inputs/purin-ortiga',
      path: '/garden-inputs/:slug',
      initialToken: ADMIN_TEST_TOKEN
    });

    const deleteButton = await screen.findByRole('button', {
      name: 'Eliminar'
    });
    await user.click(deleteButton);

    expect(
      screen.getByRole('heading', { name: '¿Eliminar insumo?' })
    ).toBeInTheDocument();
  });
});
