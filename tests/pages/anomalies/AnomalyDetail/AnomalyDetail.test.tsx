import '@testing-library/jest-dom';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AnomalyDetail from '../../../../src/pages/anomalies/AnomalyDetail/AnomalyDetail';
import { getAnomalyBySlug } from '../../../../src/services/anomalies.service';
import { ApiError } from '../../../../src/shared/errors/ApiError';
import {
  buildAnomaly,
  buildDeletedAnomaly
} from '../../../fixtures/anomalies/buildAnomaly';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

vi.mock('../../../../src/services/anomalies.service', () => ({
  getAnomalyBySlug: vi.fn()
}));

const mockedGetAnomalyBySlug = vi.mocked(getAnomalyBySlug);

function renderDetail(slug = 'pulgon-verde') {
  return renderWithProviders(<AnomalyDetail />, {
    route: `/anomalies/${slug}`,
    path: '/anomalies/:slug'
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AnomalyDetail (lectura pública)', () => {
  it('muestra el estado de carga', () => {
    mockedGetAnomalyBySlug.mockReturnValue(new Promise(() => {}));

    renderDetail();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('pinta cabecera y todos los bloques de diagnóstico disponibles', async () => {
    mockedGetAnomalyBySlug.mockResolvedValue(buildAnomaly());

    renderDetail();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Pulgón verde' })
    ).toBeInTheDocument();
    expect(screen.getByText('Plaga')).toBeInTheDocument();
    expect(screen.getByText('Myzus persicae')).toBeInTheDocument();
    expect(mockedGetAnomalyBySlug).toHaveBeenCalledWith('pulgon-verde');

    const sections = [
      ['Descripción', 'Insecto chupador que debilita la planta.'],
      ['Síntomas', 'Hojas enrolladas'],
      ['Daños', 'Retraso del crecimiento'],
      ['Causas', 'Exceso de nitrógeno'],
      ['Cultivos afectados', 'Pimiento'],
      ['Prevención', 'Fomentar fauna auxiliar'],
      ['Tratamiento', 'Jabón potásico'],
      ['Enemigos naturales', 'Mariquita']
    ] as const;
    sections.forEach(([title, text]) => {
      const section = screen.getByTestId(`section-${title.toLowerCase()}`);
      expect(within(section).getByText(text)).toBeInTheDocument();
    });
  });

  it('omite las listas vacías o ausentes sin error', async () => {
    mockedGetAnomalyBySlug.mockResolvedValue(
      buildAnomaly({
        symptoms: [],
        damage: undefined,
        causes: [],
        treatment: ['Jabón potásico']
      })
    );

    renderDetail();

    await screen.findByRole('heading', { level: 1 });

    expect(screen.queryByTestId('section-síntomas')).not.toBeInTheDocument();
    expect(screen.queryByTestId('section-daños')).not.toBeInTheDocument();
    expect(screen.queryByTestId('section-causas')).not.toBeInTheDocument();
    expect(screen.getByTestId('section-tratamiento')).toBeInTheDocument();
  });

  it('avisa de que no hay datos cuando no hay descripción ni listas', async () => {
    mockedGetAnomalyBySlug.mockResolvedValue({
      id: 'id-1',
      slug: 'sin-datos',
      name: 'Sin datos',
      category: 'disorder',
      status: 'ACTIVE'
    });

    renderDetail('sin-datos');

    expect(
      await screen.findByText('Sin datos registrados.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Myzus persicae')).not.toBeInTheDocument();
  });

  it('traduce la categoría y el estado con tValue y tolera valores desconocidos', async () => {
    mockedGetAnomalyBySlug.mockResolvedValue(
      buildAnomaly({
        category: 'virus' as never,
        status: 'ARCHIVED' as never
      })
    );

    renderDetail();

    expect(await screen.findByText('virus')).toBeInTheDocument();
  });

  it('pinta el texto libre tal cual, sin interpretarlo como HTML', async () => {
    mockedGetAnomalyBySlug.mockResolvedValue(
      buildAnomaly({ symptoms: ['<b>negrita</b>'] })
    );

    renderDetail();

    expect(await screen.findByText('<b>negrita</b>')).toBeInTheDocument();
  });

  it('muestra badge y fecha para una anomalía eliminada', async () => {
    mockedGetAnomalyBySlug.mockResolvedValue(buildDeletedAnomaly());

    renderDetail();

    expect(await screen.findByText('Eliminada')).toBeInTheDocument();
    expect(screen.getByText(/Eliminada el/)).toBeInTheDocument();
  });

  it('muestra "no encontrada" ante un 404 sin lanzar en render', async () => {
    mockedGetAnomalyBySlug.mockRejectedValue(new ApiError('no', 404));

    renderDetail('inexistente');

    expect(
      await screen.findByRole('heading', { name: 'Anomalía no encontrada' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Volver al catálogo de anomalías' })
    ).toHaveAttribute('href', '/anomalies');
  });

  it('muestra error con reintento ante un fallo del servidor', async () => {
    mockedGetAnomalyBySlug.mockRejectedValueOnce(new ApiError('boom', 500));
    mockedGetAnomalyBySlug.mockResolvedValue(buildAnomaly());
    const user = userEvent.setup();

    renderDetail();

    await user.click(
      await screen.findByRole('button', { name: /reintentar/i })
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Pulgón verde' })
    ).toBeInTheDocument();
  });

  it('no muestra controles editoriales a un anónimo', async () => {
    mockedGetAnomalyBySlug.mockResolvedValue(buildAnomaly());

    renderDetail();

    await screen.findByRole('heading', { level: 1 });

    expect(
      screen.queryByRole('button', { name: 'Editar' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Eliminar' })
    ).not.toBeInTheDocument();
  });

  it('renders carousel in hero, confusedWith chips, and resources when anomaly includes rich media and differential diagnosis', async () => {
    const anomaly = buildAnomaly({
      resources: [
        {
          type: 'image',
          url: 'https://images.example.com/pulgon-1.jpg',
          title: 'Foto 1'
        },
        {
          type: 'image',
          url: 'https://images.example.com/pulgon-2.jpg',
          title: 'Foto 2'
        },
        {
          type: 'video',
          url: 'https://www.youtube.com/watch?v=pulgon123',
          title: 'Vídeo explicativo'
        },
        {
          type: 'article',
          url: 'https://extension.example.org/pulgon',
          title: 'Artículo técnico'
        }
      ],
      confusedWith: ['pulgon-negro', 'mosca-blanca']
    });
    mockedGetAnomalyBySlug.mockResolvedValue(anomaly);

    renderDetail();

    expect(
      await screen.findByRole('region', {
        name: 'Galería de imágenes de la anomalía'
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Diagnóstico diferencial')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Pulgon Negro/i })).toHaveAttribute(
      'href',
      '/anomalies/pulgon-negro'
    );
    expect(screen.getByRole('link', { name: /Mosca Blanca/i })).toHaveAttribute(
      'href',
      '/anomalies/mosca-blanca'
    );
    expect(screen.getByTitle('Vídeo explicativo')).toBeInTheDocument();
  });

  it('omits confusedWith section and resources section when neither is present in anomaly', async () => {
    const anomaly = buildAnomaly({
      resources: [],
      confusedWith: []
    });
    mockedGetAnomalyBySlug.mockResolvedValue(anomaly);

    renderDetail();

    await screen.findByRole('heading', { level: 1, name: 'Pulgón verde' });

    expect(
      screen.queryByText('Diagnóstico diferencial')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Recursos')).not.toBeInTheDocument();
  });
});
