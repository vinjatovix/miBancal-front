import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BedsPage from '../../../src/pages/beds/BedsPage';
import { getBedList } from '../../../src/services/beds.service';
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
  getBedList: vi.fn(),
  createBed: vi.fn()
}));

vi.mock('../../../src/services/locations.service', () => ({
  getLocationList: vi.fn(),
  createLocation: vi.fn()
}));

const mockedGetBedList = vi.mocked(getBedList);
const mockedGetLocationList = vi.mocked(getLocationList);

function renderBedsPage(initialEntry = '/beds') {
  const queryClient = createTestQueryClient();
  const user = userEvent.setup();
  const rendered = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <BedsPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
  return { user, ...rendered };
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  clearStoredToken();
  setStoredToken(VALID_TEST_TOKEN);
  mockedGetLocationList.mockResolvedValue({
    data: [buildLocation({ id: 'loc-1', name: 'Huerto Norte' })],
    pagination: { page: 1, limit: 100, totalPages: 1, totalItems: 1 }
  });
});

describe('BedsPage', () => {
  it('renders loading state while beds are fetching', () => {
    mockedGetBedList.mockImplementation(() => new Promise(() => {}));

    renderBedsPage();

    expect(screen.getByText('Cargando bancales...')).toBeInTheDocument();
  });

  it('renders error state when fetching beds fails', async () => {
    mockedGetBedList.mockRejectedValue(new ApiError('Failed', 500));

    renderBedsPage();

    expect(
      await screen.findByText('No se han podido cargar tus bancales.')
    ).toBeInTheDocument();
  });

  it('renders empty state with CTA button when user has no beds', async () => {
    mockedGetBedList.mockResolvedValue([]);

    const { user } = renderBedsPage();

    expect(
      await screen.findByText('Todavía no tienes ningún bancal')
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Crear mi primer bancal' })
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nuevo bancal' })
    ).toBeInTheDocument();
  });

  it('renders list of bed cards and opens drawer from header button', async () => {
    const beds = [
      buildBed({ id: 'bed-1', name: 'Bancal A' }),
      buildBed({ id: 'bed-2', name: 'Bancal B' })
    ];
    mockedGetBedList.mockResolvedValue(beds);

    const { user } = renderBedsPage();

    expect(await screen.findByText('Bancal A')).toBeInTheDocument();
    expect(screen.getByText('Bancal B')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Nuevo bancal' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('filters beds by location selection', async () => {
    mockedGetBedList.mockResolvedValue([]);
    const { user } = renderBedsPage();

    await screen.findByRole('heading', { level: 1, name: 'Mis bancales' });
    await screen.findAllByText('Huerto Norte');

    const select = screen.getByRole('combobox', {
      name: 'Filtrar por ubicación'
    });
    await user.selectOptions(select, 'loc-1');

    await waitFor(() => {
      expect(mockedGetBedList).toHaveBeenCalledWith({
        include: 'location',
        locationId: 'loc-1'
      });
    });
  });
});
