import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, useLocation } from 'react-router-dom';

import { t } from '../../../../src/i18n/core/t';
import FavoriteButton from '../../../../src/shared/components/FavoriteButton/FavoriteButton';
import {
  addPlantBookmark,
  removePlantBookmark
} from '../../../../src/services/bookmarks.service';

import { VALID_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

vi.mock('../../../../src/services/bookmarks.service', () => ({
  addPlantBookmark: vi.fn(),
  removePlantBookmark: vi.fn()
}));

const mockedAdd = vi.mocked(addPlantBookmark);
const mockedRemove = vi.mocked(removePlantBookmark);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FavoriteButton: sesión', () => {
  it('no se renderiza sin sesión', () => {
    renderWithProviders(<FavoriteButton plantId="p-1" isFavorite={false} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('se renderiza con sesión', () => {
    renderWithProviders(<FavoriteButton plantId="p-1" isFavorite={false} />, {
      initialToken: VALID_TEST_TOKEN
    });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

describe('FavoriteButton: estado', () => {
  it('aria-pressed es true cuando es favorita, con aria-label de quitar', () => {
    renderWithProviders(<FavoriteButton plantId="p-1" isFavorite={true} />, {
      initialToken: VALID_TEST_TOKEN
    });

    const button = screen.getByRole('button', {
      name: t('favoriteButton.remove')
    });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('aria-pressed es false cuando no es favorita, con aria-label de marcar', () => {
    renderWithProviders(<FavoriteButton plantId="p-1" isFavorite={false} />, {
      initialToken: VALID_TEST_TOKEN
    });

    const button = screen.getByRole('button', {
      name: t('favoriteButton.add')
    });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('se deshabilita mientras la membresía no está disponible', () => {
    renderWithProviders(
      <FavoriteButton plantId="p-1" isFavorite={false} isReady={false} />,
      { initialToken: VALID_TEST_TOKEN }
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });
});

function LocationProbe() {
  return <span data-testid="pathname">{useLocation().pathname}</span>;
}

describe('FavoriteButton: dentro de un enlace', () => {
  it('alterna el estado sin navegar (preventDefault + stopPropagation)', async () => {
    mockedAdd.mockResolvedValue({
      plantId: 'p-1',
      bookmarkedAt: '2026-10-22T14:30:00.000Z'
    });
    const user = userEvent.setup();

    renderWithProviders(
      <>
        <LocationProbe />
        <Link to="/plants/p-1">
          <FavoriteButton plantId="p-1" isFavorite={false} />
        </Link>
      </>,
      { initialToken: VALID_TEST_TOKEN, route: '/plants' }
    );

    expect(screen.getByTestId('pathname')).toHaveTextContent('/plants');

    await user.click(screen.getByRole('button'));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/plants');
    await waitFor(() => expect(mockedAdd).toHaveBeenCalledWith('p-1'));
  });
});

describe('FavoriteButton: clics rápidos repetidos', () => {
  it('se deshabilita mientras la petición está en curso y no duplica llamadas', async () => {
    let resolveAdd!: (value: { plantId: string; bookmarkedAt: string }) => void;
    mockedAdd.mockImplementation(
      () => new Promise((resolve) => (resolveAdd = resolve))
    );
    const user = userEvent.setup();

    renderWithProviders(<FavoriteButton plantId="p-1" isFavorite={false} />, {
      initialToken: VALID_TEST_TOKEN
    });
    const button = screen.getByRole('button');

    await user.click(button);
    expect(button).toBeDisabled();
    await user.click(button);

    resolveAdd({ plantId: 'p-1', bookmarkedAt: '2026-10-22T14:30:00.000Z' });
    await waitFor(() => expect(button).not.toBeDisabled());

    expect(mockedAdd).toHaveBeenCalledOnce();
  });
});

describe('FavoriteButton: fallo del toggle', () => {
  it('revierte el estado y muestra un mensaje accesible en castellano', async () => {
    mockedRemove.mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();

    renderWithProviders(<FavoriteButton plantId="p-1" isFavorite={true} />, {
      initialToken: VALID_TEST_TOKEN
    });

    await user.click(
      screen.getByRole('button', { name: t('favoriteButton.remove') })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      t('favoriteButton.error')
    );
  });
});
