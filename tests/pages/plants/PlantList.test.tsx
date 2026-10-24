import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { t } from '../../../src/i18n/core/t';
import PlantList from '../../../src/pages/plants/PlantList';

import { validateRequest } from '../../contract/openApiContract';
import {
  ADMIN_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';
import { listPlantsResponse } from '../../fixtures/plants/listPlants';

vi.mock('../../../src/services/families.service', () => ({
  getFamilyList: vi.fn(() => Promise.resolve([]))
}));
vi.mock('../../../src/services/bookmarks.service', () => ({
  getBookmarkedPlantIds: vi.fn(() => Promise.resolve(new Set()))
}));
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import {
  API_URL,
  errorResponse,
  lastRequest,
  okResponse,
  stubFetchError,
  stubFetchOk,
  stubFetchSequence,
  type FetchMock
} from '../../test-utils/stubFetch';

const LIST_FIELDS = 'fields[plants]=identity,traits,image,status,likesCount';

const SORT_LABEL = t('plant.orders.sort_label');

const DEFAULT_REQUEST = `${API_URL}/api/v1/plants?pagination[page]=1&pagination[limit]=25&sort[name]=asc&${LIST_FIELDS}`;

const [firstPlant, secondPlant] = listPlantsResponse.data;

const MULTI_PAGE_RESPONSE = {
  ...listPlantsResponse,
  pagination: { ...listPlantsResponse.pagination, totalPages: 3 }
};

function renderPlantList(route = '/plants') {
  return renderWithProviders(<PlantList />, { route });
}

async function waitForPlants() {
  return screen.findByText(new RegExp(firstPlant.identity.name.primary, 'i'));
}

function lastUrl(fetchMock: FetchMock): string {
  return lastRequest(fetchMock).url;
}

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe('PlantList', () => {
  it('pinta el estado de carga mientras llega la respuesta', () => {
    stubFetchOk(listPlantsResponse);

    renderPlantList();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sin parámetros pide la página por defecto conforme al contrato y pinta las plantas', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    renderPlantList();

    await waitForPlants();
    expect(screen.getByText(t('plant.plants'))).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(secondPlant.identity.name.primary, 'i'))
    ).toBeInTheDocument();
    expect(lastUrl(fetchMock)).toBe(DEFAULT_REQUEST);
    expect(validateRequest('get', lastUrl(fetchMock))).toEqual([]);
  });

  it('una clave de orden fuera del contrato en la URL no llega a la petición', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    renderPlantList('/plants?sortField=identity.name.primary');

    await waitForPlants();
    expect(lastUrl(fetchMock)).toBe(DEFAULT_REQUEST);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('un 400 de la API pinta el estado de error sin el texto del back', async () => {
    stubFetchError(400, { message: 'Invalid sort key', errors: {} });

    renderPlantList();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(t('errors.badRequest.message'));
    expect(alert).not.toHaveTextContent(/invalid sort key/i);
  });

  it('un fallo de red explica que no hay conexión y no muestra texto técnico', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))
    );

    renderPlantList();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(t('errors.offline.message'));
    expect(alert).not.toHaveTextContent(/failed to fetch/i);
  });

  it.each([
    ['un 500 con cuerpo', { message: 'Internal Server Error' }],
    ['un 500 sin cuerpo', undefined]
  ])('%s explica que el servicio no está disponible', async (_label, body) => {
    stubFetchError(500, body);

    renderPlantList();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(t('errors.unavailable.message'));
    expect(alert).not.toHaveTextContent(/internal server error|500/i);
  });

  it('reintentar tras un error carga las plantas sin recargar la página', async () => {
    stubFetchSequence(
      errorResponse(500, { message: 'Internal Server Error' }),
      okResponse(listPlantsResponse)
    );
    renderPlantList();

    await userEvent.click(
      await screen.findByRole('button', { name: t('errors.actions.retry') })
    );

    await waitForPlants();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('conserva las plantas cargadas si falla un refresco', async () => {
    stubFetchSequence(
      okResponse(listPlantsResponse),
      errorResponse(500, { message: 'Internal Server Error' })
    );
    const { queryClient } = renderPlantList();
    await waitForPlants();

    await queryClient.refetchQueries();

    expect(
      screen.getByText(new RegExp(firstPlant.identity.name.primary, 'i'))
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('cambiar el tamaño de página pide la primera página con ese límite', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);
    renderPlantList('/plants?page=2');
    await waitForPlants();

    await userEvent.click(
      within(
        screen.getByRole('group', { name: t('plant.filters.page_size') })
      ).getByRole('button', { name: '50' })
    );

    await waitFor(() => {
      expect(lastUrl(fetchMock)).toBe(
        `${API_URL}/api/v1/plants?pagination[page]=1&pagination[limit]=50&sort[name]=asc&${LIST_FIELDS}`
      );
    });
  });

  it('elegir un orden combinado pide la primera página con ese orden', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);
    renderPlantList('/plants?page=2');
    await waitForPlants();

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: SORT_LABEL }),
      'Nombre común (Z-A)'
    );

    await waitFor(() => {
      expect(lastUrl(fetchMock)).toBe(
        `${API_URL}/api/v1/plants?pagination[page]=1&pagination[limit]=25&sort[name]=desc&${LIST_FIELDS}`
      );
    });
  });

  it('pulsar una página la pide', async () => {
    const fetchMock = stubFetchOk(MULTI_PAGE_RESPONSE);
    renderPlantList();
    await waitForPlants();

    fireEvent.click(screen.getAllByTestId('pagination-button-2')[0]);

    await waitFor(() => {
      expect(lastUrl(fetchMock)).toBe(
        `${API_URL}/api/v1/plants?pagination[page]=2&pagination[limit]=25&sort[name]=asc&${LIST_FIELDS}`
      );
    });
  });

  it('muestra el orden combinado con el valor de la URL', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    renderPlantList('/plants?sortField=scientificName&sortDirection=desc');

    await waitForPlants();
    expect(
      screen.getByRole('combobox', { name: SORT_LABEL })
    ).toHaveDisplayValue('Nombre científico (Z-A)');
    expect(lastUrl(fetchMock)).toContain('sort[scientificName]=desc');
    expect(lastUrl(fetchMock)).toContain(LIST_FIELDS);
  });

  it('elegir un orden combinado vuelve a la página 1 y combina criterio y sentido', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);
    renderPlantList('/plants?page=3');
    await waitForPlants();

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: SORT_LABEL }),
      'Nombre científico (Z-A)'
    );

    await waitFor(() => {
      expect(lastUrl(fetchMock)).toBe(
        `${API_URL}/api/v1/plants?pagination[page]=1&pagination[limit]=25&sort[scientificName]=desc&${LIST_FIELDS}`
      );
    });
    expect(validateRequest('get', lastUrl(fetchMock))).toEqual([]);
  });

  it('un límite no soportado en la URL se corrige a 25 en el control y en la petición', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    renderPlantList('/plants?limit=37');

    await waitForPlants();
    expect(
      within(
        screen.getByRole('group', { name: t('plant.filters.page_size') })
      ).getByRole('button', { name: '25' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(lastUrl(fetchMock)).toBe(DEFAULT_REQUEST);
  });

  it('una página fuera de rango lo explica y ofrece ir a la primera página', async () => {
    const fetchMock = stubFetchSequence(
      okResponse({
        data: [],
        pagination: { page: 999, limit: 25, totalPages: 1, totalItems: 2 }
      }),
      okResponse(listPlantsResponse)
    );

    renderPlantList('/plants?page=999');

    expect(
      await screen.findByText(t('plant.emptyState.outOfRange'))
    ).toHaveAttribute('role', 'status');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: t('plant.emptyState.goToFirstPage') })
    );

    await waitForPlants();
    expect(lastUrl(fetchMock)).toContain('pagination[page]=1');
  });

  it('un catálogo vacío lo explica sin acciones', async () => {
    stubFetchOk({
      data: [],
      pagination: { page: 1, limit: 25, totalPages: 0, totalItems: 0 }
    });

    renderPlantList();

    expect(
      await screen.findByText(t('plant.emptyState.emptyCatalog'))
    ).toHaveAttribute('role', 'status');
    expect(
      screen.queryByRole('button', { name: t('errors.actions.clearFilters') })
    ).not.toBeInTheDocument();
  });

  it('sin coincidencias con filtros, quitar filtros vuelve a mostrar resultados con un clic', async () => {
    const fetchMock = stubFetchSequence(
      okResponse({
        data: [],
        pagination: { page: 1, limit: 50, totalPages: 0, totalItems: 0 }
      }),
      okResponse(listPlantsResponse)
    );

    renderPlantList('/plants?identity=zzzzzz&limit=50&page=2');

    expect(
      await screen.findByText(t('plant.emptyState.noMatches'))
    ).toHaveAttribute('role', 'status');
    await userEvent.click(
      screen.getByRole('button', { name: t('errors.actions.clearFilters') })
    );

    await waitForPlants();
    expect(lastUrl(fetchMock)).toBe(
      `${API_URL}/api/v1/plants?pagination[page]=1&pagination[limit]=50&sort[name]=asc&${LIST_FIELDS}`
    );
  });

  it('un 400 con filtros ofrece quitarlos en lugar de volver al inicio', async () => {
    stubFetchSequence(
      errorResponse(400, { message: 'Invalid filter', errors: {} }),
      okResponse(listPlantsResponse)
    );

    renderPlantList('/plants?identity=x');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      t('errors.badRequest.listMessage')
    );
    await userEvent.click(
      screen.getByRole('button', { name: t('errors.actions.clearFilters') })
    );

    await waitForPlants();
  });

  it('marca las plantas comestibles y tóxicas con una sola petición', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    renderPlantList();

    await waitForPlants();
    expect(screen.getAllByRole('img', { name: 'Tóxica' })).toHaveLength(2);
    expect(screen.getAllByRole('img', { name: 'Comestible' })).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('un filtro booleano sin resultados muestra el estado vacío', async () => {
    const fetchMock = stubFetchOk({
      data: [],
      pagination: { page: 1, limit: 25, totalPages: 1, totalItems: 0 }
    });

    renderPlantList('/plants?edible=false');

    expect(
      await screen.findByText(t('plant.emptyState.noMatches'))
    ).toHaveAttribute('role', 'status');
    expect(lastUrl(fetchMock)).toContain('filter[edible][eq]=false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con filtros activos muestra la barra de chips con un chip por filtro', async () => {
    stubFetchOk(listPlantsResponse);

    renderPlantList('/plants?lifeCycle=annual&lightType=full_sun');

    await waitForPlants();
    const bar = screen.getByRole('region', {
      name: t('plant.applied.title')
    });
    expect(within(bar).getByText('Anual')).toBeInTheDocument();
    expect(within(bar).getByText('Sol pleno')).toBeInTheDocument();
  });

  it('recupera filtros, orden y tamaño de página desde el enlace recargado (FR-024/SC-008)', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    renderPlantList(
      '/plants?lifeCycle=annual&sortField=scientificName&sortDirection=desc&limit=50&page=1'
    );

    await waitForPlants();

    const bar = screen.getByRole('region', { name: t('plant.applied.title') });
    expect(within(bar).getByText('Anual')).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: t('plant.orders.sort_label') })
    ).toHaveDisplayValue('Nombre científico (Z-A)');
    expect(
      within(
        screen.getByRole('group', { name: t('plant.filters.page_size') })
      ).getByRole('button', { name: '50' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(lastUrl(fetchMock)).toContain('pagination[limit]=50');
    expect(lastUrl(fetchMock)).toContain('sort[scientificName]=desc');
    expect(lastUrl(fetchMock)).toContain('filter[lifeCycle][eq]=annual');
  });

  it('el conmutador de vista cambia la maquetación de la lista a vista lista', async () => {
    stubFetchOk(listPlantsResponse);

    renderPlantList();

    await waitForPlants();
    const grid = screen.getByTestId('plant-grid');
    expect(grid).not.toHaveClass('plant-grid--list');

    await userEvent.click(
      screen.getByRole('button', { name: t('plant.view.list') })
    );

    expect(grid).toHaveClass('plant-grid--list');

    await userEvent.click(
      screen.getByRole('button', { name: t('plant.view.grid') })
    );

    expect(grid).not.toHaveClass('plant-grid--list');
  });

  it('sin filtros activos no muestra la barra de chips', async () => {
    stubFetchOk(listPlantsResponse);

    renderPlantList();

    await waitForPlants();
    expect(
      screen.queryByRole('region', { name: t('plant.applied.title') })
    ).not.toBeInTheDocument();
  });

  it.each([
    [
      'cambiar de página',
      MULTI_PAGE_RESPONSE,
      '/',
      async () => {
        await userEvent.click(screen.getAllByTestId('pagination-button-2')[0]);
      }
    ],
    [
      'cambiar el orden',
      listPlantsResponse,
      '/',
      async () => {
        await userEvent.selectOptions(
          screen.getByRole('combobox', { name: SORT_LABEL }),
          t('plant.orders.combined.name_desc')
        );
      }
    ],
    [
      'cambiar el tamaño de página',
      listPlantsResponse,
      '/',
      async () => {
        await userEvent.click(
          within(
            screen.getByRole('group', { name: t('plant.filters.page_size') })
          ).getByRole('button', { name: '50' })
        );
      }
    ],
    [
      'eliminar un filtro aplicado',
      listPlantsResponse,
      '/plants?lifeCycle=annual',
      async () => {
        await userEvent.click(
          screen.getByRole('button', {
            name: t('plant.applied.remove', { label: 'Anual' })
          })
        );
      }
    ]
  ])('%s reinicia el scroll al inicio', async (_, response, route, act) => {
    stubFetchOk(response);
    renderPlantList(route);
    await waitForPlants();
    vi.mocked(window.scrollTo).mockClear();

    await act();

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });

  it('limpiar filtros en estado vacío reinicia el scroll al inicio', async () => {
    stubFetchSequence(
      okResponse({
        data: [],
        pagination: { page: 1, limit: 50, totalPages: 0, totalItems: 0 }
      }),
      okResponse(listPlantsResponse)
    );
    renderPlantList('/plants?identity=zzzzzz&limit=50&page=2');
    const clearButton = await screen.findByRole('button', {
      name: t('errors.actions.clearFilters')
    });
    vi.mocked(window.scrollTo).mockClear();

    await userEvent.click(clearButton);

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });

  it('volver a la primera página en estado fuera de rango reinicia el scroll al inicio', async () => {
    stubFetchSequence(
      okResponse({
        data: [],
        pagination: { page: 999, limit: 25, totalPages: 1, totalItems: 2 }
      }),
      okResponse(listPlantsResponse)
    );
    renderPlantList('/plants?page=999');
    const firstPageButton = await screen.findByRole('button', {
      name: t('plant.emptyState.goToFirstPage')
    });
    vi.mocked(window.scrollTo).mockClear();

    await userEvent.click(firstPageButton);

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });
});

describe('PlantList: pestaña Mis Favoritas', () => {
  function renderAuthenticated(route = '/plants', token = VALID_TEST_TOKEN) {
    return renderWithProviders(<PlantList />, { route, initialToken: token });
  }

  it('seleccionar "Mis Favoritas" envía filter[bookmarked][eq]=true', async () => {
    const fetchMock = stubFetchSequence(
      okResponse(listPlantsResponse),
      okResponse(listPlantsResponse)
    );
    renderAuthenticated();
    await waitForPlants();

    await userEvent.click(
      screen.getByRole('button', { name: t('plant.tabs.favorites') })
    );

    await waitFor(() => {
      expect(lastUrl(fetchMock)).toContain('filter[bookmarked][eq]=true');
    });
  });

  it('sin favoritas muestra el estado vacío propio y un botón para volver a "Todas"', async () => {
    stubFetchOk({
      data: [],
      pagination: { page: 1, limit: 25, totalPages: 0, totalItems: 0 }
    });
    renderAuthenticated('/plants?tab=favorites');

    expect(
      await screen.findByText(t('plant.emptyState.favorites'))
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: t('plant.emptyState.favorites_action')
      })
    ).toBeInTheDocument();
  });

  it('favoritas con filtros que no casan muestra "sin coincidencias" y permite quitar filtros', async () => {
    stubFetchOk({
      data: [],
      pagination: { page: 1, limit: 25, totalPages: 0, totalItems: 0 }
    });
    renderAuthenticated('/plants?tab=favorites&identity=zzzzzz');

    expect(
      await screen.findByText(t('plant.emptyState.noMatches'))
    ).toBeInTheDocument();
    expect(
      screen.queryByText(t('plant.emptyState.favorites'))
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('errors.actions.clearFilters') })
    ).toBeInTheDocument();
  });

  it('anónimo con ?tab=favorites ve "Todas" y no envía filter[bookmarked]', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);
    renderPlantList('/plants?tab=favorites');
    await waitForPlants();

    expect(lastUrl(fetchMock)).not.toContain('bookmarked');
    expect(
      screen.queryByRole('button', { name: t('plant.tabs.all') })
    ).not.toBeInTheDocument();
  });

  it('admin: una favorita DELETED se incluye con su badge de estado', async () => {
    const deletedPlant = {
      ...listPlantsResponse.data[0],
      status: 'DELETED' as const
    };
    stubFetchOk({
      ...listPlantsResponse,
      data: [deletedPlant]
    });
    renderAuthenticated('/plants?tab=favorites', ADMIN_TEST_TOKEN);

    await waitForPlants();
    expect(
      screen.getByText(t('plant.statusValues.DELETED'))
    ).toBeInTheDocument();
  });

  it('un 400 en favoritas sin filtros reales no ofrece "quitar filtros"', async () => {
    stubFetchError(400, { message: 'Invalid request', errors: {} });

    renderAuthenticated('/plants?tab=favorites');

    await screen.findByRole('alert');
    expect(
      screen.queryByRole('button', { name: t('errors.actions.clearFilters') })
    ).not.toBeInTheDocument();
  });

  it('una página fuera de rango en favoritas ofrece volver a la primera página, no el vacío propio', async () => {
    const fetchMock = stubFetchSequence(
      okResponse({
        data: [],
        pagination: { page: 999, limit: 25, totalPages: 1, totalItems: 2 }
      }),
      okResponse(listPlantsResponse)
    );

    renderAuthenticated('/plants?tab=favorites&page=999');

    expect(
      await screen.findByText(t('plant.emptyState.outOfRange'))
    ).toBeInTheDocument();
    expect(
      screen.queryByText(t('plant.emptyState.favorites'))
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: t('plant.emptyState.goToFirstPage') })
    );

    await waitForPlants();
    expect(lastUrl(fetchMock)).toContain('pagination[page]=1');
  });
});
