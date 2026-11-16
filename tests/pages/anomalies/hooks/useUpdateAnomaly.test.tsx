import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { useUpdateAnomaly } from '../../../../src/pages/anomalies/hooks/useUpdateAnomaly';
import { updateAnomaly } from '../../../../src/services/anomalies.service';
import { ApiError } from '../../../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../src/shared/errors/PreconditionFailedError';
import { buildAnomaly } from '../../../fixtures/anomalies/buildAnomaly';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/anomalies.service', () => ({
  updateAnomaly: vi.fn()
}));

const mockedUpdateAnomaly = vi.mocked(updateAnomaly);

function renderUseUpdateAnomaly() {
  const queryClient = createTestQueryClient();
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const rendered = renderHook(() => useUpdateAnomaly(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  });
  return { invalidate, ...rendered };
}

const params = {
  idOrSlug: 'pulgon-verde',
  patch: { name: 'Nuevo' },
  etag: '"v3"'
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useUpdateAnomaly', () => {
  it('envía el PATCH con el ETag vigente e invalida las queries', async () => {
    mockedUpdateAnomaly.mockResolvedValue({
      anomaly: buildAnomaly({ name: 'Nuevo' }),
      etag: '"v4"'
    });
    const { result, invalidate } = renderUseUpdateAnomaly();

    await result.current.mutateAsync(params);

    expect(mockedUpdateAnomaly).toHaveBeenCalledWith(
      'pulgon-verde',
      { name: 'Nuevo' },
      '"v3"'
    );
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['anomalies'] })
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['anomalies', 'edit', 'pulgon-verde']
    });
  });

  it('propaga el 412 sin reintentar a ciegas ni invalidar', async () => {
    mockedUpdateAnomaly.mockRejectedValue(new PreconditionFailedError());
    const { result, invalidate } = renderUseUpdateAnomaly();

    await expect(result.current.mutateAsync(params)).rejects.toBeInstanceOf(
      PreconditionFailedError
    );
    expect(mockedUpdateAnomaly).toHaveBeenCalledOnce();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('propaga otros errores de la API', async () => {
    mockedUpdateAnomaly.mockRejectedValue(new ApiError('bad', 400));
    const { result } = renderUseUpdateAnomaly();

    await expect(result.current.mutateAsync(params)).rejects.toMatchObject({
      status: 400
    });
  });
});
