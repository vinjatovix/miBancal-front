import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { useAnomaly } from '../../../../src/pages/anomalies/hooks/useAnomaly';
import { getAnomalyBySlug } from '../../../../src/services/anomalies.service';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { anomalyKeys } from '../../../../src/shared/reactQuery/anomalyKeys';
import { getDetailViewState } from '../../../../src/shared/reactQuery/detailViewState';
import { ApiError } from '../../../../src/shared/errors/ApiError';
import { COLLABORATOR_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { buildAnomaly } from '../../../fixtures/anomalies/buildAnomaly';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/anomalies.service', () => ({
  getAnomalyBySlug: vi.fn()
}));

const mockedGetAnomalyBySlug = vi.mocked(getAnomalyBySlug);

function renderUseAnomaly(slug?: string) {
  const queryClient = createTestQueryClient();
  const rendered = renderHook(() => useAnomaly(slug), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
  });
  return { queryClient, ...rendered };
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  clearStoredToken();
});

describe('useAnomaly', () => {
  it('carga la ficha por slug', async () => {
    const anomaly = buildAnomaly();
    mockedGetAnomalyBySlug.mockResolvedValue(anomaly);

    const { result } = renderUseAnomaly('pulgon-verde');

    await waitFor(() => expect(result.current.data).toEqual(anomaly));
    expect(mockedGetAnomalyBySlug).toHaveBeenCalledWith('pulgon-verde');
  });

  it('no pide nada sin slug', () => {
    renderUseAnomaly(undefined);

    expect(mockedGetAnomalyBySlug).not.toHaveBeenCalled();
  });

  it('clasifica un 404 como no encontrado sin lanzar en render', async () => {
    mockedGetAnomalyBySlug.mockRejectedValue(new ApiError('nope', 404));

    const { result } = renderUseAnomaly('inexistente');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getDetailViewState('inexistente', result.current)).toBe('notFound');
  });

  it('separa la caché por scope de rol', async () => {
    setStoredToken(COLLABORATOR_TEST_TOKEN);
    const anomaly = buildAnomaly();
    mockedGetAnomalyBySlug.mockResolvedValue(anomaly);

    const { result, queryClient } = renderUseAnomaly('pulgon-verde');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryData(anomalyKeys.detail('pulgon-verde', 'editorial'))
    ).toEqual(anomaly);
  });
});
