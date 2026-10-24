import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { PlantInlineEditForm } from '../../../../../src/pages/plants/PlantDetail/components/PlantInlineEditForm';
import { buildPlant } from '../../../../fixtures/plants/buildPlant';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { stubFetchError, stubFetchOk } from '../../../../test-utils/stubFetch';

describe('PlantInlineEditForm', () => {
  it('renders all sections and cancel/submit buttons', () => {
    const plant = buildPlant({ id: 'p-1' });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    expect(screen.getByText('Identidad y clasificación')).toBeInTheDocument();
    expect(
      screen.getByText('Rasgos botánicos y biológicos')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Fenología, siembra y recolección')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Requisitos edafoclimáticos y cultivo')
    ).toBeInTheDocument();
    expect(screen.getByText('Notas agronómicas')).toBeInTheDocument();
    expect(screen.getByText('Fotografía y recursos')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancelar' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();
  });

  it('calls onCancel directly when form is pristine', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const plant = buildPlant({ id: 'p-1' });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={onCancel}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('opens cancel confirmation modal when cancelling dirty form', async () => {
    const user = userEvent.setup();
    const plant = buildPlant({ id: 'p-1' });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/nombre común principal/i), ' extra');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('calls onCancel when user confirms cancellation in modal', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const plant = buildPlant({ id: 'p-1' });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={onCancel}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/nombre común principal/i), ' extra');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    const dialog = screen.getByRole('alertdialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Descartar cambios' })
    );

    expect(onCancel).toHaveBeenCalled();
  });

  it('keeps form open when user cancels confirmation modal', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const plant = buildPlant({ id: 'p-1' });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={onCancel}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/nombre común principal/i), ' extra');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    const dialog = screen.getByRole('alertdialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Continuar editando' })
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('submits update request with If-Match etag and calls onSuccess', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const plant = buildPlant({ id: 'p-1' });
    const updated = buildPlant({ id: 'p-1', version: 2 });
    stubFetchOk(updated, { ETag: '"2"' });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={onSuccess}
        onReload={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(
      await screen.findByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();
    expect(onSuccess).toHaveBeenCalledWith(updated, '"2"');
  });

  it('allows adding a note item in the form', async () => {
    const user = userEvent.setup();
    const plant = buildPlant({
      id: 'p-1',
      knowledge: { ...buildPlant().knowledge, notes: [] }
    });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    const addNoteBtn = screen.getByRole('button', { name: 'Añadir nota' });
    await user.click(addNoteBtn);

    const noteInput = screen.getByPlaceholderText(
      'Escribe una recomendación agronómica o nota de cultivo...'
    );
    await user.type(noteInput, 'Proteger de heladas tardías');

    expect(noteInput).toHaveValue('Proteger de heladas tardías');
  });

  it('allows removing an existing note item in the form', async () => {
    const user = userEvent.setup();
    const plant = buildPlant({
      id: 'p-1',
      knowledge: {
        ...buildPlant().knowledge,
        notes: ['Nota inicial existente']
      }
    });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    const removeBtn = screen.getByRole('button', { name: 'Eliminar nota' });
    await user.click(removeBtn);

    expect(
      screen.queryByDisplayValue('Nota inicial existente')
    ).not.toBeInTheDocument();
  });

  it('allows adding a YouTube video resource link', async () => {
    const user = userEvent.setup();
    const plant = buildPlant({
      id: 'p-1',
      knowledge: {
        ...buildPlant().knowledge,
        resources: [{ type: 'image', url: 'https://example.com/img.jpg' }]
      }
    });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    const addVideoBtn = screen.getByRole('button', {
      name: 'Añadir enlace de vídeo'
    });
    await user.click(addVideoBtn);

    const videoUrlInput = screen.getByPlaceholderText(
      'https://www.youtube.com/watch?v=...'
    );
    await user.type(videoUrlInput, 'https://www.youtube.com/watch?v=tutorial');

    expect(videoUrlInput).toHaveValue(
      'https://www.youtube.com/watch?v=tutorial'
    );
  });

  it('displays 412 conflict banner when update fails with precondition', async () => {
    const user = userEvent.setup();
    const plant = buildPlant({ id: 'p-1' });
    stubFetchError(412, { message: 'Precondition Failed' });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    const conflictTitle = await screen.findByText(
      'Conflicto de concurrencia (412)'
    );
    expect(conflictTitle).toBeInTheDocument();
  });

  it('calls onReload when clicking reload button on 412 conflict banner', async () => {
    const user = userEvent.setup();
    const onReload = vi.fn();
    const plant = buildPlant({ id: 'p-1' });
    stubFetchError(412, { message: 'Precondition Failed' });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={onReload}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    const reloadBtn = await screen.findByRole('button', {
      name: 'Recargar datos actuales'
    });

    await user.click(reloadBtn);

    expect(onReload).toHaveBeenCalled();
  });

  it('renders delete button in edit form actions', () => {
    const plant = buildPlant({ id: 'p-1' });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Eliminar' })
    ).toBeInTheDocument();
  });

  it('deletes plant upon confirmation and navigates to plants catalog', async () => {
    const user = userEvent.setup();
    const plant = buildPlant({ id: 'p-1' });
    stubFetchOk(undefined);

    renderWithProviders(
      <Routes>
        <Route
          path="/plants/:id"
          element={
            <PlantInlineEditForm
              plant={plant}
              etag='"1"'
              onCancel={vi.fn()}
              onSuccess={vi.fn()}
              onReload={vi.fn()}
            />
          }
        />
        <Route path="/plants" element={<div>PLANTS CATALOG</div>} />
      </Routes>,
      { route: `/plants/${plant.id}` }
    );

    const deleteBtn = screen.getByRole('button', { name: 'Eliminar' });
    await user.click(deleteBtn);

    const dialog = await screen.findByRole('dialog');
    const confirmBtn = within(dialog).getByRole('button', { name: 'Eliminar' });
    await user.click(confirmBtn);

    expect(await screen.findByText('PLANTS CATALOG')).toBeInTheDocument();
  });

  it('maps dot-notation API validation error paths and renders general error for unmapped paths', async () => {
    const user = userEvent.setup();
    const plant = buildPlant({ id: 'p-1' });
    stubFetchError(400, {
      message: 'Validation failed',
      errors: {
        'identity.name.primary': 'Nombre inválido en edición',
        'custom.backend.rule': 'Error no mapeado en edición'
      }
    });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    const submitBtn = screen.getByRole('button', { name: 'Guardar cambios' });
    await user.click(submitBtn);

    expect(
      await screen.findByText('Nombre inválido en edición')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Error no mapeado en edición')
    ).toBeInTheDocument();
  });
});
