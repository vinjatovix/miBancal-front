import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { useAnomalyForEdit } from '../../../../src/pages/anomalies/hooks/useAnomalyForEdit';
import { getAnomalyForEdit } from '../../../../src/services/anomalies.service';
import { buildAnomaly } from '../../../fixtures/anomalies/buildAnomaly';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/anomalies.service', () => ({
  getAnomalyForEdit: vi.fn()
}));

const mockedGetAnomalyForEdit = vi.mocked(getAnomalyForEdit);

function renderUseAnomalyForEdit(idOrSlug?: string, enabled?: boolean) {
  const queryClient = createTestQueryClient();
  return renderHook(() => useAnomalyForEdit(idOrSlug, enabled), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAnomalyForEdit', () => {
  it('devuelve la anomalía y el ETag del GET completo', async () => {
    const result = { anomaly: buildAnomaly(), etag: '"v1"' };
    mockedGetAnomalyForEdit.mockResolvedValue(result);

    const { result: hook } = renderUseAnomalyForEdit('pulgon-verde');

    await waitFor(() => expect(hook.current.data).toEqual(result));
    expect(mockedGetAnomalyForEdit).toHaveBeenCalledWith('pulgon-verde');
  });

  it('no pide nada si está deshabilitado', () => {
    renderUseAnomalyForEdit('pulgon-verde', false);

    expect(mockedGetAnomalyForEdit).not.toHaveBeenCalled();
  });

  it('no pide nada sin slug', () => {
    renderUseAnomalyForEdit(undefined);

    expect(mockedGetAnomalyForEdit).not.toHaveBeenCalled();
  });
});
