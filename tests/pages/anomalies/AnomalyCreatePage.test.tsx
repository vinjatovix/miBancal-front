import '@testing-library/jest-dom';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import AnomalyCreatePage from '../../../src/pages/anomalies/AnomalyCreatePage';
import { createAnomaly } from '../../../src/services/anomalies.service';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { t } from '../../../src/i18n/core/t';
import { buildAnomaly } from '../../fixtures/anomalies/buildAnomaly';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

vi.mock('../../../src/services/anomalies.service', () => ({
  createAnomaly: vi.fn()
}));

const mockedCreateAnomaly = vi.mocked(createAnomaly);

function renderCreatePage() {
  return renderWithProviders(
    <Routes>
      <Route path="/anomalies/new" element={<AnomalyCreatePage />} />
      <Route path="/anomalies" element={<div>ANOMALIES CATALOG</div>} />
      <Route path="/anomalies/:slug" element={<div>ANOMALY DETAIL</div>} />
    </Routes>,
    { route: '/anomalies/new' }
  );
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Nombre común/), 'Pulgón verde');
  await user.type(screen.getByLabelText(/^Slug para URL/), 'pulgon-verde');
  await user.selectOptions(screen.getByLabelText(/^Categoría/), 'pest');
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe('AnomalyCreatePage', () => {
  it('muestra cabecera y todos los campos del contrato', () => {
    renderCreatePage();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Nueva anomalía' })
    ).toBeInTheDocument();
    [
      /^Nombre común/,
      /^Slug para URL/,
      /^Categoría/,
      /^Nombre científico/,
      /^Descripción/,
      /^Síntomas/,
      /^Daños/,
      /^Causas/,
      /^Cultivos afectados/,
      /^Prevención/,
      /^Tratamiento/,
      /^Enemigos naturales/
    ].forEach((label) =>
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    );
    expect(screen.getByLabelText(/^Slug para URL/)).toBeEnabled();
  });

  it('bloquea el envío con obligatorios vacíos y señala los campos', async () => {
    const user = userEvent.setup();
    renderCreatePage();

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(mockedCreateAnomaly).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/^Nombre común/)).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByLabelText(/^Slug para URL/)).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByLabelText(/^Categoría/)).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(
      screen.getByText(/El formulario contiene errores/)
    ).toBeInTheDocument();
  });

  it('bloquea el envío con un slug inválido', async () => {
    const user = userEvent.setup();
    renderCreatePage();

    await fillRequired(user);
    await user.clear(screen.getByLabelText(/^Slug para URL/));
    await user.type(screen.getByLabelText(/^Slug para URL/), 'Slug Malo');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(mockedCreateAnomaly).not.toHaveBeenCalled();
    expect(
      screen.getByText(/El slug solo puede contener letras minúsculas/)
    ).toBeInTheDocument();
  });

  it('crea la anomalía y redirige a su ficha por slug', async () => {
    mockedCreateAnomaly.mockResolvedValue({
      anomaly: buildAnomaly(),
      etag: '"v1"'
    });
    const user = userEvent.setup();
    renderCreatePage();

    await fillRequired(user);
    await user.type(
      screen.getByLabelText(/^Síntomas/),
      'Hojas enrolladas{Enter}{Enter}Melaza{Enter}Hojas enrolladas'
    );
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('ANOMALY DETAIL')).toBeInTheDocument();
    const sent = mockedCreateAnomaly.mock.calls[0][0];
    expect(sent).toMatchObject({
      slug: 'pulgon-verde',
      name: 'Pulgón verde',
      category: 'pest',
      symptoms: ['Hojas enrolladas', 'Melaza']
    });
    expect(sent.id).toBeTruthy();
  });

  it('avisa del slug duplicado (409) sin perder el formulario', async () => {
    mockedCreateAnomaly.mockRejectedValue(new ApiError('dup', 409));
    const user = userEvent.setup();
    renderCreatePage();

    await fillRequired(user);
    await user.type(screen.getByLabelText(/^Descripción/), 'Texto conservado');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    const toastRegion = await screen.findByRole('region', {
      name: t('toast.region_label')
    });
    const toastAlert = within(toastRegion).getByRole('alert');
    expect(toastAlert).toHaveClass('toast-item--error');
    expect(toastAlert).toHaveTextContent(
      'Ya existe una anomalía registrada con este slug.'
    );
    expect(document.querySelector('div.anomaly-form__error')).toBeNull();
    expect(screen.getByLabelText(/^Nombre común/)).toHaveValue('Pulgón verde');
    expect(screen.getByLabelText(/^Descripción/)).toHaveValue(
      'Texto conservado'
    );
  });

  it('asigna los errores 400 a sus campos y emite toast de revision general', async () => {
    mockedCreateAnomaly.mockRejectedValue(
      new ApiError('bad', 400, { name: 'Nombre no válido' })
    );
    const user = userEvent.setup();
    renderCreatePage();

    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Nombre no válido')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nombre común/)).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    const toastRegion = await screen.findByRole('region', {
      name: t('toast.region_label')
    });
    const toastAlert = within(toastRegion).getByRole('alert');
    expect(toastAlert).toHaveClass('toast-item--error');
    expect(toastAlert).toHaveTextContent(
      'Por favor, revisa los datos introducidos en el formulario.'
    );
    expect(document.querySelector('div.anomaly-form__error')).toBeNull();
  });

  it('guía a reautenticarse sin perder los datos cuando la sesión caduca', async () => {
    mockedCreateAnomaly.mockRejectedValue(new ApiError('expired', 401));
    const user = userEvent.setup();
    renderCreatePage();

    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(
      await screen.findByText(/Tu sesión ha caducado/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Iniciar sesión' })
    ).toHaveAttribute('href', '/login');
    expect(screen.getByLabelText(/^Nombre común/)).toHaveValue('Pulgón verde');
  });

  it('conserva un borrador al caducar la sesión y lo restaura al volver', async () => {
    mockedCreateAnomaly.mockRejectedValue(new ApiError('expired', 401));
    const user = userEvent.setup();
    const first = renderCreatePage();

    await fillRequired(user);
    await user.type(screen.getByLabelText(/^Descripción/), 'Texto conservado');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    await screen.findByText(/Tu sesión ha caducado/);
    first.unmount();

    renderCreatePage();

    expect(screen.getByLabelText(/^Nombre común/)).toHaveValue('Pulgón verde');
    expect(screen.getByLabelText(/^Slug para URL/)).toHaveValue('pulgon-verde');
    expect(screen.getByLabelText(/^Descripción/)).toHaveValue(
      'Texto conservado'
    );
  });

  it('borra el borrador al guardar con éxito', async () => {
    mockedCreateAnomaly
      .mockRejectedValueOnce(new ApiError('expired', 401))
      .mockResolvedValueOnce({ anomaly: buildAnomaly(), etag: '"v1"' });
    const user = userEvent.setup();
    renderCreatePage();

    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    await screen.findByText(/Tu sesión ha caducado/);
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('ANOMALY DETAIL')).toBeInTheDocument();
    expect(sessionStorage.getItem('anomaly:create-draft')).toBeNull();
  });

  it('ignora un borrador corrupto', () => {
    sessionStorage.setItem('anomaly:create-draft', '{no es json');

    renderCreatePage();

    expect(screen.getByLabelText(/^Nombre común/)).toHaveValue('');
  });

  it('ignora un borrador con forma inesperada', () => {
    sessionStorage.setItem('anomaly:create-draft', JSON.stringify({ name: 1 }));

    renderCreatePage();

    expect(screen.getByLabelText(/^Nombre común/)).toHaveValue('');
  });

  it('cancela directamente un formulario sin cambios', async () => {
    const user = userEvent.setup();
    renderCreatePage();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByText('ANOMALIES CATALOG')).toBeInTheDocument();
  });

  it('pide confirmación al cancelar con cambios y permite seguir editando', async () => {
    const user = userEvent.setup();
    renderCreatePage();

    await user.type(screen.getByLabelText(/^Nombre común/), 'Pulgón');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    const dialog = screen.getByRole('alertdialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Continuar editando' })
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Nombre común/)).toHaveValue('Pulgón');
  });

  it('descarta los cambios al confirmar la cancelación', async () => {
    const user = userEvent.setup();
    renderCreatePage();

    await user.type(screen.getByLabelText(/^Nombre común/), 'Pulgón');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Descartar cambios'
      })
    );

    expect(screen.getByText('ANOMALIES CATALOG')).toBeInTheDocument();
  });
});
