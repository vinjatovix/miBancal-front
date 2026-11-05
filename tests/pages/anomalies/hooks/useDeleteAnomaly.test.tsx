import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { useDeleteAnomaly } from '../../../../src/pages/anomalies/hooks/useDeleteAnomaly';
import { deleteAnomaly } from '../../../../src/services/anomalies.service';
import { PreconditionFailedError } from '../../../../src/shared/errors/PreconditionFailedError';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/anomalies.service', () => ({
  deleteAnomaly: vi.fn()
}));

const mockedDeleteAnomaly = vi.mocked(deleteAnomaly);

function renderUseDeleteAnomaly() {
  const queryClient = createTestQueryClient();
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const rendered = renderHook(() => useDeleteAnomaly(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  });
  return { invalidate, ...rendered };
}

const params = { idOrSlug: 'pulgon-verde', etag: '"v3"' };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useDeleteAnomaly', () => {
  it('envía el DELETE con If-Match e invalida las queries', async () => {
    mockedDeleteAnomaly.mockResolvedValue(undefined);
    const { result, invalidate } = renderUseDeleteAnomaly();

    await result.current.mutateAsync(params);

    expect(mockedDeleteAnomaly).toHaveBeenCalledWith('pulgon-verde', '"v3"');
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['anomalies'] })
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['anomalies', 'detail', 'pulgon-verde']
    });
  });

  it('propaga el 412 sin invalidar', async () => {
    mockedDeleteAnomaly.mockRejectedValue(new PreconditionFailedError());
    const { result, invalidate } = renderUseDeleteAnomaly();

    await expect(result.current.mutateAsync(params)).rejects.toBeInstanceOf(
      PreconditionFailedError
    );
    expect(invalidate).not.toHaveBeenCalled();
  });
});
