import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FavoriteButton from '../../../../src/shared/components/FavoriteButton/FavoriteButton';

import { VALID_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { stubFetchError } from '../../../test-utils/stubFetch';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('FavoriteButton: 401 al togglear', () => {
  it('limpia la sesión y retira el control de favorito', async () => {
    stubFetchError(401, { message: 'Unauthorized' });
    const user = userEvent.setup();

    renderWithProviders(<FavoriteButton plantId="p-1" isFavorite={false} />, {
      initialToken: VALID_TEST_TOKEN
    });

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(document.querySelector('.favorite-button')).toBeNull();
    });
  });
});
