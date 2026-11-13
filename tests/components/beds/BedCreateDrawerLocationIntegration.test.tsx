import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BedCreateDrawer from '../../../src/components/beds/BedCreateDrawer/BedCreateDrawer';
import {
  createLocation,
  getLocationList
} from '../../../src/services/locations.service';
import { AuthProvider } from '../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import { ToastProvider } from '../../../src/shared/toast/ToastContext';
import { VALID_TEST_TOKEN } from '../../fixtures/auth/authFixtures';
import { buildLocation } from '../../fixtures/locations/buildLocation';
import { createTestQueryClient } from '../../test-utils/createTestQueryClient';

vi.mock('../../../src/services/beds.service', () => ({
  createBed: vi.fn()
}));

vi.mock('../../../src/services/locations.service', () => ({
  getLocationList: vi.fn(),
  createLocation: vi.fn()
}));

const mockedGetLocationList = vi.mocked(getLocationList);
const mockedCreateLocation = vi.mocked(createLocation);

function renderDrawer() {
  const queryClient = createTestQueryClient();
  const user = userEvent.setup();
  const handleClose = vi.fn();
  const handleCreated = vi.fn();

  const rendered = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BedCreateDrawer
            isOpen={true}
            onClose={handleClose}
            onCreated={handleCreated}
          />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

  return { user, handleClose, handleCreated, ...rendered };
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  clearStoredToken();
  setStoredToken(VALID_TEST_TOKEN);
  mockedGetLocationList.mockResolvedValue({
    data: [buildLocation({ id: 'loc-1', name: 'Huerto Principal' })],
    pagination: { page: 1, limit: 100, totalPages: 1, totalItems: 1 }
  });
});

describe('BedCreateDrawerLocationIntegration', () => {
  it('preserves bed form values when quick location modal is opened and canceled', async () => {
    const { user } = renderDrawer();

    await screen.findByText('Huerto Principal');

    await user.type(
      screen.getByLabelText('Nombre del bancal'),
      'Bancal Romero'
    );
    await user.type(screen.getByLabelText('Ancho (cm)'), '100');
    await user.type(screen.getByLabelText('Largo (cm)'), '200');
    await user.type(
      screen.getByLabelText('Profundidad de sustrato (cm)'),
      '40'
    );

    await user.click(
      screen.getByRole('button', { name: 'Crear nueva ubicación' })
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Nueva ubicación' })
    ).toBeInTheDocument();

    const modalDialog = screen.getByRole('dialog', { name: 'Nueva ubicación' });
    await user.click(
      within(modalDialog).getByRole('button', { name: 'Cancelar' })
    );

    expect(
      screen.queryByRole('heading', { level: 2, name: 'Nueva ubicación' })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nombre del bancal')).toHaveValue(
      'Bancal Romero'
    );
    expect(screen.getByLabelText('Ancho (cm)')).toHaveValue(100);
    expect(screen.getByLabelText('Largo (cm)')).toHaveValue(200);
    expect(screen.getByLabelText('Profundidad de sustrato (cm)')).toHaveValue(
      40
    );
  });

  it('preserves bed form values and auto-selects newly created location', async () => {
    const newLocation = buildLocation({
      id: 'loc-new-99',
      name: 'Huerto Secundario'
    });
    mockedCreateLocation.mockResolvedValue({
      location: newLocation,
      etag: '"1"'
    });
    mockedGetLocationList.mockResolvedValue({
      data: [
        buildLocation({ id: 'loc-1', name: 'Huerto Principal' }),
        newLocation
      ],
      pagination: { page: 1, limit: 100, totalPages: 1, totalItems: 2 }
    });

    const { user } = renderDrawer();

    await screen.findByText('Huerto Principal');

    await user.type(
      screen.getByLabelText('Nombre del bancal'),
      'Bancal Tomillo'
    );
    await user.type(screen.getByLabelText('Ancho (cm)'), '90');
    await user.type(screen.getByLabelText('Largo (cm)'), '180');
    await user.type(
      screen.getByLabelText('Profundidad de sustrato (cm)'),
      '25'
    );

    await user.click(
      screen.getByRole('button', { name: 'Crear nueva ubicación' })
    );

    await user.type(
      screen.getByPlaceholderText('Ej. Huerto de casa'),
      'Huerto Secundario'
    );
    await user.type(screen.getByLabelText('Latitud'), '40.4168');
    await user.type(screen.getByLabelText('Longitud'), '-3.7038');
    await user.click(screen.getByRole('button', { name: 'Crear ubicación' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { level: 2, name: 'Nueva ubicación' })
      ).not.toBeInTheDocument();
    });

    expect(screen.getByLabelText('Nombre del bancal')).toHaveValue(
      'Bancal Tomillo'
    );
    expect(screen.getByLabelText('Ancho (cm)')).toHaveValue(90);
    expect(screen.getByLabelText('Largo (cm)')).toHaveValue(180);
    expect(screen.getByLabelText('Profundidad de sustrato (cm)')).toHaveValue(
      25
    );
    expect(screen.getByLabelText('Ubicación')).toHaveValue('loc-new-99');
  });
});
