import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GardenInputEditModal from '../../../../../src/pages/gardenInputs/GardenInputDetail/components/GardenInputEditModal';
import { updateGardenInput } from '../../../../../src/services/gardenInputs.service';
import { PreconditionFailedError } from '../../../../../src/shared/errors/PreconditionFailedError';
import { buildGardenInput } from '../../../../fixtures/gardenInputs/gardenInputFixtures';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';

vi.mock('../../../../../src/services/gardenInputs.service', () => ({
  updateGardenInput: vi.fn()
}));

const mockedUpdateGardenInput = vi.mocked(updateGardenInput);

const input = buildGardenInput({
  slug: 'purin-ortiga',
  name: 'Purín de ortiga'
});

describe('GardenInputEditModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders edit modal with populated entity values and disabled slug input', () => {
    renderWithProviders(
      <GardenInputEditModal
        isOpen={true}
        gardenInput={input}
        etag='"v1"'
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    const nameInput = screen.getByLabelText(/Nombre \*/i);
    const slugInput = screen.getByLabelText(/Identificador \(slug\) \*/i);

    expect(nameInput).toHaveValue('Purín de ortiga');
    expect(slugInput).toHaveValue('purin-ortiga');
    expect(slugInput).toBeDisabled();
  });

  it('submits updated values with If-Match etag header and calls onSuccess', async () => {
    const user = userEvent.setup();
    mockedUpdateGardenInput.mockResolvedValue({
      gardenInput: buildGardenInput({ name: 'Purín enriquecido' }),
      etag: '"v2"'
    });
    const onSuccess = vi.fn();

    renderWithProviders(
      <GardenInputEditModal
        isOpen={true}
        gardenInput={input}
        etag='"v1"'
        onClose={vi.fn()}
        onSuccess={onSuccess}
        onReload={vi.fn()}
      />
    );

    const nameInput = screen.getByLabelText(/Nombre \*/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Purín enriquecido');

    const submitBtn = screen.getByRole('button', { name: 'Guardar cambios' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockedUpdateGardenInput).toHaveBeenCalledWith(
        'purin-ortiga',
        expect.objectContaining({ name: 'Purín enriquecido' }),
        '"v1"'
      );
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('handles 412 Precondition Failed by displaying conflict banner and reload button', async () => {
    const user = userEvent.setup();
    mockedUpdateGardenInput.mockRejectedValue(new PreconditionFailedError());
    const onReload = vi.fn();

    renderWithProviders(
      <GardenInputEditModal
        isOpen={true}
        gardenInput={input}
        etag='"v1"'
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        onReload={onReload}
      />
    );

    const submitBtn = screen.getByRole('button', { name: 'Guardar cambios' });
    await user.click(submitBtn);

    const conflictAlert = await screen.findByRole('alert');
    expect(conflictAlert).toHaveTextContent('Conflicto de edición');

    const reloadBtn = screen.getByRole('button', { name: 'Recargar' });
    await user.click(reloadBtn);

    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('displays error message when update fails with generic server error', async () => {
    const user = userEvent.setup();
    mockedUpdateGardenInput.mockRejectedValue(new Error('Server error'));

    renderWithProviders(
      <GardenInputEditModal
        isOpen={true}
        gardenInput={input}
        etag='"v1"'
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    const submitBtn = screen.getByRole('button', { name: 'Guardar cambios' });
    await user.click(submitBtn);

    expect(
      await screen.findByText('Ha ocurrido un error al actualizar el insumo.')
    ).toBeInTheDocument();
  });

  it('resolves ETag via resolveEtag when etag prop is empty string', async () => {
    const user = userEvent.setup();
    mockedUpdateGardenInput.mockResolvedValue({
      gardenInput: buildGardenInput({ name: 'Purín enriquecido' }),
      etag: '"v2"'
    });
    const resolveEtag = vi.fn().mockResolvedValue('"resolved-v1"');
    const onSuccess = vi.fn();

    renderWithProviders(
      <GardenInputEditModal
        isOpen={true}
        gardenInput={input}
        etag=""
        resolveEtag={resolveEtag}
        onClose={vi.fn()}
        onSuccess={onSuccess}
        onReload={vi.fn()}
      />
    );

    const submitBtn = screen.getByRole('button', { name: 'Guardar cambios' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(resolveEtag).toHaveBeenCalledTimes(1);
      expect(mockedUpdateGardenInput).toHaveBeenCalledWith(
        'purin-ortiga',
        expect.anything(),
        '"resolved-v1"'
      );
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('displays error and aborts submission when resolveEtag returns undefined', async () => {
    const user = userEvent.setup();
    const resolveEtag = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <GardenInputEditModal
        isOpen={true}
        gardenInput={input}
        etag=""
        resolveEtag={resolveEtag}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    const submitBtn = screen.getByRole('button', { name: 'Guardar cambios' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockedUpdateGardenInput).not.toHaveBeenCalled();
      expect(
        screen.getByText(
          'No se ha podido obtener la versión actual del insumo.'
        )
      ).toBeInTheDocument();
    });
  });
});
