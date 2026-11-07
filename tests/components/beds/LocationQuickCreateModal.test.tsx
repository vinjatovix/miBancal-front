import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LocationQuickCreateModal from '../../../src/components/beds/LocationQuickCreateModal/LocationQuickCreateModal';
import { createLocation } from '../../../src/services/locations.service';
import { AuthProvider } from '../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import { ToastProvider } from '../../../src/shared/toast/ToastContext';
import { VALID_TEST_TOKEN } from '../../fixtures/auth/authFixtures';
import { buildLocation } from '../../fixtures/locations/buildLocation';
import { createTestQueryClient } from '../../test-utils/createTestQueryClient';

vi.mock('../../../src/services/locations.service', () => ({
  createLocation: vi.fn(),
  getLocationForEdit: vi.fn(),
  updateLocation: vi.fn(),
  deleteLocation: vi.fn()
}));

const mockedCreateLocation = vi.mocked(createLocation);

function renderModal(
  props: {
    isOpen?: boolean;
    onClose?: () => void;
    onCreated?: (id: string) => void;
  } = {}
) {
  const queryClient = createTestQueryClient();
  const user = userEvent.setup();
  const handleClose = props.onClose ?? vi.fn();
  const handleCreated = props.onCreated ?? vi.fn();

  const rendered = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <LocationQuickCreateModal
            isOpen={props.isOpen ?? true}
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
});

describe('LocationQuickCreateModal', () => {
  it('renders dialog elements when isOpen is true', () => {
    renderModal({ isOpen: true });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nueva ubicación' })
    ).toBeInTheDocument();
  });

  it('does not render dialog when isOpen is false', () => {
    renderModal({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('validates required name field before submitting', async () => {
    const { user } = renderModal({ isOpen: true });

    await user.click(screen.getByRole('button', { name: 'Crear ubicación' }));

    expect(
      await screen.findByText('El nombre es obligatorio.')
    ).toBeInTheDocument();
    expect(mockedCreateLocation).not.toHaveBeenCalled();
  });

  it('submits valid location and invokes onCreated callback', async () => {
    const createdLoc = buildLocation({ id: 'loc-456', name: 'Huerto Norte' });
    mockedCreateLocation.mockResolvedValue({
      location: createdLoc,
      etag: '"1"'
    });
    const { user, handleCreated, handleClose } = renderModal({ isOpen: true });

    await user.type(
      screen.getByPlaceholderText('Ej. Huerto de casa'),
      'Huerto Norte'
    );
    await user.type(screen.getByLabelText('Latitud'), '40.4168');
    await user.type(screen.getByLabelText('Longitud'), '-3.7038');
    await user.click(screen.getByRole('button', { name: 'Crear ubicación' }));

    expect(mockedCreateLocation).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Huerto Norte',
        latitude: 40.4168,
        longitude: -3.7038
      })
    );
    expect(handleCreated).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });
});
