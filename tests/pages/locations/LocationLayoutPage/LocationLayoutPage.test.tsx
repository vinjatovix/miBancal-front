import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LocationLayoutPage from '../../../../src/pages/locations/LocationLayoutPage/LocationLayoutPage';
import {
  createBed,
  deleteBed,
  getBedForEdit
} from '../../../../src/services/beds.service';
import {
  getLocationLayout,
  updateLocation
} from '../../../../src/services/locations.service';
import { ApiError } from '../../../../src/shared/errors/ApiError';
import { locationKeys } from '../../../../src/shared/reactQuery/locationKeys';
import { VALID_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { buildBed } from '../../../fixtures/beds/buildBed';
import { buildLocation } from '../../../fixtures/locations/buildLocation';
import {
  buildLocationLayout,
  buildLocationLayoutSummary
} from '../../../fixtures/locations/buildLocationLayout';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

vi.mock('../../../../src/services/locations.service', () => ({
  getLocationLayout: vi.fn(),
  getLocationList: vi.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, limit: 100, totalPages: 1, totalItems: 0 }
  }),
  updateLocation: vi.fn()
}));

vi.mock('../../../../src/services/beds.service', () => ({
  createBed: vi.fn(),
  deleteBed: vi.fn(),
  getBedForEdit: vi.fn(),
  getBedList: vi.fn(),
  updateBed: vi.fn()
}));

const mockedGetLocationLayout = vi.mocked(getLocationLayout);
const mockedUpdateLocation = vi.mocked(updateLocation);
const mockedDeleteBed = vi.mocked(deleteBed);
const mockedGetBedForEdit = vi.mocked(getBedForEdit);
const mockedCreateBed = vi.mocked(createBed);

const PATH = '/locations/:id/layout';
const ROUTE = '/locations/loc-1/layout';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LocationLayoutPage', () => {
  it('shows the loader while the layout is loading', () => {
    mockedGetLocationLayout.mockReturnValueOnce(new Promise(() => {}));

    renderWithProviders(<LocationLayoutPage />, { path: PATH, route: ROUTE });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the canvas on success', async () => {
    mockedGetLocationLayout.mockResolvedValueOnce({
      layout: buildLocationLayout(),
      etag: '"1"'
    });

    renderWithProviders(<LocationLayoutPage />, { path: PATH, route: ROUTE });

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  it('renders the layout with a create action when the location has no beds', async () => {
    mockedGetLocationLayout.mockResolvedValueOnce({
      layout: buildLocationLayout({
        location: buildLocationLayoutSummary(),
        placedBeds: [],
        unplacedBeds: [],
        companionGraph: []
      }),
      etag: '"1"'
    });

    renderWithProviders(<LocationLayoutPage />, { path: PATH, route: ROUTE });

    expect(
      await screen.findByRole('button', { name: 'Nuevo bancal' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('No hay bancales sin colocar.')
    ).not.toBeInTheDocument();
  });

  it('shows an error state without throwing', async () => {
    mockedGetLocationLayout.mockRejectedValueOnce(new ApiError('Boom', 500));

    renderWithProviders(<LocationLayoutPage />, { path: PATH, route: ROUTE });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('renders not found for a not found error', async () => {
    mockedGetLocationLayout.mockRejectedValueOnce(new ApiError('Missing', 404));

    renderWithProviders(<LocationLayoutPage />, { path: PATH, route: ROUTE });

    await waitFor(() => {
      expect(
        screen.getByText('Localización no encontrada')
      ).toBeInTheDocument();
    });
  });

  it('renders not found when the id param is missing without throwing', () => {
    renderWithProviders(<LocationLayoutPage />, {
      path: '/locations/layout',
      route: '/locations/layout'
    });

    expect(screen.getByText('Localización no encontrada')).toBeInTheDocument();
    expect(mockedGetLocationLayout).not.toHaveBeenCalled();
  });

  it('reveals grid layers and plant management when selecting a bed in read mode', async () => {
    mockedGetLocationLayout.mockResolvedValueOnce({
      layout: buildLocationLayout(),
      etag: '"1"'
    });

    renderWithProviders(<LocationLayoutPage />, { path: PATH, route: ROUTE });

    const bed = await screen.findByRole('button', {
      name: /Bancal Tomates 1/
    });
    fireEvent.pointerDown(bed, { pointerId: 1, clientX: 0, clientY: 0 });

    expect(
      await screen.findByRole('button', {
        name: 'Gestionar plantas de Bancal Tomates 1'
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'Gestionar plantas de Bancal Tomates 1'
      })
    ).toBeNull();
    expect(
      screen.getByText('Capas de cuadrícula agronómica')
    ).toBeInTheDocument();
  });

  it('asks for confirmation when leaving position mode with pending changes', async () => {
    mockedGetLocationLayout.mockResolvedValue({
      layout: buildLocationLayout(),
      etag: '"1"'
    });
    const user = userEvent.setup();

    renderWithProviders(<LocationLayoutPage />, { path: PATH, route: ROUTE });

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Posición' }));
    await user.click(
      screen.getByRole('button', {
        name: 'Colocar el bancal Bancal Vivero Auxiliar en el plano'
      })
    );
    await user.click(screen.getByRole('button', { name: 'Vista' }));

    expect(
      await screen.findByText('¿Descartar los cambios?')
    ).toBeInTheDocument();
  });

  it('deletes selected bed and invalidates layout query', async () => {
    const layout = buildLocationLayout();
    mockedGetLocationLayout.mockResolvedValue({
      layout,
      etag: '"1"'
    });
    const placedBed = layout.placedBeds[0]!;
    mockedGetBedForEdit.mockResolvedValue({
      bed: buildBed({
        id: placedBed.id,
        name: placedBed.name,
        plantInstances: []
      }),
      etag: '"bed-etag-1"'
    });
    mockedDeleteBed.mockResolvedValue(undefined);
    const user = userEvent.setup();

    const { queryClient } = renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE,
      initialToken: VALID_TEST_TOKEN
    });

    const bed = await screen.findByRole('button', {
      name: new RegExp(placedBed.name)
    });
    fireEvent.pointerDown(bed, { pointerId: 1, clientX: 0, clientY: 0 });

    const deleteBtn = await screen.findByRole('button', {
      name: `Eliminar el bancal ${placedBed.name}`
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await user.click(deleteBtn);

    const confirmModal = await screen.findByRole('alertdialog', {
      name: '¿Eliminar el bancal?'
    });
    const confirmBtn = within(confirmModal).getByRole('button', {
      name: 'Eliminar'
    });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockedDeleteBed).toHaveBeenCalledWith(
        placedBed.id,
        '"bed-etag-1"'
      );
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: locationKeys.layout('loc-1')
    });
  });

  it('invalidates layout query when a new bed is created', async () => {
    mockedGetLocationLayout.mockResolvedValue({
      layout: buildLocationLayout(),
      etag: '"1"'
    });
    const createdBed = buildBed({
      id: 'bed-new-999',
      name: 'Bancal Zanahorias'
    });
    mockedCreateBed.mockResolvedValue({
      bed: createdBed,
      etag: '"new-etag"'
    });
    const user = userEvent.setup();

    const { queryClient } = renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE
    });

    const newBedButton = await screen.findByRole('button', {
      name: 'Nuevo bancal'
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await user.click(newBedButton);

    const nameInput = await screen.findByLabelText('Nombre del bancal');
    await user.type(nameInput, 'Bancal Zanahorias');
    await user.type(screen.getByLabelText('Ancho (cm)'), '100');
    await user.type(screen.getByLabelText('Largo (cm)'), '200');
    await user.type(
      screen.getByLabelText('Profundidad de sustrato (cm)'),
      '30'
    );

    await user.click(screen.getByRole('button', { name: 'Crear bancal' }));

    await waitFor(() => {
      expect(mockedCreateBed).toHaveBeenCalled();
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: locationKeys.layout('loc-1')
    });
  });

  it('updates live azimuth and heading in compass hud when rotating a bed', async () => {
    mockedGetLocationLayout.mockResolvedValueOnce({
      layout: buildLocationLayout(),
      etag: '"1"'
    });
    const user = userEvent.setup();

    renderWithProviders(<LocationLayoutPage />, { path: PATH, route: ROUTE });

    const modeToggle = await screen.findByRole('button', {
      name: 'Posición'
    });
    await user.click(modeToggle);

    const bed = await screen.findByRole('button', {
      name: /Bancal Tomates 1/
    });
    fireEvent.pointerDown(bed, { pointerId: 1, clientX: 0, clientY: 0 });

    const rotationInput = screen.getByRole('spinbutton', {
      name: 'Rotación en grados'
    });
    await user.click(rotationInput);
    await user.keyboard('{ArrowUp}');

    expect(
      await screen.findByText('Rumbo del bancal: 136° Sureste')
    ).toBeInTheDocument();
  });

  it('calibrates terrain north and saves with toast feedback when no bed is selected', async () => {
    mockedGetLocationLayout.mockResolvedValueOnce({
      layout: buildLocationLayout(),
      etag: '"1"'
    });
    mockedUpdateLocation.mockResolvedValueOnce({
      location: buildLocation({ id: 'loc-1', northAngle: 60 }),
      etag: '"etag-2"'
    });
    const user = userEvent.setup();

    renderWithProviders(<LocationLayoutPage />, { path: PATH, route: ROUTE });

    const modeToggle = await screen.findByRole('button', {
      name: 'Posición'
    });
    await user.click(modeToggle);

    const compassDial = await screen.findByRole('spinbutton', {
      name: 'Norte del terreno: 45°'
    });
    await user.click(compassDial);
    await user.keyboard('{Shift>}{ArrowUp}{/Shift}');

    expect(
      await screen.findByText('Norte del terreno: 60°')
    ).toBeInTheDocument();

    const saveNorthBtn = screen.getByRole('button', {
      name: 'Guardar'
    });
    await user.click(saveNorthBtn);

    await waitFor(() => {
      expect(mockedUpdateLocation).toHaveBeenCalledWith(
        'loc-1',
        { northAngle: 60 },
        '"1"'
      );
    });

    expect(
      await screen.findByText(
        'Orientación Norte de la localización guardada correctamente'
      )
    ).toBeInTheDocument();
  });

  it('renders viewport controls above the compass HUD in the layout hud container', async () => {
    mockedGetLocationLayout.mockResolvedValueOnce({
      layout: buildLocationLayout(),
      etag: '"1"'
    });

    renderWithProviders(<LocationLayoutPage />, { path: PATH, route: ROUTE });

    const compass = await screen.findByRole('region', {
      name: 'Brújula y orientación cardinal'
    });
    const viewportControls = screen.getByRole('toolbar', {
      name: 'Controles del plano'
    });
    const hudContainer = compass.parentElement;

    expect(hudContainer).toContainElement(viewportControls);
    expect(hudContainer).toContainElement(compass);
    expect(viewportControls.compareDocumentPosition(compass)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('calibrates terrain north when dragging compass dial in position mode', async () => {
    mockedGetLocationLayout.mockResolvedValueOnce({
      layout: buildLocationLayout({
        location: buildLocationLayoutSummary({ id: 'loc-1', northAngle: 0 })
      }),
      etag: '"1"'
    });
    const user = userEvent.setup();

    renderWithProviders(<LocationLayoutPage />, { path: PATH, route: ROUTE });

    const modeToggle = await screen.findByRole('button', {
      name: 'Posición'
    });
    await user.click(modeToggle);

    const compassDial = await screen.findByRole('spinbutton', {
      name: 'Norte estándar del plano (0°)'
    });
    vi.spyOn(compassDial, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => {}
    });

    fireEvent.pointerDown(compassDial, {
      clientX: 150,
      clientY: 150,
      button: 0
    });
    fireEvent.pointerMove(compassDial, {
      clientX: 200,
      clientY: 150
    });

    expect(
      await screen.findByText('Norte del terreno: 90°')
    ).toBeInTheDocument();
  });

  it('hides cardinal edge badges when toggling orientation button off without hiding compass HUD', async () => {
    mockedGetLocationLayout.mockResolvedValueOnce({
      layout: buildLocationLayout(),
      etag: '"1"'
    });
    const user = userEvent.setup();

    const { container } = renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE
    });

    const bed = await screen.findByRole('button', {
      name: /Bancal Tomates 1/
    });
    fireEvent.pointerDown(bed, { pointerId: 1, clientX: 0, clientY: 0 });

    const toggleCardinalBtn = screen.getByRole('button', {
      name: 'Mostrar orientación cardinal'
    });
    await user.click(toggleCardinalBtn);

    expect(toggleCardinalBtn).toHaveAttribute('aria-pressed', 'false');
    expect(
      container.querySelectorAll('.layout-bed-cardinal-labels__badge')
    ).toHaveLength(0);
    expect(
      screen.getByRole('region', { name: 'Brújula y orientación cardinal' })
    ).toBeInTheDocument();
  });

  it('restores cardinal edge badges when toggling orientation button back on', async () => {
    mockedGetLocationLayout.mockResolvedValueOnce({
      layout: buildLocationLayout(),
      etag: '"1"'
    });
    const user = userEvent.setup();

    const { container } = renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE
    });

    const bed = await screen.findByRole('button', {
      name: /Bancal Tomates 1/
    });
    fireEvent.pointerDown(bed, { pointerId: 1, clientX: 0, clientY: 0 });

    const toggleCardinalBtn = screen.getByRole('button', {
      name: 'Mostrar orientación cardinal'
    });
    await user.click(toggleCardinalBtn);
    expect(
      container.querySelectorAll('.layout-bed-cardinal-labels__badge')
    ).toHaveLength(0);

    await user.click(toggleCardinalBtn);

    expect(toggleCardinalBtn).toHaveAttribute('aria-pressed', 'true');
    expect(
      container.querySelectorAll('.layout-bed-cardinal-labels__badge')
    ).toHaveLength(4);
  });
});
