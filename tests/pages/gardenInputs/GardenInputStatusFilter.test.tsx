import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GardenInputsPage from '../../../src/pages/gardenInputs/GardenInputsPage';
import { getGardenInputList } from '../../../src/services/gardenInputs.service';
import { setStoredToken } from '../../../src/shared/auth/session';
import { ADMIN_TEST_TOKEN } from '../../fixtures/auth/authFixtures';
import { buildGardenInputListItem } from '../../fixtures/gardenInputs/gardenInputFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

vi.mock('../../../src/services/gardenInputs.service', () => ({
  getGardenInputList: vi.fn()
}));

const mockedGetGardenInputList = vi.mocked(getGardenInputList);

describe('GardenInputStatusFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    setStoredToken(ADMIN_TEST_TOKEN);
    mockedGetGardenInputList.mockResolvedValue({
      data: [buildGardenInputListItem()],
      pagination: { page: 1, limit: 25, totalPages: 1, totalItems: 1 }
    });
  });

  it('renders status filter select for editorial user', async () => {
    renderWithProviders(<GardenInputsPage />, {
      route: '/garden-inputs',
      path: '/garden-inputs'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    const statusSelect = screen.getByRole('combobox', { name: 'Estado' });
    expect(statusSelect).toBeInTheDocument();
  });

  it('updates query with deleted status and resets page when selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GardenInputsPage />, {
      route: '/garden-inputs?page=2',
      path: '/garden-inputs'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    const statusSelect = screen.getByRole('combobox', { name: 'Estado' });
    await user.selectOptions(statusSelect, 'deleted');

    expect(mockedGetGardenInputList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ status: 'deleted' }),
        pagination: expect.objectContaining({ page: 1 })
      })
    );
  });

  it('updates query with active status when selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GardenInputsPage />, {
      route: '/garden-inputs',
      path: '/garden-inputs'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    const statusSelect = screen.getByRole('combobox', { name: 'Estado' });
    await user.selectOptions(statusSelect, 'active');

    expect(mockedGetGardenInputList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ status: 'active' })
      })
    );
  });
});
