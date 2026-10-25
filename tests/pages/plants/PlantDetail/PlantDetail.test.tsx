import '@testing-library/jest-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router-dom';

import { t } from '../../../../src/i18n/core/t';
import PlantDetail from '../../../../src/pages/plants/PlantDetail/PlantDetail';
import {
  deletePlant,
  getPlantById,
  getPlantForEdit,
  updatePlant
} from '../../../../src/services/plants.service';
import { ApiError } from '../../../../src/shared/errors/ApiError';
import { NetworkError } from '../../../../src/shared/errors/NetworkError';
import { PreconditionFailedError } from '../../../../src/shared/errors/PreconditionFailedError';
import { clearStoredToken } from '../../../../src/shared/auth/session';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import {
  ADMIN_TEST_TOKEN,
  createTestJwt,
  VALID_TEST_TOKEN
} from '../../../fixtures/auth/authFixtures';
import { listPlantsResponse } from '../../../fixtures/plants/listPlants';
import {
  buildPlant,
  buildPlantWithEcological,
  buildPlantWithFamily
} from '../../../fixtures/plants/buildPlant';
import { buildFamilySummary } from '../../../fixtures/families/buildFamilySummary';

vi.mock('../../../../src/services/plants.service', () => ({
  deletePlant: vi.fn(),
  getPlantById: vi.fn(),
  getPlantForEdit: vi.fn(),
  updatePlant: vi.fn()
}));
vi.mock('../../../../src/services/bookmarks.service', () => ({
  getBookmarkedPlantIds: vi.fn(() => Promise.resolve(new Set())),
  addPlantBookmark: vi.fn(),
  removePlantBookmark: vi.fn()
}));
vi.mock('../../../../src/services/plantLikes.service', () => ({
  checkPlantLike: vi.fn(() => Promise.resolve({ liked: false })),
  likePlant: vi.fn(),
  unlikePlant: vi.fn()
}));

const mockedDeletePlant = vi.mocked(deletePlant);
const mockedGetPlantById = vi.mocked(getPlantById);
const mockedGetPlantForEdit = vi.mocked(getPlantForEdit);
const mockedUpdatePlant = vi.mocked(updatePlant);

const mockPlant = listPlantsResponse.data[0];
const mockPlantWithVideos = listPlantsResponse.data[1];

function renderPlantDetail() {
  return renderWithProviders(<PlantDetail />, {
    route: `/plants/${mockPlant.id}`,
    path: '/plants/:id'
  });
}

describe('PlantDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetPlantForEdit.mockResolvedValue({
      plant: mockPlant,
      etag: '"1"'
    });
  });

  it('should render loading state initially', () => {
    mockedGetPlantById.mockImplementation(() => new Promise(() => {}));

    renderPlantDetail();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render plant information', async () => {
    mockedGetPlantById.mockResolvedValue(mockPlant);

    renderPlantDetail();

    const regexPrimaryName = new RegExp(mockPlant.identity.name.primary, 'i');
    const regexScientific = new RegExp(
      `^${mockPlant.identity.scientificName}$`,
      'i'
    );

    expect(
      await screen.findByRole('heading', { name: regexPrimaryName })
    ).toBeInTheDocument();
    expect(screen.getByText(regexScientific)).toBeInTheDocument();

    expect(screen.getByTestId('section-calendario')).toBeInTheDocument();
    expect(screen.getByTestId('section-datos rápidos')).toBeInTheDocument();
    expect(screen.getByTestId('section-cultivo')).toBeInTheDocument();
    expect(screen.getByTestId('section-ecología')).toBeInTheDocument();
    expect(screen.getByTestId('section-notas')).toBeInTheDocument();
  });

  it('renders every section of the full plant without a section notice', async () => {
    mockedGetPlantById.mockResolvedValue(mockPlantWithVideos);

    renderPlantDetail();

    await screen.findByTestId('section-calendario');
    expect(screen.getByTestId('section-datos rápidos')).toBeInTheDocument();
    expect(screen.getByTestId('section-cultivo')).toBeInTheDocument();
    expect(screen.getByTestId('section-ecología')).toBeInTheDocument();
    expect(screen.getByTestId('section-notas')).toBeInTheDocument();
    expect(
      screen.queryByText('No se ha podido mostrar esta sección.')
    ).not.toBeInTheDocument();
  });

  it('should change hemisphere', async () => {
    const user = userEvent.setup();
    mockedGetPlantById.mockResolvedValue(mockPlant);

    renderPlantDetail();

    const southBtn = await screen.findByRole('button', { name: /sur/i });
    await user.click(southBtn);

    expect(southBtn).toHaveClass('hemisphere-toggle__btn--active');
  });

  it('should render propagation methods', async () => {
    mockedGetPlantById.mockResolvedValue(mockPlant);

    renderPlantDetail();

    const card = await screen.findByTestId('propagation-seed');

    expect(card).toBeInTheDocument();
  });

  it('should render pruning information', async () => {
    mockedGetPlantById.mockResolvedValue(mockPlant);

    renderPlantDetail();

    const pruningCard = await screen.findByTestId('pruning-maintenance');

    expect(pruningCard).toBeInTheDocument();
  });

  it('shows propagation and pruning seasons translated and ordered', async () => {
    mockedGetPlantById.mockResolvedValue(
      buildPlant({
        knowledge: {
          ...mockPlant.knowledge,
          propagation: {
            methods: {
              seed: { seasons: ['summer', 'spring'] },
              cutting: {}
            }
          },
          pruning: [
            {
              type: 'maintenance',
              intensity: 'light',
              seasons: ['winter'],
              frequencyPerYear: 1
            }
          ]
        }
      })
    );

    renderPlantDetail();

    const seedCard = await screen.findByTestId('propagation-seed');
    const cuttingCard = screen.getByTestId('propagation-cutting');
    const pruningCard = screen.getByTestId('pruning-maintenance');

    expect(within(seedCard).getByText('Primavera, Verano')).toBeInTheDocument();
    expect(within(pruningCard).getByText('Invierno')).toBeInTheDocument();
    expect(within(cuttingCard).queryByText(/Estación/)).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('plant.calendar');
  });

  it('shows edible and toxic data between quick facts and cultivation', async () => {
    mockedGetPlantById.mockResolvedValue(
      buildPlantWithEcological({
        edible: true,
        toxic: true,
        toxicityNotes: 'Hojas tóxicas.'
      })
    );

    renderPlantDetail();

    const safety = await screen.findByTestId(
      'section-comestibilidad y toxicidad'
    );
    const quickFacts = screen.getByTestId('section-datos rápidos');
    const cultivation = screen.getByTestId('section-cultivo');

    expect(screen.getByRole('img', { name: 'Comestible' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Tóxica' })).toBeInTheDocument();
    expect(quickFacts.compareDocumentPosition(safety)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(safety.compareDocumentPosition(cultivation)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('hides edible and toxic data when the plant has none', async () => {
    mockedGetPlantById.mockResolvedValue(buildPlantWithEcological({}));

    renderPlantDetail();

    await screen.findByTestId('section-cultivo');

    expect(screen.queryByText('Comestibilidad y toxicidad')).toBeNull();
    expect(screen.queryByRole('img', { name: 'Comestible' })).toBeNull();
    expect(screen.queryByRole('img', { name: 'Tóxica' })).toBeNull();
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
      new ApiError('API error: 503', 503),
      'El servicio no está disponible'
    ]
  ])(
    'explains %s in Spanish without technical details',
    async (_label, error, expectedText) => {
      mockedGetPlantById.mockRejectedValue(error);

      renderPlantDetail();

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(expectedText);
      expect(alert).not.toHaveTextContent(/API error|Internal Server|\d{3}/);
    }
  );

  it('shows the plant after retrying with a good response', async () => {
    mockedGetPlantById.mockRejectedValueOnce(new ApiError('x', 500));
    mockedGetPlantById.mockResolvedValue(mockPlant);

    renderPlantDetail();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Reintentar' })
    );

    expect(
      await screen.findByRole('heading', {
        name: new RegExp(mockPlant.identity.name.primary, 'i')
      })
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the plant when a refetch fails', async () => {
    mockedGetPlantById.mockResolvedValue(mockPlant);
    const primaryName = new RegExp(mockPlant.identity.name.primary, 'i');

    const { queryClient } = renderPlantDetail();
    await screen.findByRole('heading', { name: primaryName });
    mockedGetPlantById.mockRejectedValue(new ApiError('x', 500));

    await queryClient.refetchQueries();

    expect(
      screen.getByRole('heading', { name: primaryName })
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should render resources section with youtube videos and articles', async () => {
    mockedGetPlantById.mockResolvedValue(mockPlantWithVideos);

    renderPlantDetail();

    const section = await screen.findByTestId('section-recursos');
    expect(section).toBeInTheDocument();

    const articlesTab = document.getElementById('tab-articles');
    expect(articlesTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should switch to videos tab and render videos', async () => {
    const user = userEvent.setup();
    mockedGetPlantById.mockResolvedValue(mockPlantWithVideos);

    renderPlantDetail();
    await screen.findByTestId('section-recursos');

    const videosTab = await screen.getByTestId('tab-videos');
    await user.click(videosTab);

    expect(videosTab).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates to family page when clicking family link', async () => {
    const user = userEvent.setup();
    const family = buildFamilySummary({
      name: 'Solanáceas',
      slug: 'solanaceae'
    });
    const plant = buildPlantWithFamily(family);
    mockedGetPlantById.mockResolvedValue(plant);

    renderWithProviders(
      <Routes>
        <Route path="/plants/:id" element={<PlantDetail />} />
        <Route path="/families/:slug" element={<div>FAMILY PAGE</div>} />
      </Routes>,
      { route: `/plants/${plant.id}` }
    );

    const familyLink = await screen.findByRole('link', {
      name: 'Solanáceas'
    });
    await user.click(familyLink);

    expect(screen.getByText('FAMILY PAGE')).toBeInTheDocument();
  });

  it('does not display family id in the DOM when family is linked', async () => {
    const family = buildFamilySummary({
      id: '5a2380c4-1546-4511-a77b-ec9d3ebcb7cf',
      name: 'Solanáceas',
      slug: 'solanaceae'
    });
    const plant = buildPlantWithFamily(family);
    mockedGetPlantById.mockResolvedValue(plant);

    renderWithProviders(
      <Routes>
        <Route path="/plants/:id" element={<PlantDetail />} />
        <Route path="/families/:slug" element={<div>FAMILY PAGE</div>} />
      </Routes>,
      { route: `/plants/${plant.id}` }
    );

    await screen.findByRole('link', { name: 'Solanáceas' });

    expect(
      screen.queryByText(new RegExp(family.id, 'i'))
    ).not.toBeInTheDocument();
  });

  it('renders unavailable family text when plant has unresolvable family id', async () => {
    const unresolvableId = 'a1d5f8e2-b3c7-4e1a-9f2a-5c9b8d7e1f3a';
    const plant = buildPlantWithFamily(unresolvableId);
    mockedGetPlantById.mockResolvedValue(plant);

    renderWithProviders(<PlantDetail />, {
      route: `/plants/${plant.id}`,
      path: '/plants/:id'
    });

    expect(
      await screen.findByText('Familia no disponible')
    ).toBeInTheDocument();
  });

  it('does not render a family link when plant has unresolvable family id', async () => {
    const unresolvableId = 'a1d5f8e2-b3c7-4e1a-9f2a-5c9b8d7e1f3a';
    const plant = buildPlantWithFamily(unresolvableId);
    mockedGetPlantById.mockResolvedValue(plant);

    renderWithProviders(<PlantDetail />, {
      route: `/plants/${plant.id}`,
      path: '/plants/:id'
    });

    await screen.findByRole('heading', {
      name: new RegExp(plant.identity.name.primary, 'i')
    });

    expect(
      screen.queryByRole('link', { name: /familia/i })
    ).not.toBeInTheDocument();
  });

  it('does not display raw family id in the DOM when plant has unresolvable family id', async () => {
    const unresolvableId = 'a1d5f8e2-b3c7-4e1a-9f2a-5c9b8d7e1f3a';
    const plant = buildPlantWithFamily(unresolvableId);
    mockedGetPlantById.mockResolvedValue(plant);

    renderWithProviders(<PlantDetail />, {
      route: `/plants/${plant.id}`,
      path: '/plants/:id'
    });

    await screen.findByRole('heading', {
      name: new RegExp(plant.identity.name.primary, 'i')
    });

    expect(
      screen.queryByText(new RegExp(unresolvableId, 'i'))
    ).not.toBeInTheDocument();
  });

  it('renders other plant sections normally when plant has unresolvable family id', async () => {
    const unresolvableId = 'a1d5f8e2-b3c7-4e1a-9f2a-5c9b8d7e1f3a';
    const plant = buildPlantWithFamily(unresolvableId);
    mockedGetPlantById.mockResolvedValue(plant);

    renderWithProviders(<PlantDetail />, {
      route: `/plants/${plant.id}`,
      path: '/plants/:id'
    });

    expect(
      await screen.findByTestId('section-datos rápidos')
    ).toBeInTheDocument();
    expect(screen.getByTestId('section-cultivo')).toBeInTheDocument();
    expect(screen.getByTestId('section-notas')).toBeInTheDocument();
  });

  describe('not found', () => {
    const errorSpy = vi.spyOn(console, 'error');

    beforeEach(() => {
      errorSpy.mockClear();
    });

    function expectPlantNotFound() {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Planta no encontrada' })
      ).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(
        'La planta no existe o ya no está disponible.'
      );
      expect(
        screen.getByRole('link', { name: 'Volver al listado de plantas' })
      ).toHaveAttribute('href', '/plants');
      expect(errorSpy).not.toHaveBeenCalled();
    }

    it.each([404, 400])(
      'shows the plant not found screen on a %i',
      async (status) => {
        mockedGetPlantById.mockRejectedValue(new ApiError('x', status));

        renderPlantDetail();

        await screen.findByRole('heading', {
          level: 1,
          name: 'Planta no encontrada'
        });
        expectPlantNotFound();
      }
    );

    it('shows the plant not found screen without throwing when the id param is missing', () => {
      renderWithProviders(<PlantDetail />, {
        route: '/plants',
        path: '/plants'
      });

      expectPlantNotFound();
      expect(mockedGetPlantById).not.toHaveBeenCalled();
    });
  });

  describe('editorial inline edit mode', () => {
    it('does not show edit button for anonymous user', async () => {
      mockedGetPlantById.mockResolvedValue(mockPlant);

      renderWithProviders(<PlantDetail />, {
        route: `/plants/${mockPlant.id}`,
        path: '/plants/:id'
      });

      await screen.findByRole('heading', {
        name: new RegExp(mockPlant.identity.name.primary, 'i')
      });
      expect(
        screen.queryByRole('button', { name: 'Editar' })
      ).not.toBeInTheDocument();
    });

    it('does not show edit button for regular user', async () => {
      mockedGetPlantById.mockResolvedValue(mockPlant);

      renderWithProviders(<PlantDetail />, {
        route: `/plants/${mockPlant.id}`,
        path: '/plants/:id',
        initialToken: VALID_TEST_TOKEN
      });

      await screen.findByRole('heading', {
        name: new RegExp(mockPlant.identity.name.primary, 'i')
      });
      expect(
        screen.queryByRole('button', { name: 'Editar' })
      ).not.toBeInTheDocument();
    });

    it.each([
      ['admin', ADMIN_TEST_TOKEN],
      ['collaborator', createTestJwt({ roles: ['collaborator'] })]
    ])('shows edit button for %s role', async (_role, token) => {
      mockedGetPlantById.mockResolvedValue(mockPlant);

      renderWithProviders(<PlantDetail />, {
        route: `/plants/${mockPlant.id}`,
        path: '/plants/:id',
        initialToken: token
      });

      const editBtn = await screen.findByRole('button', { name: 'Editar' });
      expect(editBtn).toBeInTheDocument();
    });

    it('renders edit form when clicking edit button', async () => {
      const user = userEvent.setup();
      mockedGetPlantById.mockResolvedValue(mockPlant);
      mockedGetPlantForEdit.mockResolvedValue({
        plant: mockPlant,
        etag: '"1"'
      });

      renderWithProviders(<PlantDetail />, {
        route: `/plants/${mockPlant.id}`,
        path: '/plants/:id',
        initialToken: ADMIN_TEST_TOKEN
      });
      const editBtn = await screen.findByRole('button', { name: 'Editar' });

      await user.click(editBtn);

      expect(
        await screen.findByRole('button', { name: 'Cancelar' })
      ).toBeInTheDocument();
    });

    it('returns to view mode when clicking cancel button in edit form', async () => {
      const user = userEvent.setup();
      mockedGetPlantById.mockResolvedValue(mockPlant);
      mockedGetPlantForEdit.mockResolvedValue({
        plant: mockPlant,
        etag: '"1"'
      });

      renderWithProviders(<PlantDetail />, {
        route: `/plants/${mockPlant.id}`,
        path: '/plants/:id',
        initialToken: ADMIN_TEST_TOKEN
      });
      const editBtn = await screen.findByRole('button', { name: 'Editar' });
      await user.click(editBtn);
      const cancelBtn = await screen.findByRole('button', {
        name: 'Cancelar'
      });

      await user.click(cancelBtn);

      expect(
        await screen.findByRole('button', { name: 'Editar' })
      ).toBeInTheDocument();
    });

    it('submits update and returns to view mode on successful save', async () => {
      const user = userEvent.setup();
      const updated = buildPlant({ id: mockPlant.id, version: 2 });
      mockedGetPlantById.mockResolvedValue(mockPlant);
      mockedGetPlantForEdit.mockResolvedValue({
        plant: mockPlant,
        etag: '"1"'
      });
      mockedUpdatePlant.mockResolvedValue({
        plant: updated,
        etag: '"2"'
      });

      renderWithProviders(<PlantDetail />, {
        route: `/plants/${mockPlant.id}`,
        path: '/plants/:id',
        initialToken: ADMIN_TEST_TOKEN
      });

      const editBtn = await screen.findByRole('button', { name: 'Editar' });
      await user.click(editBtn);

      const saveBtn = await screen.findByRole('button', {
        name: 'Guardar cambios'
      });
      await user.click(saveBtn);

      expect(
        await screen.findByRole('button', { name: 'Editar' })
      ).toBeInTheDocument();
    });

    it('deletes plant after confirmation and navigates to catalog', async () => {
      const user = userEvent.setup();
      mockedGetPlantById.mockResolvedValue(mockPlant);
      mockedGetPlantForEdit.mockResolvedValue({
        plant: mockPlant,
        etag: '"1"'
      });
      mockedDeletePlant.mockResolvedValue(undefined);

      renderWithProviders(
        <Routes>
          <Route path="/plants/:id" element={<PlantDetail />} />
          <Route path="/plants" element={<div>PLANTS CATALOG</div>} />
        </Routes>,
        {
          route: `/plants/${mockPlant.id}`,
          initialToken: ADMIN_TEST_TOKEN
        }
      );

      const deleteBtn = await screen.findByRole('button', { name: 'Eliminar' });
      await user.click(deleteBtn);

      const dialog = await screen.findByRole('dialog');
      const confirmBtn = within(dialog).getByRole('button', {
        name: 'Eliminar'
      });
      await user.click(confirmBtn);

      expect(mockedDeletePlant).toHaveBeenCalledWith(mockPlant.id, '"1"');
      expect(await screen.findByText('PLANTS CATALOG')).toBeInTheDocument();
    });

    it('resets edit state when route ID changes', async () => {
      const user = userEvent.setup();
      const secondPlant = buildPlant({
        id: 'plant-2',
        identity: {
          ...mockPlant.identity,
          name: { ...mockPlant.identity.name, primary: 'Pimiento' }
        }
      });
      mockedGetPlantById.mockImplementation(async (targetId) =>
        targetId === secondPlant.id ? secondPlant : mockPlant
      );
      mockedGetPlantForEdit.mockImplementation(async (targetId) => ({
        plant: targetId === secondPlant.id ? secondPlant : mockPlant,
        etag: targetId === secondPlant.id ? '"2"' : '"1"'
      }));

      renderWithProviders(
        <>
          <Link to={`/plants/${secondPlant.id}`}>Go to second plant</Link>
          <Routes>
            <Route path="/plants/:id" element={<PlantDetail />} />
          </Routes>
        </>,
        {
          route: `/plants/${mockPlant.id}`,
          initialToken: ADMIN_TEST_TOKEN
        }
      );
      const editBtn = await screen.findByRole('button', { name: 'Editar' });
      await user.click(editBtn);
      await screen.findByRole('button', { name: 'Cancelar' });

      await user.click(screen.getByText('Go to second plant'));

      expect(
        await screen.findByRole('button', { name: 'Editar' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Cancelar' })
      ).not.toBeInTheDocument();
    });

    it('resets delete modal state when route ID changes', async () => {
      const user = userEvent.setup();
      const secondPlant = buildPlant({
        id: 'plant-2',
        identity: {
          ...mockPlant.identity,
          name: { ...mockPlant.identity.name, primary: 'Pimiento' }
        }
      });
      mockedGetPlantById.mockImplementation(async (targetId) =>
        targetId === secondPlant.id ? secondPlant : mockPlant
      );
      mockedGetPlantForEdit.mockImplementation(async (targetId) => ({
        plant: targetId === secondPlant.id ? secondPlant : mockPlant,
        etag: targetId === secondPlant.id ? '"2"' : '"1"'
      }));

      renderWithProviders(
        <>
          <Link to={`/plants/${secondPlant.id}`}>Go to second plant</Link>
          <Routes>
            <Route path="/plants/:id" element={<PlantDetail />} />
          </Routes>
        </>,
        {
          route: `/plants/${mockPlant.id}`,
          initialToken: ADMIN_TEST_TOKEN
        }
      );
      const deleteBtn = await screen.findByRole('button', { name: 'Eliminar' });
      await user.click(deleteBtn);
      await screen.findByRole('dialog');

      await user.click(screen.getByText('Go to second plant'));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('surfaces conflict error and reloads plant data on 412 PreconditionFailedError during deletion', async () => {
      const user = userEvent.setup();
      mockedGetPlantById.mockResolvedValue(mockPlant);
      mockedGetPlantForEdit.mockResolvedValue({
        plant: mockPlant,
        etag: '"1"'
      });
      mockedDeletePlant.mockRejectedValue(
        new PreconditionFailedError('Precondition Failed')
      );

      renderWithProviders(
        <Routes>
          <Route path="/plants/:id" element={<PlantDetail />} />
        </Routes>,
        {
          route: `/plants/${mockPlant.id}`,
          initialToken: ADMIN_TEST_TOKEN
        }
      );

      const deleteBtn = await screen.findByRole('button', { name: 'Eliminar' });
      await user.click(deleteBtn);

      const dialog = await screen.findByRole('dialog');
      const confirmBtn = within(dialog).getByRole('button', {
        name: 'Eliminar'
      });
      await user.click(confirmBtn);

      const reloadBtn = await within(dialog).findByRole('button', {
        name: 'Recargar datos actuales'
      });
      await user.click(reloadBtn);

      expect(mockedGetPlantById).toHaveBeenCalledTimes(2);
      expect(mockedGetPlantForEdit).toHaveBeenCalledTimes(2);
    });

    it('surfaces deletion error message in modal when deletion fails with network error', async () => {
      const user = userEvent.setup();
      mockedGetPlantById.mockResolvedValue(mockPlant);
      mockedGetPlantForEdit.mockResolvedValue({
        plant: mockPlant,
        etag: '"1"'
      });
      mockedDeletePlant.mockRejectedValue(
        new NetworkError('Fallo de conexión')
      );

      renderWithProviders(
        <Routes>
          <Route path="/plants/:id" element={<PlantDetail />} />
        </Routes>,
        {
          route: `/plants/${mockPlant.id}`,
          initialToken: ADMIN_TEST_TOKEN
        }
      );

      const deleteBtn = await screen.findByRole('button', { name: 'Eliminar' });
      await user.click(deleteBtn);

      const dialog = await screen.findByRole('dialog');
      const confirmBtn = within(dialog).getByRole('button', {
        name: 'Eliminar'
      });
      await user.click(confirmBtn);

      const toastRegion = await screen.findByRole('region', {
        name: t('toast.region_label')
      });
      const toastAlert = within(toastRegion).getByRole('alert');
      expect(toastAlert).toHaveTextContent(t('errors.offline.message'));
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).queryByRole('alert')).toBeNull();
    });
  });
});

describe('PlantDetail: botón de favorito en el hero', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    mockedGetPlantById.mockResolvedValue(mockPlant);
  });

  it('no se renderiza sin sesión', async () => {
    renderPlantDetail();

    await screen.findByRole('heading', {
      name: new RegExp(mockPlant.identity.name.primary, 'i')
    });
    expect(
      screen.queryByRole('button', { name: /favorita/i })
    ).not.toBeInTheDocument();
  });

  it('con sesión muestra el estado correcto y permite alternarlo', async () => {
    const { getBookmarkedPlantIds } =
      await import('../../../../src/services/bookmarks.service');
    vi.mocked(getBookmarkedPlantIds).mockResolvedValue(new Set([mockPlant.id]));

    renderWithProviders(<PlantDetail />, {
      route: `/plants/${mockPlant.id}`,
      path: '/plants/:id',
      initialToken: VALID_TEST_TOKEN
    });

    const button = await screen.findByRole('button', {
      name: t('favoriteButton.remove')
    });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});
