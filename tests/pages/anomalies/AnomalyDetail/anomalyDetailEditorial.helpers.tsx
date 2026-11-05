import { Route, Routes } from 'react-router-dom';

import AnomalyDetail from '../../../../src/pages/anomalies/AnomalyDetail/AnomalyDetail';
import {
  deleteAnomaly,
  getAnomalyBySlug,
  getAnomalyForEdit,
  updateAnomaly
} from '../../../../src/services/anomalies.service';
import { clearStoredToken } from '../../../../src/shared/auth/session';
import { buildAnomaly } from '../../../fixtures/anomalies/buildAnomaly';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

export const mockedGetAnomalyBySlug = vi.mocked(getAnomalyBySlug);
export const mockedGetAnomalyForEdit = vi.mocked(getAnomalyForEdit);
export const mockedUpdateAnomaly = vi.mocked(updateAnomaly);
export const mockedDeleteAnomaly = vi.mocked(deleteAnomaly);

export const ETAG = '"v1"';

export function resetEditorialMocks(): void {
  vi.clearAllMocks();
  sessionStorage.clear();
  clearStoredToken();
  const anomaly = buildAnomaly();
  mockedGetAnomalyBySlug.mockResolvedValue(anomaly);
  mockedGetAnomalyForEdit.mockResolvedValue({ anomaly, etag: ETAG });
}

export function renderEditorialDetail(initialToken?: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/anomalies/:slug" element={<AnomalyDetail />} />
      <Route path="/anomalies" element={<div>ANOMALIES CATALOG</div>} />
    </Routes>,
    { route: '/anomalies/pulgon-verde', initialToken }
  );
}
