import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FamilyList from '../../../src/pages/families/FamilyList';
import { getFamilyList } from '../../../src/services/families.service';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { NetworkError } from '../../../src/shared/errors/NetworkError';
import type { FamilyListItem } from '../../../src/types/Family';
import {
  ADMIN_TEST_TOKEN,
  createTestJwt,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';
import { listFamilyItems } from '../../fixtures/families/listFamilyItems';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

vi.mock('../../../src/services/families.service', () => ({
  getFamilyList: vi.fn()
}));

const mockedGetFamilyList = vi.mocked(getFamilyList);
const [firstFamily, secondFamily] = listFamilyItems;

function resolveFamilies(data: FamilyListItem[]) {
  mockedGetFamilyList.mockResolvedValue(data);
}

async function findFamilyLinks(): Promise<HTMLElement[]> {
  return screen.findAllByRole('link');
}

describe('FamilyList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetFamilyList.mockResolvedValue(listFamilyItems);
  });

  it('shows loading state', () => {
    mockedGetFamilyList.mockImplementation(
      () => new Promise<FamilyListItem[]>(() => {})
    );

    renderWithProviders(<FamilyList />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders each family with its scientific name as title and name below', async () => {
    renderWithProviders(<FamilyList />);

    const links = await findFamilyLinks();

    expect(links).toHaveLength(2);
    links.forEach((link, index) => {
      const family = listFamilyItems[index];
      expect(link.querySelector('h3')).toHaveTextContent(family.scientificName);
      expect(link.querySelector('p')).toHaveTextContent(family.name);
    });
  });

  it('renders the scientific name title with the scientific name title style', async () => {
    renderWithProviders(<FamilyList />);

    const heading = await screen.findByRole('heading', {
      level: 3,
      name: firstFamily.scientificName
    });

    expect(within(heading).getByText(firstFamily.scientificName)).toHaveClass(
      'scientific-name',
      'scientific-name--title'
    );
  });

  it('creates links to family detail', async () => {
    renderWithProviders(<FamilyList />);

    const links = await findFamilyLinks();

    expect(links[0]).toHaveAttribute('href', `/families/${firstFamily.id}`);
    expect(links[1]).toHaveAttribute('href', `/families/${secondFamily.id}`);
  });

  it.each([
    [
      'a network failure',
      new NetworkError(new TypeError('Failed to fetch')),
      'No se ha podido conectar'
    ],
    [
      'a 500',
      new ApiError('Internal Server Error', 500),
      'El servicio no está disponible'
    ],
    [
      'an error without body',
      new ApiError('API error: 502', 502),
      'El servicio no está disponible'
    ],
    ['a thrown value', 'network down', 'Ha ocurrido un error inesperado']
  ])(
    'explains %s in Spanish without technical details',
    async (_label, error, expectedText) => {
      mockedGetFamilyList.mockRejectedValue(error);

      renderWithProviders(<FamilyList />);

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(expectedText);
      expect(alert).not.toHaveTextContent(/API error|Internal Server|\d{3}/);
      expect(
        screen.getByRole('button', { name: 'Reintentar' })
      ).toBeInTheDocument();
    }
  );

  it('links home without retry when forbidden', async () => {
    mockedGetFamilyList.mockRejectedValue(new ApiError('Forbidden', 403));

    renderWithProviders(<FamilyList />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No tienes permiso'
    );
    expect(
      screen.getByRole('link', { name: 'Volver al inicio' })
    ).toHaveAttribute('href', '/');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the families after retrying with a good response', async () => {
    mockedGetFamilyList.mockRejectedValueOnce(new ApiError('x', 500));

    renderWithProviders(<FamilyList />);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Reintentar' })
    );

    expect(await findFamilyLinks()).toHaveLength(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the loaded families when a refetch fails', async () => {
    const { queryClient } = renderWithProviders(<FamilyList />);
    await findFamilyLinks();
    mockedGetFamilyList.mockRejectedValue(new ApiError('x', 500));

    await queryClient.refetchQueries();

    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the empty state when there are no families', async () => {
    resolveFamilies([]);

    renderWithProviders(<FamilyList />);

    expect(
      await screen.findByText('No hay familias registradas.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  describe('editorial actions', () => {
    it('does not render Nueva familia button for anonymous user', () => {
      renderWithProviders(<FamilyList />);

      expect(
        screen.queryByRole('link', { name: /nueva familia/i })
      ).not.toBeInTheDocument();
    });

    it('does not render Nueva familia button for regular user', () => {
      renderWithProviders(<FamilyList />, {
        initialToken: VALID_TEST_TOKEN
      });

      expect(
        screen.queryByRole('link', { name: /nueva familia/i })
      ).not.toBeInTheDocument();
    });

    it.each([
      ['admin', ADMIN_TEST_TOKEN],
      ['collaborator', createTestJwt({ roles: ['collaborator'] })]
    ])(
      'renders Nueva familia button linking to /families/new for %s',
      async (_role, token) => {
        renderWithProviders(<FamilyList />, {
          initialToken: token
        });

        const createLink = await screen.findByRole('link', {
          name: /nueva familia/i
        });
        expect(createLink).toBeInTheDocument();
        expect(createLink).toHaveAttribute('href', '/families/new');
      }
    );
  });
});
