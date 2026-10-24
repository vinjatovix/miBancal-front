import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import AnomalyDetail from '../../../src/pages/anomalies/AnomalyDetail/AnomalyDetail';
import AnomalyList from '../../../src/pages/anomalies/AnomalyList';
import {
  getAnomalyBySlug,
  getAnomalyForEdit,
  getAnomalyList
} from '../../../src/services/anomalies.service';
import { clearStoredToken } from '../../../src/shared/auth/session';
import {
  buildAnomaly,
  buildAnomalyListItem
} from '../../fixtures/anomalies/buildAnomaly';
import {
  ADMIN_TEST_TOKEN,
  COLLABORATOR_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

vi.mock('../../../src/services/anomalies.service', () => ({
  getAnomalyList: vi.fn(),
  getAnomalyBySlug: vi.fn(),
  getAnomalyForEdit: vi.fn()
}));

const anomaly = buildAnomaly();

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  clearStoredToken();
  vi.mocked(getAnomalyList).mockResolvedValue({
    data: [buildAnomalyListItem()],
    pagination: { page: 1, limit: 25, totalPages: 1, totalItems: 1 }
  });
  vi.mocked(getAnomalyBySlug).mockResolvedValue(anomaly);
  vi.mocked(getAnomalyForEdit).mockResolvedValue({ anomaly, etag: '"v1"' });
});

const ROLES = [
  ['anónimo', undefined, false],
  ['user', VALID_TEST_TOKEN, false],
  ['collaborator', COLLABORATOR_TEST_TOKEN, true],
  ['admin', ADMIN_TEST_TOKEN, true]
] as const;

describe.each(ROLES)(
  'controles editoriales para %s',
  (_role, token, isEditor) => {
    it('en el listado muestra "Nueva anomalía" solo a editores', async () => {
      renderWithProviders(<AnomalyList />, { initialToken: token });

      await screen.findByRole('link', { name: /Ver ficha de/ });

      expect(
        screen.queryByRole('link', { name: 'Nueva anomalía' }) !== null
      ).toBe(isEditor);
    });

    it('en el detalle muestra Editar y Eliminar solo a editores', async () => {
      renderWithProviders(
        <Routes>
          <Route path="/anomalies/:slug" element={<AnomalyDetail />} />
        </Routes>,
        { route: '/anomalies/pulgon-verde', initialToken: token }
      );

      await screen.findByRole('heading', { level: 1, name: 'Pulgón verde' });

      expect(screen.queryByRole('button', { name: 'Editar' }) !== null).toBe(
        isEditor
      );
      expect(screen.queryByRole('button', { name: 'Eliminar' }) !== null).toBe(
        isEditor
      );
    });

    it('no pide la copia de edición (ETag) a quien no es editor', async () => {
      renderWithProviders(
        <Routes>
          <Route path="/anomalies/:slug" element={<AnomalyDetail />} />
        </Routes>,
        { route: '/anomalies/pulgon-verde', initialToken: token }
      );

      await screen.findByRole('heading', { level: 1, name: 'Pulgón verde' });

      expect(vi.mocked(getAnomalyForEdit).mock.calls.length > 0).toBe(isEditor);
    });
  }
);
