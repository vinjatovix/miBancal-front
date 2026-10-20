import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import FamilyCreatePage from '../../../src/pages/families/FamilyCreatePage';
import { buildFamily } from '../../fixtures/families/buildFamily';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import { stubFetchError, stubFetchOk } from '../../test-utils/stubFetch';

describe('FamilyCreatePage', () => {
  it('renders creation page header and fields', () => {
    renderWithProviders(<FamilyCreatePage />);

    expect(
      screen.getByRole('heading', { name: 'Nueva familia' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre común/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre científico/i)).toBeInTheDocument();
  });

  it('navigates to families catalog when user cancels pristine form', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/families/new" element={<FamilyCreatePage />} />
        <Route path="/families" element={<div>FAMILIES CATALOG</div>} />
      </Routes>,
      { route: '/families/new' }
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    await user.click(cancelBtn);

    expect(screen.getByText('FAMILIES CATALOG')).toBeInTheDocument();
  });

  it('opens cancel confirmation modal when cancelling dirty form', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/families/new" element={<FamilyCreatePage />} />
        <Route path="/families" element={<div>FAMILIES CATALOG</div>} />
      </Routes>,
      { route: '/families/new' }
    );

    await user.type(screen.getByLabelText(/nombre común/i), 'Solanáceas');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('navigates to families catalog when user confirms cancellation in modal', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/families/new" element={<FamilyCreatePage />} />
        <Route path="/families" element={<div>FAMILIES CATALOG</div>} />
      </Routes>,
      { route: '/families/new' }
    );

    await user.type(screen.getByLabelText(/nombre común/i), 'Solanáceas');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    const dialog = screen.getByRole('alertdialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Descartar cambios' })
    );

    expect(screen.getByText('FAMILIES CATALOG')).toBeInTheDocument();
  });

  it('keeps form open when user cancels confirmation modal', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/families/new" element={<FamilyCreatePage />} />
        <Route path="/families" element={<div>FAMILIES CATALOG</div>} />
      </Routes>,
      { route: '/families/new' }
    );

    await user.type(screen.getByLabelText(/nombre común/i), 'Solanáceas');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    const dialog = screen.getByRole('alertdialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Continuar editando' })
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Solanáceas')).toBeInTheDocument();
  });

  it('submits form and navigates to family detail upon 201 Created', async () => {
    const user = userEvent.setup();
    const created = buildFamily({ id: 'f-created-1', slug: 'solanaceae' });

    renderWithProviders(
      <Routes>
        <Route path="/families/new" element={<FamilyCreatePage />} />
        <Route
          path="/families/:id"
          element={<div>FAMILY CREATED DETAIL</div>}
        />
      </Routes>,
      { route: '/families/new' }
    );

    const nameInput = screen.getByLabelText(/nombre común/i);
    await user.type(nameInput, 'Solanáceas');

    const sciInput = screen.getByLabelText(/nombre científico/i);
    await user.type(sciInput, 'Solanaceae');

    const descInput = screen.getByLabelText(/descripción corta/i);
    await user.type(descInput, 'Familia botánica de gran interés agrícola');

    const highlightsInput = screen.getByLabelText(/aspectos destacados/i);
    await user.type(highlightsInput, 'Presencia de alcaloides');

    stubFetchOk(created, { ETag: '"1"' });

    const submitBtn = screen.getByRole('button', { name: /guardar|crear/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText('FAMILY CREATED DETAIL')
    ).toBeInTheDocument();
  });

  it('displays duplicate slug error without clearing user inputs', async () => {
    const user = userEvent.setup();

    renderWithProviders(<FamilyCreatePage />);

    const nameInput = screen.getByLabelText(/nombre común/i);
    await user.type(nameInput, 'Solanáceas');

    const sciInput = screen.getByLabelText(/nombre científico/i);
    await user.type(sciInput, 'Solanaceae');

    const descInput = screen.getByLabelText(/descripción corta/i);
    await user.type(descInput, 'Familia botánica');

    const highlightsInput = screen.getByLabelText(/aspectos destacados/i);
    await user.type(highlightsInput, 'Aspecto');

    stubFetchError(409, {
      message: 'Conflict',
      errors: { slug: 'Ya existe una familia registrada con este slug' }
    });

    const submitBtn = screen.getByRole('button', { name: /guardar|crear/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText('Ya existe una familia registrada con este slug')
    ).toBeInTheDocument();
    expect(nameInput).toHaveValue('Solanáceas');
  });

  it('displays validation summary banner when submitted with missing required fields', async () => {
    const user = userEvent.setup();

    renderWithProviders(<FamilyCreatePage />);

    const submitBtn = screen.getByRole('button', { name: /guardar|crear/i });
    await user.click(submitBtn);

    expect(
      screen.getByText(
        'El formulario contiene errores o campos obligatorios pendientes de completar.'
      )
    ).toBeInTheDocument();
  });

  it('displays nested extra field validation errors on the corresponding field', async () => {
    const user = userEvent.setup();

    renderWithProviders(<FamilyCreatePage />);

    const nameInput = screen.getByLabelText(/nombre común/i);
    await user.type(nameInput, 'Solanáceas');

    const sciInput = screen.getByLabelText(/nombre científico/i);
    await user.type(sciInput, 'Solanaceae');

    const descInput = screen.getByLabelText(/descripción corta/i);
    await user.type(descInput, 'Familia botánica');

    const highlightsInput = screen.getByLabelText(/aspectos destacados/i);
    await user.type(highlightsInput, 'Aspecto');

    stubFetchError(400, {
      message: 'Validation failed',
      errors: {
        'extra.speciesCount': 'Debe ser un número mayor a cero'
      }
    });

    const submitBtn = screen.getByRole('button', { name: /guardar|crear/i });
    await user.click(submitBtn);

    const speciesInput = screen.getByLabelText(
      /número aproximado de especies/i
    );
    expect(speciesInput).toHaveAttribute('aria-invalid', 'true');
    expect(
      await screen.findByText('Debe ser un número mayor a cero')
    ).toBeInTheDocument();
  });

  it('displays unmapped server validation errors in general alert banner', async () => {
    const user = userEvent.setup();

    renderWithProviders(<FamilyCreatePage />);

    const nameInput = screen.getByLabelText(/nombre común/i);
    await user.type(nameInput, 'Solanáceas');

    const sciInput = screen.getByLabelText(/nombre científico/i);
    await user.type(sciInput, 'Solanaceae');

    const descInput = screen.getByLabelText(/descripción corta/i);
    await user.type(descInput, 'Familia botánica');

    const highlightsInput = screen.getByLabelText(/aspectos destacados/i);
    await user.type(highlightsInput, 'Aspecto');

    stubFetchError(400, {
      message: 'Validation failed',
      errors: {
        'extra.subfamilies': 'Subfamilias no permitidas'
      }
    });

    const submitBtn = screen.getByRole('button', { name: /guardar|crear/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText('Subfamilias no permitidas')
    ).toBeInTheDocument();
  });
});
