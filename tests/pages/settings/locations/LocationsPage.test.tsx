import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LocationsPage from '../../../../src/pages/settings/locations/LocationsPage';
import {
  createLocation,
  deleteLocation,
  getLocationForEdit,
  getLocationList,
  updateLocation
} from '../../../../src/services/locations.service';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { ToastProvider } from '../../../../src/shared/toast/ToastContext';
import { PreconditionFailedError } from '../../../../src/shared/errors/PreconditionFailedError';
import { VALID_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { buildLocation } from '../../../fixtures/locations/buildLocation';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/locations.service', () => ({
  getLocationList: vi.fn(),
  getLocationForEdit: vi.fn(),
  createLocation: vi.fn(),
  updateLocation: vi.fn(),
  deleteLocation: vi.fn()
}));

const mockedGetLocationList = vi.mocked(getLocationList);
const mockedGetLocationForEdit = vi.mocked(getLocationForEdit);
const mockedCreateLocation = vi.mocked(createLocation);
const mockedUpdateLocation = vi.mocked(updateLocation);
const mockedDeleteLocation = vi.mocked(deleteLocation);

function renderLocationsPage() {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={['/settings/locations']}>
            <LocationsPage />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  clearStoredToken();
  setStoredToken(VALID_TEST_TOKEN);
});

describe('LocationsPage', () => {
  it('renderiza el título y estado vacío cuando no hay ubicaciones', async () => {
    mockedGetLocationList.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 25, totalPages: 0, totalItems: 0 }
    });

    renderLocationsPage();

    expect(screen.getByText('Mis ubicaciones')).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByText('Todavía no tienes ninguna ubicación.')
      ).toBeInTheDocument();
    });
  });

  it('permite crear una ubicación con nombre y coordenadas', async () => {
    const user = userEvent.setup();
    mockedGetLocationList.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 25, totalPages: 0, totalItems: 0 }
    });
    const created = buildLocation({
      id: 'loc-1',
      name: 'Huerto nuevo',
      latitude: 40.4168,
      longitude: -3.7038
    });
    mockedCreateLocation.mockResolvedValue({ location: created, etag: '"1"' });

    renderLocationsPage();

    await waitFor(() => {
      expect(screen.getByText('Nueva ubicación')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Nueva ubicación'));

    const nameInput = screen.getByPlaceholderText('Ej. Huerto de casa');
    await user.type(nameInput, 'Huerto nuevo');
    const latInput = screen.getByLabelText('Latitud');
    await user.type(latInput, '40.4168');
    const lngInput = screen.getByLabelText('Longitud');
    await user.type(lngInput, '-3.7038');

    const submitBtn = screen.getByRole('button', { name: 'Crear ubicación' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockedCreateLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Huerto nuevo',
          latitude: 40.4168,
          longitude: -3.7038
        })
      );
    });
  });

  it('permite abrir el modal de edición y guardar cambios', async () => {
    const user = userEvent.setup();
    const existing = buildLocation({ id: 'loc-1', name: 'Huerto original' });
    mockedGetLocationList.mockResolvedValue({
      data: [existing],
      pagination: { page: 1, limit: 25, totalPages: 1, totalItems: 1 }
    });
    mockedGetLocationForEdit.mockResolvedValue({
      location: existing,
      etag: '"1"'
    });
    const updated = buildLocation({ id: 'loc-1', name: 'Huerto modificado' });
    mockedUpdateLocation.mockResolvedValue({ location: updated, etag: '"2"' });

    renderLocationsPage();

    await waitFor(() => {
      expect(screen.getByText('Huerto original')).toBeInTheDocument();
    });

    const editBtn = screen.getByRole('button', {
      name: 'Editar Huerto original'
    });
    await user.click(editBtn);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Huerto original')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Huerto original');
    await user.clear(nameInput);
    await user.type(nameInput, 'Huerto modificado');

    const submitBtn = screen.getByRole('button', { name: 'Guardar cambios' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockedUpdateLocation).toHaveBeenCalledWith(
        'loc-1',
        { name: 'Huerto modificado' },
        '"1"'
      );
    });
  });

  it('permite abrir el modal de eliminación y confirmar borrado', async () => {
    const user = userEvent.setup();
    const existing = buildLocation({ id: 'loc-1', name: 'Huerto a borrar' });
    mockedGetLocationList.mockResolvedValue({
      data: [existing],
      pagination: { page: 1, limit: 25, totalPages: 1, totalItems: 1 }
    });
    mockedGetLocationForEdit.mockResolvedValue({
      location: existing,
      etag: '"1"'
    });
    mockedDeleteLocation.mockResolvedValue(undefined);

    renderLocationsPage();

    await waitFor(() => {
      expect(screen.getByText('Huerto a borrar')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', {
      name: 'Eliminar Huerto a borrar'
    });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByText('¿Eliminar ubicación?')).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole('button', {
      name: 'Eliminar'
    });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockedDeleteLocation).toHaveBeenCalledWith('loc-1', '"1"');
    });
  });

  it('muestra aviso de conflicto al fallar el borrado por precondición', async () => {
    const user = userEvent.setup();
    const existing = buildLocation({
      id: 'loc-1',
      name: 'Huerto en conflicto'
    });
    mockedGetLocationList.mockResolvedValue({
      data: [existing],
      pagination: { page: 1, limit: 25, totalPages: 1, totalItems: 1 }
    });
    mockedGetLocationForEdit.mockResolvedValue({
      location: existing,
      etag: '"1"'
    });
    mockedDeleteLocation.mockRejectedValue(
      new PreconditionFailedError('ETag mismatch')
    );

    renderLocationsPage();

    await waitFor(() => {
      expect(screen.getByText('Huerto en conflicto')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', {
      name: 'Eliminar Huerto en conflicto'
    });
    await user.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', {
      name: 'Eliminar'
    });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText('Conflicto al eliminar')).toBeInTheDocument();
    });
  });
});
