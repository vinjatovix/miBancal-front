import '@testing-library/jest-dom';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '../../../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../src/shared/errors/PreconditionFailedError';
import { t } from '../../../../src/i18n/core/t';
import { ADMIN_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { buildDeletedAnomaly } from '../../../fixtures/anomalies/buildAnomaly';
import {
  ETAG,
  mockedDeleteAnomaly,
  mockedGetAnomalyBySlug,
  mockedGetAnomalyForEdit,
  renderEditorialDetail,
  resetEditorialMocks
} from './anomalyDetailEditorial.helpers';

vi.mock('../../../../src/services/anomalies.service', () => ({
  getAnomalyBySlug: vi.fn(),
  getAnomalyForEdit: vi.fn(),
  updateAnomaly: vi.fn(),
  deleteAnomaly: vi.fn()
}));

beforeEach(resetEditorialMocks);

async function openDeleteDialog(user: ReturnType<typeof userEvent.setup>) {
  renderEditorialDetail(ADMIN_TEST_TOKEN);
  await user.click(await screen.findByRole('button', { name: 'Eliminar' }));
  return screen.findByRole('dialog');
}

describe('AnomalyDetail eliminación', () => {
  it('pide confirmación antes de eliminar y no llama a la API al cancelar', async () => {
    const user = userEvent.setup();
    const dialog = await openDeleteDialog(user);

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    expect(mockedDeleteAnomaly).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('elimina con If-Match tras confirmar y vuelve al catálogo', async () => {
    mockedDeleteAnomaly.mockResolvedValue(undefined);
    const user = userEvent.setup();
    const dialog = await openDeleteDialog(user);

    await user.click(
      within(dialog).getByRole('button', { name: 'Eliminar anomalía' })
    );

    await waitFor(() =>
      expect(mockedDeleteAnomaly).toHaveBeenCalledWith('pulgon-verde', ETAG)
    );
    expect(await screen.findByText('ANOMALIES CATALOG')).toBeInTheDocument();
  });

  it('avisa del conflicto 412 y permite recargar la ficha', async () => {
    mockedDeleteAnomaly.mockRejectedValue(new PreconditionFailedError());
    const user = userEvent.setup();
    const dialog = await openDeleteDialog(user);

    await user.click(
      within(dialog).getByRole('button', { name: 'Eliminar anomalía' })
    );

    const alert = await within(dialog).findByRole('alert');
    expect(alert).toHaveTextContent(/modificada por otro usuario/);

    const callsBefore = mockedGetAnomalyBySlug.mock.calls.length;
    await user.click(
      within(alert).getByRole('button', { name: 'Recargar ficha' })
    );

    await waitFor(() =>
      expect(mockedGetAnomalyBySlug.mock.calls.length).toBeGreaterThan(
        callsBefore
      )
    );
    expect(mockedDeleteAnomaly).toHaveBeenCalledOnce();
  });

  it('muestra el error de la API en un toast sin cerrar el diálogo ni mostrar alerta estática', async () => {
    mockedDeleteAnomaly.mockRejectedValue(new ApiError('Fallo al borrar', 500));
    const user = userEvent.setup();
    const dialog = await openDeleteDialog(user);

    await user.click(
      within(dialog).getByRole('button', { name: 'Eliminar anomalía' })
    );

    const toastRegion = await screen.findByRole('region', {
      name: t('toast.region_label')
    });
    const toastAlert = within(toastRegion).getByRole('alert');
    expect(toastAlert).toHaveTextContent('Fallo al borrar');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).queryByRole('alert')).toBeNull();
  });

  it('no elimina si no se puede obtener el ETag y emite toast de error', async () => {
    mockedGetAnomalyForEdit.mockRejectedValue(new ApiError('boom', 500));
    const user = userEvent.setup();
    const dialog = await openDeleteDialog(user);

    await user.click(
      within(dialog).getByRole('button', { name: 'Eliminar anomalía' })
    );

    const toastRegion = await screen.findByRole('region', {
      name: t('toast.region_label')
    });
    const toastAlert = within(toastRegion).getByRole('alert');
    expect(toastAlert).toHaveTextContent(
      'No se ha podido eliminar la anomalía.'
    );
    expect(mockedDeleteAnomaly).not.toHaveBeenCalled();
    expect(within(dialog).queryByRole('alert')).toBeNull();
  });

  it('no ofrece eliminar una anomalía ya eliminada y la marca con badge para el editor', async () => {
    mockedGetAnomalyBySlug.mockResolvedValue(buildDeletedAnomaly());
    renderEditorialDetail(ADMIN_TEST_TOKEN);

    expect(await screen.findByText('Eliminada')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });
});
