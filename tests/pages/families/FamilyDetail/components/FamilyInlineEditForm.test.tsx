import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FamilyInlineEditForm } from '../../../../../src/pages/families/FamilyDetail/components/FamilyInlineEditForm';
import { buildFamily } from '../../../../fixtures/families/buildFamily';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { stubFetchError, stubFetchOk } from '../../../../test-utils/stubFetch';

describe('FamilyInlineEditForm', () => {
  it('renders family fields and action buttons', () => {
    const family = buildFamily({ slug: 'solanaceae' });

    renderWithProviders(
      <FamilyInlineEditForm
        family={family}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/nombre común/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre científico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancelar' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();
  });

  it('calls onCancel when pristine and user clicks Cancelar', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const family = buildFamily({ slug: 'solanaceae' });

    renderWithProviders(
      <FamilyInlineEditForm
        family={family}
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
    const family = buildFamily({ slug: 'solanaceae' });

    renderWithProviders(
      <FamilyInlineEditForm
        family={family}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/nombre común/i), ' extra');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('calls onCancel when user confirms cancellation in modal', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const family = buildFamily({ slug: 'solanaceae' });

    renderWithProviders(
      <FamilyInlineEditForm
        family={family}
        etag='"1"'
        onCancel={onCancel}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/nombre común/i), ' extra');
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
    const family = buildFamily({ slug: 'solanaceae' });

    renderWithProviders(
      <FamilyInlineEditForm
        family={family}
        etag='"1"'
        onCancel={onCancel}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/nombre común/i), ' extra');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    const dialog = screen.getByRole('alertdialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Continuar editando' })
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('submits update request and calls onSuccess upon successful save', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const family = buildFamily({ slug: 'solanaceae' });
    const updated = buildFamily({ slug: 'solanaceae', version: 2 });
    stubFetchOk(updated, { ETag: '"2"' });

    renderWithProviders(
      <FamilyInlineEditForm
        family={family}
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

  it('shows 412 conflict banner when update fails with precondition', async () => {
    const user = userEvent.setup();
    const family = buildFamily({ slug: 'solanaceae' });
    stubFetchError(412, { message: 'Precondition Failed' });

    renderWithProviders(
      <FamilyInlineEditForm
        family={family}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(
      await screen.findByText('Conflicto de edición (412)')
    ).toBeInTheDocument();
  });

  it('calls onReload when user clicks reload button on 412 conflict banner', async () => {
    const user = userEvent.setup();
    const onReload = vi.fn();
    const family = buildFamily({ slug: 'solanaceae' });
    stubFetchError(412, { message: 'Precondition Failed' });

    renderWithProviders(
      <FamilyInlineEditForm
        family={family}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={onReload}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    const reloadBtn = await screen.findByRole('button', {
      name: 'Recargar ficha'
    });

    await user.click(reloadBtn);

    expect(onReload).toHaveBeenCalled();
  });

  it('displays nested extra field validation errors on the corresponding field', async () => {
    const user = userEvent.setup();
    const family = buildFamily({ slug: 'solanaceae' });
    stubFetchError(400, {
      message: 'Validation failed',
      errors: {
        'extra.order': 'El orden especificado no es válido'
      }
    });

    renderWithProviders(
      <FamilyInlineEditForm
        family={family}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    const orderInput = screen.getByLabelText(/orden taxonómico/i);
    expect(orderInput).toHaveAttribute('aria-invalid', 'true');
    expect(
      await screen.findByText('El orden especificado no es válido')
    ).toBeInTheDocument();
  });

  it('displays unmapped server validation errors in general banner', async () => {
    const user = userEvent.setup();
    const family = buildFamily({ slug: 'solanaceae' });
    stubFetchError(400, {
      message: 'Validation failed',
      errors: {
        'extra.subfamilies': 'Subfamilias no permitidas'
      }
    });

    renderWithProviders(
      <FamilyInlineEditForm
        family={family}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(
      await screen.findByText('Subfamilias no permitidas')
    ).toBeInTheDocument();
  });
});
