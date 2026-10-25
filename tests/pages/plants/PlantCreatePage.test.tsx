import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { t } from '../../../src/i18n/core/t';
import PlantCreatePage from '../../../src/pages/plants/PlantCreatePage';
import { listFamilyItemsResponse } from '../../fixtures/families/listFamilyItems';
import { buildPlant } from '../../fixtures/plants/buildPlant';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import { stubFetchError, stubFetchOk } from '../../test-utils/stubFetch';

describe('PlantCreatePage', () => {
  it('renders creation page title and sections', () => {
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(<PlantCreatePage />);

    expect(
      screen.getByRole('heading', { name: 'Nueva planta' })
    ).toBeInTheDocument();
    expect(screen.getByText('Identidad y clasificación')).toBeInTheDocument();
  });

  it('navigates to plants catalog when user cancels pristine form', async () => {
    const user = userEvent.setup();
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(
      <Routes>
        <Route path="/plants/new" element={<PlantCreatePage />} />
        <Route path="/plants" element={<div>PLANTS CATALOG</div>} />
      </Routes>,
      { route: '/plants/new' }
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    await user.click(cancelBtn);

    expect(screen.getByText('PLANTS CATALOG')).toBeInTheDocument();
  });

  it('opens cancel confirmation modal when cancelling dirty form', async () => {
    const user = userEvent.setup();
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(
      <Routes>
        <Route path="/plants/new" element={<PlantCreatePage />} />
        <Route path="/plants" element={<div>PLANTS CATALOG</div>} />
      </Routes>,
      { route: '/plants/new' }
    );

    const nameInput = screen.getByLabelText(/nombre común principal/i);
    await user.type(nameInput, 'Tomatera');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('navigates to plants catalog when user confirms cancellation in modal', async () => {
    const user = userEvent.setup();
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(
      <Routes>
        <Route path="/plants/new" element={<PlantCreatePage />} />
        <Route path="/plants" element={<div>PLANTS CATALOG</div>} />
      </Routes>,
      { route: '/plants/new' }
    );

    const nameInput = screen.getByLabelText(/nombre común principal/i);
    await user.type(nameInput, 'Tomatera');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    const dialog = screen.getByRole('alertdialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Descartar cambios' })
    );

    expect(screen.getByText('PLANTS CATALOG')).toBeInTheDocument();
  });

  it('keeps form open when user cancels confirmation modal', async () => {
    const user = userEvent.setup();
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(
      <Routes>
        <Route path="/plants/new" element={<PlantCreatePage />} />
        <Route path="/plants" element={<div>PLANTS CATALOG</div>} />
      </Routes>,
      { route: '/plants/new' }
    );

    const nameInput = screen.getByLabelText(/nombre común principal/i);
    await user.type(nameInput, 'Tomatera');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    const dialog = screen.getByRole('alertdialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Continuar editando' })
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Tomatera')).toBeInTheDocument();
  });

  it('submits form and navigates to plant detail on 201 Created', async () => {
    const user = userEvent.setup();
    const created = buildPlant({ id: 'p-created-1' });
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(
      <Routes>
        <Route path="/plants/new" element={<PlantCreatePage />} />
        <Route path="/plants/:id" element={<div>PLANT CREATED DETAIL</div>} />
      </Routes>,
      { route: '/plants/new' }
    );

    const nameInput = screen.getByLabelText(/nombre común principal/i);
    await user.type(nameInput, 'Tomate cherry');

    const sciInput = screen.getByLabelText(/nombre científico/i);
    await user.type(sciInput, 'Solanum lycopersicum var. cerasiforme');

    const familySelect = screen.getByRole('combobox', {
      name: /familia botánica/i
    });
    const option = await screen.findByRole('option', {
      name: /amarilidáceas/i
    });
    await user.selectOptions(familySelect, option);

    const sowingBtn = screen.getAllByRole('button', { name: 'Mar' })[0];
    await user.click(sowingBtn);

    const imageInput = screen.getByLabelText(/url de la fotografía/i);
    await user.type(imageInput, 'https://example.com/tomate.jpg');

    stubFetchOk(created, { ETag: '"1"' });

    const submitBtn = screen.getByRole('button', { name: /guardar|crear/i });
    await user.click(submitBtn);

    expect(await screen.findByText('PLANT CREATED DETAIL')).toBeInTheDocument();
  });

  it('allows adding notes during plant creation', async () => {
    const user = userEvent.setup();
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(<PlantCreatePage />);

    const addNoteBtn = screen.getByRole('button', { name: 'Añadir nota' });
    await user.click(addNoteBtn);

    const noteInput = screen.getByPlaceholderText(
      'Escribe una recomendación agronómica o nota de cultivo...'
    );
    await user.type(noteInput, 'Nota agronómica de siembra');

    expect(noteInput).toHaveValue('Nota agronómica de siembra');
  });

  it('allows adding video resources during plant creation', async () => {
    const user = userEvent.setup();
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(<PlantCreatePage />);

    const addVideoBtn = screen.getByRole('button', {
      name: 'Añadir enlace de vídeo'
    });
    await user.click(addVideoBtn);

    const videoInput = screen.getByPlaceholderText(
      'https://www.youtube.com/watch?v=...'
    );
    await user.type(videoInput, 'https://www.youtube.com/watch?v=cultivo123');

    expect(videoInput).toHaveValue(
      'https://www.youtube.com/watch?v=cultivo123'
    );
  });

  it('displays duplicate or bad request error without clearing form fields', async () => {
    const user = userEvent.setup();
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(<PlantCreatePage />);

    const nameInput = screen.getByLabelText(/nombre común principal/i);
    await user.type(nameInput, 'Tomate duplicado');

    const sciInput = screen.getByLabelText(/nombre científico/i);
    await user.type(sciInput, 'Solanum duplicatum');

    const familySelect = screen.getByRole('combobox', {
      name: /familia botánica/i
    });
    const option = await screen.findByRole('option', {
      name: /amarilidáceas/i
    });
    await user.selectOptions(familySelect, option);

    const sowingBtn = screen.getAllByRole('button', { name: 'Mar' })[0];
    await user.click(sowingBtn);

    const imageInput = screen.getByLabelText(/url de la fotografía/i);
    await user.type(imageInput, 'https://example.com/tomate.jpg');

    stubFetchError(409, {
      message: 'Conflict',
      errors: { primaryName: 'Ya existe una planta con este nombre' }
    });

    const submitBtn = screen.getByRole('button', { name: /guardar|crear/i });
    await user.click(submitBtn);

    const toastRegion = await screen.findByRole('region', {
      name: t('toast.region_label')
    });
    const toastAlert = within(toastRegion).getByRole('alert');
    expect(toastAlert).toHaveClass('toast-item--error');
    expect(toastAlert).toHaveTextContent(
      'Por favor, revisa los datos introducidos en el formulario.'
    );
    expect(
      screen.getByText('Ya existe una planta con este nombre')
    ).toBeInTheDocument();
    expect(
      document.querySelector('.plant-create-page > .plant-form__error')
    ).toBeNull();
    expect(nameInput).toHaveValue('Tomate duplicado');
  });

  it('displays validation summary banner when submitted with missing required fields', async () => {
    const user = userEvent.setup();
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(<PlantCreatePage />);

    const submitBtn = screen.getByRole('button', { name: /guardar|crear/i });
    await user.click(submitBtn);

    expect(
      screen.getByText(
        'El formulario contiene errores o campos obligatorios pendientes de completar.'
      )
    ).toBeInTheDocument();
  });

  it('maps dot-notation API validation error paths to form fields and displays general alert', async () => {
    const user = userEvent.setup();
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(<PlantCreatePage />);

    const nameInput = screen.getByLabelText(/nombre común principal/i);
    await user.type(nameInput, 'Tomate nuevo');

    const sciInput = screen.getByLabelText(/nombre científico/i);
    await user.type(sciInput, 'Solanum lycopersicum');

    const familySelect = screen.getByRole('combobox', {
      name: /familia botánica/i
    });
    const option = await screen.findByRole('option', {
      name: /amarilidáceas/i
    });
    await user.selectOptions(familySelect, option);

    const sowingBtn = screen.getAllByRole('button', { name: 'Mar' })[0];
    await user.click(sowingBtn);

    const imageInput = screen.getByLabelText(/url de la fotografía/i);
    await user.type(imageInput, 'https://example.com/tomate.jpg');

    stubFetchError(400, {
      message: 'Validation failed',
      errors: {
        'identity.name.primary': 'El nombre principal ya está registrado',
        'custom.server.rule': 'Error general no mapeado'
      }
    });

    const submitBtn = screen.getByRole('button', { name: /guardar|crear/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText('El nombre principal ya está registrado')
    ).toBeInTheDocument();
    const toastRegion = await screen.findByRole('region', {
      name: t('toast.region_label')
    });
    const toastAlert = within(toastRegion).getByRole('alert');
    expect(toastAlert).toHaveClass('toast-item--error');
    expect(toastAlert).toHaveTextContent('Error general no mapeado');
    expect(
      document.querySelector('.plant-create-page > .plant-form__error')
    ).toBeNull();
  });

  it('emits review toast and renders field error when 400 has only mapped field errors', async () => {
    const user = userEvent.setup();
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(<PlantCreatePage />);

    const nameInput = screen.getByLabelText(/nombre común principal/i);
    await user.type(nameInput, 'Tomate nuevo');

    const sciInput = screen.getByLabelText(/nombre científico/i);
    await user.type(sciInput, 'Solanum lycopersicum');

    const familySelect = screen.getByRole('combobox', {
      name: /familia botánica/i
    });
    const option = await screen.findByRole('option', {
      name: /amarilidáceas/i
    });
    await user.selectOptions(familySelect, option);

    const sowingBtn = screen.getAllByRole('button', { name: 'Mar' })[0];
    await user.click(sowingBtn);

    const imageInput = screen.getByLabelText(/url de la fotografía/i);
    await user.type(imageInput, 'https://example.com/tomate.jpg');

    stubFetchError(400, {
      message: 'Validation failed',
      errors: {
        'identity.name.primary': 'El nombre principal ya está registrado'
      }
    });

    const submitBtn = screen.getByRole('button', { name: /guardar|crear/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText('El nombre principal ya está registrado')
    ).toBeInTheDocument();
    const toastRegion = await screen.findByRole('region', {
      name: t('toast.region_label')
    });
    const toastAlert = within(toastRegion).getByRole('alert');
    expect(toastAlert).toHaveClass('toast-item--error');
    expect(toastAlert).toHaveTextContent(
      'Por favor, revisa los datos introducidos en el formulario.'
    );
    expect(
      document.querySelector('.plant-create-page > .plant-form__error')
    ).toBeNull();
  });
});
