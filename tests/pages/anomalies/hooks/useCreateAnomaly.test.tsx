import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { useCreateAnomaly } from '../../../../src/pages/anomalies/hooks/useCreateAnomaly';
import { createAnomaly } from '../../../../src/services/anomalies.service';
import { ApiError } from '../../../../src/shared/errors/ApiError';
import { buildAnomaly } from '../../../fixtures/anomalies/buildAnomaly';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/anomalies.service', () => ({
  createAnomaly: vi.fn()
}));

const mockedCreateAnomaly = vi.mocked(createAnomaly);

const request = {
  id: 'id-1',
  slug: 'pulgon-verde',
  name: 'Pulgón verde',
  category: 'pest' as const
};

function renderUseCreateAnomaly() {
  const queryClient = createTestQueryClient();
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const rendered = renderHook(() => useCreateAnomaly(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  });
  return { invalidate, ...rendered };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCreateAnomaly', () => {
  it('crea la anomalía e invalida las queries del dominio', async () => {
    const created = { anomaly: buildAnomaly(), etag: '"v1"' };
    mockedCreateAnomaly.mockResolvedValue(created);
    const { result, invalidate } = renderUseCreateAnomaly();

    await result.current.mutateAsync(request);

    expect(mockedCreateAnomaly).toHaveBeenCalledWith(request);
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['anomalies'] })
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['anomalies', 'detail', 'pulgon-verde']
    });
  });

  it('propaga el 409 de slug duplicado sin invalidar', async () => {
    mockedCreateAnomaly.mockRejectedValue(new ApiError('dup', 409));
    const { result, invalidate } = renderUseCreateAnomaly();

    await expect(result.current.mutateAsync(request)).rejects.toMatchObject({
      status: 409
    });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('propaga el 400 con errores por campo', async () => {
    mockedCreateAnomaly.mockRejectedValue(
      new ApiError('bad', 400, { name: 'required' })
    );
    const { result } = renderUseCreateAnomaly();

    await expect(result.current.mutateAsync(request)).rejects.toMatchObject({
      status: 400,
      errors: { name: 'required' }
    });
  });
});
