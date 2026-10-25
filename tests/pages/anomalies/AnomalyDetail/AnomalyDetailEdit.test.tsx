import '@testing-library/jest-dom';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '../../../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../src/shared/errors/PreconditionFailedError';
import { t } from '../../../../src/i18n/core/t';
import { COLLABORATOR_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { buildAnomaly } from '../../../fixtures/anomalies/buildAnomaly';
import {
  ETAG,
  mockedGetAnomalyBySlug,
  mockedGetAnomalyForEdit,
  mockedUpdateAnomaly,
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

async function openEditor(user: ReturnType<typeof userEvent.setup>) {
  renderEditorialDetail(COLLABORATOR_TEST_TOKEN);
  await user.click(await screen.findByRole('button', { name: 'Editar' }));
  await screen.findByRole('group', { name: 'Editar anomalía' });
}

describe('AnomalyDetail edición inline', () => {
  it('conmuta a un formulario precargado con el slug visible pero no editable', async () => {
    const user = userEvent.setup();
    await openEditor(user);

    expect(screen.getByLabelText(/^Nombre común/)).toHaveValue('Pulgón verde');
    expect(screen.getByLabelText(/^Síntomas/)).toHaveValue(
      'Hojas enrolladas\nMelaza pegajosa'
    );
    const slug = screen.getByLabelText(/^Slug para URL/);
    expect(slug).toHaveValue('pulgon-verde');
    expect(slug).toBeDisabled();
  });

  it('guarda con If-Match, envía solo lo modificado y vuelve a lectura', async () => {
    const updated = buildAnomaly({
      description: 'Descripción nueva',
      prevention: ['Fomentar fauna auxiliar', 'Rotación de cultivos']
    });
    mockedUpdateAnomaly.mockResolvedValue({ anomaly: updated, etag: '"v2"' });
    const user = userEvent.setup();
    await openEditor(user);

    const description = screen.getByLabelText(/^Descripción/);
    await user.clear(description);
    await user.type(description, 'Descripción nueva');
    await user.type(
      screen.getByLabelText(/^Prevención/),
      '{Enter}Rotación de cultivos'
    );
    mockedGetAnomalyBySlug.mockResolvedValue(updated);
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(mockedUpdateAnomaly).toHaveBeenCalledWith(
        'pulgon-verde',
        {
          description: 'Descripción nueva',
          prevention: ['Fomentar fauna auxiliar', 'Rotación de cultivos']
        },
        ETAG
      )
    );
    expect(await screen.findByText('Descripción nueva')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Editar anomalía' })).toBeNull();
    expect(screen.getByText('Rotación de cultivos')).toBeInTheDocument();
  });

  it('modifica recursos y diagnóstico diferencial enviando patch con If-Match', async () => {
    const updated = buildAnomaly({
      resources: [
        {
          type: 'image',
          url: 'https://images.example.com/pulgon.jpg',
          title: 'Detalle'
        }
      ],
      confusedWith: ['pulgon-negro']
    });
    mockedUpdateAnomaly.mockResolvedValue({ anomaly: updated, etag: '"v2"' });
    const user = userEvent.setup();
    await openEditor(user);

    await user.click(screen.getByRole('button', { name: 'Añadir fotografía' }));
    await user.type(
      screen.getByLabelText('URL de la imagen'),
      'https://images.example.com/pulgon.jpg'
    );
    await user.type(screen.getByLabelText('Pie de foto o título'), 'Detalle');
    await user.type(screen.getByLabelText(/Se confunde con/), 'pulgon-negro');
    mockedGetAnomalyBySlug.mockResolvedValue(updated);
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(mockedUpdateAnomaly).toHaveBeenCalledWith(
        'pulgon-verde',
        {
          resources: [
            {
              type: 'image',
              url: 'https://images.example.com/pulgon.jpg',
              title: 'Detalle'
            }
          ],
          confusedWith: ['pulgon-negro']
        },
        ETAG
      )
    );
  });

  it('vuelve a lectura sin petición si no hay cambios', async () => {
    const user = userEvent.setup();
    await openEditor(user);

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(mockedUpdateAnomaly).not.toHaveBeenCalled();
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Pulgón verde' })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Nombre común/)).toBeNull();
  });

  it('valida en cliente antes de enviar', async () => {
    const user = userEvent.setup();
    await openEditor(user);

    await user.clear(screen.getByLabelText(/^Nombre común/));
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(mockedUpdateAnomaly).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/^Nombre común/)).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('avisa del conflicto 412 y recarga la ficha al pedirlo', async () => {
    mockedUpdateAnomaly.mockRejectedValue(new PreconditionFailedError());
    const user = userEvent.setup();
    await openEditor(user);

    await user.type(screen.getByLabelText(/^Descripción/), ' más');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Conflicto de edición')).toBeInTheDocument();
    const toastRegion = await screen.findByRole('region', {
      name: t('toast.region_label')
    });
    const toastAlert = within(toastRegion).getByRole('alert');
    expect(toastAlert).toHaveClass('toast-item--error');
    expect(toastAlert).toHaveTextContent(t('toast.concurrent_modification'));
    expect(mockedUpdateAnomaly).toHaveBeenCalledOnce();

    const callsBefore = mockedGetAnomalyForEdit.mock.calls.length;
    await user.click(screen.getByRole('button', { name: 'Recargar ficha' }));

    await waitFor(() =>
      expect(mockedGetAnomalyForEdit.mock.calls.length).toBeGreaterThan(
        callsBefore
      )
    );
  });

  it('muestra errores 400 por campo conservando lo escrito', async () => {
    mockedUpdateAnomaly.mockRejectedValue(
      new ApiError('bad', 400, { description: 'Descripción no válida' })
    );
    const user = userEvent.setup();
    await openEditor(user);

    await user.type(screen.getByLabelText(/^Descripción/), ' más');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(
      await screen.findByText('Descripción no válida')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Descripción/)).toHaveValue(
      'Insecto chupador que debilita la planta. más'
    );
  });

  it('guía a reautenticarse sin perder el formulario si la sesión caduca', async () => {
    mockedUpdateAnomaly.mockRejectedValue(new ApiError('expired', 401));
    const user = userEvent.setup();
    await openEditor(user);

    await user.type(screen.getByLabelText(/^Descripción/), ' más');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(
      await screen.findByText(/Tu sesión ha caducado/)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Descripción/)).toHaveValue(
      'Insecto chupador que debilita la planta. más'
    );
  });

  it('cancela sin confirmación si no hay cambios', async () => {
    const user = userEvent.setup();
    await openEditor(user);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(
      await screen.findByRole('button', { name: 'Editar' })
    ).toBeInTheDocument();
  });

  it('pide confirmación al cancelar con cambios y descarta los cambios locales', async () => {
    const user = userEvent.setup();
    await openEditor(user);

    await user.type(screen.getByLabelText(/^Nombre común/), ' modificado');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Descartar cambios'
      })
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Pulgón verde' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Editar' }));
    expect(await screen.findByLabelText(/^Nombre común/)).toHaveValue(
      'Pulgón verde'
    );
  });

  it('permite seguir editando al rechazar el descarte', async () => {
    const user = userEvent.setup();
    await openEditor(user);

    await user.type(screen.getByLabelText(/^Nombre común/), ' modificado');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Continuar editando'
      })
    );

    expect(screen.getByLabelText(/^Nombre común/)).toHaveValue(
      'Pulgón verde modificado'
    );
  });

  it('muestra error con reintento si falla la carga para editar', async () => {
    mockedGetAnomalyForEdit.mockRejectedValueOnce(new ApiError('boom', 500));
    const user = userEvent.setup();
    renderEditorialDetail(COLLABORATOR_TEST_TOKEN);

    await user.click(await screen.findByRole('button', { name: 'Editar' }));

    expect(
      await screen.findByRole('button', { name: /reintentar/i })
    ).toBeInTheDocument();
  });
});
