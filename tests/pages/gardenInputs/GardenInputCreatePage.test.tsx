import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GardenInputCreatePage from '../../../src/pages/gardenInputs/GardenInputCreatePage';
import { createGardenInput } from '../../../src/services/gardenInputs.service';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { buildGardenInput } from '../../fixtures/gardenInputs/gardenInputFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

vi.mock('../../../src/services/gardenInputs.service', () => ({
  createGardenInput: vi.fn()
}));

const mockedCreateGardenInput = vi.mocked(createGardenInput);

describe('GardenInputCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders creation page title and subtitle', () => {
    renderWithProviders(<GardenInputCreatePage />, {
      route: '/garden-inputs/new',
      path: '/garden-inputs/new'
    });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Nuevo insumo' })
    ).toBeInTheDocument();
  });

  it('shows client validation errors when submitting with empty required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GardenInputCreatePage />, {
      route: '/garden-inputs/new',
      path: '/garden-inputs/new'
    });

    const submitBtn = screen.getByRole('button', { name: 'Crear insumo' });
    await user.click(submitBtn);

    expect(
      await screen.findByText('El nombre es obligatorio.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('El identificador es obligatorio.')
    ).toBeInTheDocument();
    expect(mockedCreateGardenInput).not.toHaveBeenCalled();
  });

  it('calls createGardenInput mutation and redirects on success', async () => {
    const user = userEvent.setup();
    const createdInput = buildGardenInput({ slug: 'macerado-ajo' });
    mockedCreateGardenInput.mockResolvedValue({
      gardenInput: createdInput,
      etag: '"v1"'
    });

    renderWithProviders(<GardenInputCreatePage />, {
      route: '/garden-inputs/new',
      path: '/garden-inputs/new'
    });

    const nameInput = screen.getByLabelText(/Nombre \*/i);
    const slugInput = screen.getByLabelText(/Identificador \(slug\) \*/i);

    await user.type(nameInput, 'Macerado de ajo');
    await user.type(slugInput, 'macerado-ajo');

    const submitBtn = screen.getByRole('button', { name: 'Crear insumo' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockedCreateGardenInput).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Macerado de ajo',
          slug: 'macerado-ajo',
          category: 'defense'
        })
      );
    });
  });

  it('displays duplicate slug server error when api responds with 409', async () => {
    const user = userEvent.setup();
    mockedCreateGardenInput.mockRejectedValue(new ApiError('Duplicate', 409));

    renderWithProviders(<GardenInputCreatePage />, {
      route: '/garden-inputs/new',
      path: '/garden-inputs/new'
    });

    const nameInput = screen.getByLabelText(/Nombre \*/i);
    const slugInput = screen.getByLabelText(/Identificador \(slug\) \*/i);

    await user.type(nameInput, 'Macerado de ajo');
    await user.type(slugInput, 'macerado-ajo');

    const submitBtn = screen.getByRole('button', { name: 'Crear insumo' });
    await user.click(submitBtn);

    expect(
      await screen.findByText(
        'Ya existe un insumo con este identificador (slug).'
      )
    ).toBeInTheDocument();
  });

  it('displays generic server error when api responds with unexpected error', async () => {
    const user = userEvent.setup();
    mockedCreateGardenInput.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<GardenInputCreatePage />, {
      route: '/garden-inputs/new',
      path: '/garden-inputs/new'
    });

    const nameInput = screen.getByLabelText(/Nombre \*/i);
    const slugInput = screen.getByLabelText(/Identificador \(slug\) \*/i);

    await user.type(nameInput, 'Macerado de ajo');
    await user.type(slugInput, 'macerado-ajo');

    const submitBtn = screen.getByRole('button', { name: 'Crear insumo' });
    await user.click(submitBtn);

    expect(
      await screen.findByText(
        'Ha ocurrido un error inesperado al guardar el insumo.'
      )
    ).toBeInTheDocument();
  });
});
