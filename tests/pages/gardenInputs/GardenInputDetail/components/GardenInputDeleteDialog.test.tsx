import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GardenInputDeleteDialog from '../../../../../src/pages/gardenInputs/GardenInputDetail/components/GardenInputDeleteDialog';
import { deleteGardenInput } from '../../../../../src/services/gardenInputs.service';
import { PreconditionFailedError } from '../../../../../src/shared/errors/PreconditionFailedError';
import { toastStore } from '../../../../../src/shared/toast/toastStore';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';

vi.mock('../../../../../src/services/gardenInputs.service', () => ({
  deleteGardenInput: vi.fn()
}));

const mockedDeleteGardenInput = vi.mocked(deleteGardenInput);

describe('GardenInputDeleteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders confirmation modal with input name and confirm button', () => {
    renderWithProviders(
      <GardenInputDeleteDialog
        isOpen={true}
        slug="purin-ortiga"
        name="Purín de ortiga"
        resolveEtag={() => Promise.resolve('"v1"')}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
        onReload={vi.fn()}
      />
    );

    expect(
      screen.getByRole('heading', { name: '¿Eliminar insumo?' })
    ).toBeInTheDocument();
    expect(screen.getByText('Purín de ortiga')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Eliminar insumo' })
    ).toBeInTheDocument();
  });

  it('executes delete with resolved ETag and calls onDeleted on confirmation', async () => {
    const user = userEvent.setup();
    mockedDeleteGardenInput.mockResolvedValue(undefined);
    const onDeleted = vi.fn();

    renderWithProviders(
      <GardenInputDeleteDialog
        isOpen={true}
        slug="purin-ortiga"
        name="Purín de ortiga"
        resolveEtag={() => Promise.resolve('"v1"')}
        onClose={vi.fn()}
        onDeleted={onDeleted}
        onReload={vi.fn()}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: 'Eliminar insumo' });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockedDeleteGardenInput).toHaveBeenCalledWith(
        'purin-ortiga',
        '"v1"'
      );
      expect(onDeleted).toHaveBeenCalledTimes(1);
    });
  });

  it('handles 412 Precondition Failed by displaying conflict alert and reload action', async () => {
    const user = userEvent.setup();
    mockedDeleteGardenInput.mockRejectedValue(new PreconditionFailedError());
    const onReload = vi.fn();

    renderWithProviders(
      <GardenInputDeleteDialog
        isOpen={true}
        slug="purin-ortiga"
        name="Purín de ortiga"
        resolveEtag={() => Promise.resolve('"v1"')}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
        onReload={onReload}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: 'Eliminar insumo' });
    await user.click(confirmBtn);

    const conflictMsg = await screen.findByText(
      'Este insumo ha sido modificado por otra persona. Recarga la página para ver los cambios más recientes.'
    );
    expect(conflictMsg).toBeInTheDocument();

    const reloadBtn = screen.getByRole('button', { name: 'Recargar' });
    await user.click(reloadBtn);

    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('shows error toast and aborts deletion when resolveEtag returns undefined', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <GardenInputDeleteDialog
        isOpen={true}
        slug="purin-ortiga"
        name="Purín de ortiga"
        resolveEtag={() => Promise.resolve(undefined)}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
        onReload={vi.fn()}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: 'Eliminar insumo' });
    await user.click(confirmBtn);

    const toasts = toastStore.getSnapshot();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe(
      'No se ha podido obtener la versión actual del insumo.'
    );
    expect(mockedDeleteGardenInput).not.toHaveBeenCalled();
  });

  it('shows error toast when deleteGardenInput rejects with generic error', async () => {
    const user = userEvent.setup();
    mockedDeleteGardenInput.mockRejectedValue(new Error('Fallo de red'));

    renderWithProviders(
      <GardenInputDeleteDialog
        isOpen={true}
        slug="purin-ortiga"
        name="Purín de ortiga"
        resolveEtag={() => Promise.resolve('"v1"')}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
        onReload={vi.fn()}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: 'Eliminar insumo' });
    await user.click(confirmBtn);

    await waitFor(() => {
      const toasts = toastStore.getSnapshot();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Fallo de red');
    });
  });
});
