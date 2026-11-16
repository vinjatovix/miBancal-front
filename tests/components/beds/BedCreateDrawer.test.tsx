import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BedCreateDrawer from '../../../src/components/beds/BedCreateDrawer/BedCreateDrawer';
import { createBed } from '../../../src/services/beds.service';
import { getLocationList } from '../../../src/services/locations.service';
import { AuthProvider } from '../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { VALID_TEST_TOKEN } from '../../fixtures/auth/authFixtures';
import { buildBed } from '../../fixtures/beds/buildBed';
import { buildLocation } from '../../fixtures/locations/buildLocation';
import { createTestQueryClient } from '../../test-utils/createTestQueryClient';

vi.mock('../../../src/services/beds.service', () => ({
  createBed: vi.fn()
}));

vi.mock('../../../src/services/locations.service', () => ({
  getLocationList: vi.fn(),
  createLocation: vi.fn()
}));

const mockedCreateBed = vi.mocked(createBed);
const mockedGetLocationList = vi.mocked(getLocationList);

function renderDrawer(
  props: {
    isOpen?: boolean;
    onClose?: () => void;
    onCreated?: (bedId: string) => void;
  } = {}
) {
  const queryClient = createTestQueryClient();
  const user = userEvent.setup();
  const handleClose = props.onClose ?? vi.fn();
  const handleCreated = props.onCreated ?? vi.fn();

  const rendered = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BedCreateDrawer
          isOpen={props.isOpen ?? true}
          onClose={handleClose}
          onCreated={handleCreated}
        />
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
    data: [
      buildLocation({ id: 'loc-1', name: 'Huerto Norte' }),
      buildLocation({ id: 'loc-2', name: 'Huerto Sur' })
    ],
    pagination: { page: 1, limit: 100, totalPages: 1, totalItems: 2 }
  });
});

describe('BedCreateDrawer', () => {
  it('renders dialog elements when isOpen is true', async () => {
    renderDrawer({ isOpen: true });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nuevo bancal' })
    ).toBeInTheDocument();
    expect(await screen.findByText('Huerto Norte')).toBeInTheDocument();
  });

  it('does not render dialog when isOpen is false', () => {
    renderDrawer({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays validation errors on invalid empty submit', async () => {
    const { user } = renderDrawer({ isOpen: true });

    await user.click(screen.getByRole('button', { name: 'Crear bancal' }));

    expect(
      await screen.findByText('El nombre del bancal es obligatorio.')
    ).toBeInTheDocument();
    expect(mockedCreateBed).not.toHaveBeenCalled();
  });

  it('submits valid form data and triggers onCreated callback', async () => {
    const createdBed = buildBed({
      id: 'bed-new-123',
      name: 'Bancal Aromáticas',
      width: 100,
      height: 200,
      depth: 30,
      locationId: 'loc-1'
    });
    mockedCreateBed.mockResolvedValue({ bed: createdBed, etag: '"1"' });

    const { user, handleCreated } = renderDrawer({ isOpen: true });

    await screen.findByText('Huerto Norte');

    await user.type(
      screen.getByLabelText('Nombre del bancal'),
      'Bancal Aromáticas'
    );
    await user.type(screen.getByLabelText('Ancho (cm)'), '100');
    await user.type(screen.getByLabelText('Largo (cm)'), '200');
    await user.type(
      screen.getByLabelText('Profundidad de sustrato (cm)'),
      '30'
    );
    await user.selectOptions(screen.getByLabelText('Ubicación'), 'loc-1');

    await user.click(screen.getByRole('button', { name: 'Crear bancal' }));

    await waitFor(() => {
      expect(handleCreated).toHaveBeenCalledWith('bed-new-123');
    });
  });

  it('closes dialog on Escape key press', async () => {
    const { user, handleClose } = renderDrawer({ isOpen: true });

    await user.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalled();
  });

  it('displays duplicate name error when createBed rejects with conflict', async () => {
    mockedCreateBed.mockRejectedValue(new ApiError('Duplicate name', 409));
    const { user, handleCreated } = renderDrawer({ isOpen: true });
    await screen.findByText('Huerto Norte');

    await user.type(
      screen.getByLabelText('Nombre del bancal'),
      'Bancal Duplicado'
    );
    await user.type(screen.getByLabelText('Ancho (cm)'), '100');
    await user.type(screen.getByLabelText('Largo (cm)'), '200');
    await user.type(
      screen.getByLabelText('Profundidad de sustrato (cm)'),
      '30'
    );
    await user.selectOptions(screen.getByLabelText('Ubicación'), 'loc-1');
    await user.click(screen.getByRole('button', { name: 'Crear bancal' }));

    expect(
      await screen.findByText('Ya tienes un bancal con ese nombre.')
    ).toBeInTheDocument();
    expect(handleCreated).not.toHaveBeenCalled();
  });
});
