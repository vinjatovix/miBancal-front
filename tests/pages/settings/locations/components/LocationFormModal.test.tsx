import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LocationFormModal from '../../../../../src/pages/settings/locations/components/LocationFormModal/LocationFormModal';
import {
  createLocation,
  getLocationForEdit,
  updateLocation
} from '../../../../../src/services/locations.service';
import { AuthProvider } from '../../../../../src/shared/auth/AuthContext';
import { setStoredToken } from '../../../../../src/shared/auth/session';
import { PreconditionFailedError } from '../../../../../src/shared/errors/PreconditionFailedError';
import { ToastProvider } from '../../../../../src/shared/toast/ToastContext';
import { VALID_TEST_TOKEN } from '../../../../fixtures/auth/authFixtures';
import { buildLocation } from '../../../../fixtures/locations/buildLocation';
import { createTestQueryClient } from '../../../../test-utils/createTestQueryClient';

vi.mock('../../../../../src/services/locations.service', () => ({
  getLocationList: vi.fn(),
  getLocationForEdit: vi.fn(),
  createLocation: vi.fn(),
  updateLocation: vi.fn(),
  deleteLocation: vi.fn()
}));

const mockedGetLocationForEdit = vi.mocked(getLocationForEdit);
const mockedCreateLocation = vi.mocked(createLocation);
const mockedUpdateLocation = vi.mocked(updateLocation);

function renderLocationFormModal(
  props: React.ComponentProps<typeof LocationFormModal>
) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <LocationFormModal {...props} />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  setStoredToken(VALID_TEST_TOKEN);
});

describe('LocationFormModal - create mode', () => {
  it('renderiza el título de creación y los campos vacíos', () => {
    renderLocationFormModal({
      isOpen: true,
      onClose: vi.fn()
    });

    expect(screen.getByText('Nueva ubicación')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Huerto de casa')).toHaveValue('');
  });

  it('no envía el formulario si hay errores de validación', async () => {
    const user = userEvent.setup();

    renderLocationFormModal({
      isOpen: true,
      onClose: vi.fn()
    });

    const submitBtn = screen.getByRole('button', { name: 'Crear ubicación' });
    await user.click(submitBtn);

    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
    expect(mockedCreateLocation).not.toHaveBeenCalled();
  });

  it('llama a createLocation y cierra al tener éxito', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleSaved = vi.fn();
    const created = buildLocation({ id: 'loc-new', name: 'Huerto nuevo' });
    mockedCreateLocation.mockResolvedValue({ location: created, etag: '"1"' });

    renderLocationFormModal({
      isOpen: true,
      onClose: handleClose,
      onSaved: handleSaved
    });

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
    expect(handleSaved).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });
});

describe('LocationFormModal - edit mode', () => {
  it('precarga los datos existentes preservando la precisión completa de coordenadas', async () => {
    const existing = buildLocation({
      id: 'loc-1',
      name: 'Huerto Norte',
      latitude: 40.41682,
      longitude: -3.70385
    });
    mockedGetLocationForEdit.mockResolvedValue({
      location: existing,
      etag: '"1"'
    });

    renderLocationFormModal({
      isOpen: true,
      locationIdToEdit: 'loc-1',
      onClose: vi.fn()
    });

    expect(screen.getByText('Editar ubicación')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Huerto Norte')).toBeInTheDocument();
      expect(screen.getByDisplayValue('40.41682')).toBeInTheDocument();
      expect(screen.getByDisplayValue('-3.70385')).toBeInTheDocument();
    });
  });

  it('muestra estado de error si falla la carga del detalle para edición', async () => {
    mockedGetLocationForEdit.mockRejectedValue(new Error('Fetch failed'));

    renderLocationFormModal({
      isOpen: true,
      locationIdToEdit: 'loc-1',
      onClose: vi.fn()
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /reintentar/i })
      ).toBeInTheDocument();
    });
  });

  it('no ejecuta mutación de actualización cuando no hay cambios', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const existing = buildLocation({ id: 'loc-1', name: 'Sin cambios' });
    mockedGetLocationForEdit.mockResolvedValue({
      location: existing,
      etag: '"1"'
    });

    renderLocationFormModal({
      isOpen: true,
      locationIdToEdit: 'loc-1',
      onClose: handleClose
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Sin cambios')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: 'Guardar cambios' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled();
    });
    expect(mockedUpdateLocation).not.toHaveBeenCalled();
  });

  it('muestra aviso de conflicto ante PreconditionFailedError', async () => {
    const user = userEvent.setup();
    const existing = buildLocation({ id: 'loc-1', name: 'Huerto viejo' });
    mockedGetLocationForEdit.mockResolvedValue({
      location: existing,
      etag: '"1"'
    });
    mockedUpdateLocation.mockRejectedValue(
      new PreconditionFailedError('ETag mismatch')
    );

    renderLocationFormModal({
      isOpen: true,
      locationIdToEdit: 'loc-1',
      onClose: vi.fn()
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Huerto viejo')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Huerto viejo');
    await user.clear(nameInput);
    await user.type(nameInput, 'Huerto editado');

    const submitBtn = screen.getByRole('button', { name: 'Guardar cambios' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Conflicto de edición')).toBeInTheDocument();
    });
  });
});
