import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocationLayout } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLocationLayout';
import { getLocationLayout } from '../../../../../src/services/locations.service';
import { ApiError } from '../../../../../src/shared/errors/ApiError';
import { buildLocationLayout } from '../../../../fixtures/locations/buildLocationLayout';
import { createTestQueryClient } from '../../../../test-utils/createTestQueryClient';

vi.mock('../../../../../src/services/locations.service', () => ({
  getLocationLayout: vi.fn()
}));

const mockedGetLocationLayout = vi.mocked(getLocationLayout);

function renderUseLocationLayout(id: string) {
  const queryClient = createTestQueryClient();
  return renderHook(() => useLocationLayout(id), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useLocationLayout', () => {
  it('exposes the layout and etag on success', async () => {
    const layout = buildLocationLayout();
    mockedGetLocationLayout.mockResolvedValueOnce({ layout, etag: '"7"' });

    const { result } = renderUseLocationLayout('loc-1');

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });
    expect(result.current.query.data?.layout).toEqual(layout);
    expect(result.current.etag).toBe('"7"');
    expect(mockedGetLocationLayout).toHaveBeenCalledWith('loc-1');
  });

  it('starts in a loading state', () => {
    mockedGetLocationLayout.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderUseLocationLayout('loc-1');

    expect(result.current.query.isLoading).toBe(true);
    expect(result.current.etag).toBe('');
  });

  it('exposes a not found error', async () => {
    const error = new ApiError('Not found', 404);
    mockedGetLocationLayout.mockRejectedValueOnce(error);

    const { result } = renderUseLocationLayout('missing');

    await waitFor(() => {
      expect(result.current.query.isError).toBe(true);
    });
    expect(result.current.query.error).toEqual(error);
  });

  it('does not fetch without an id', () => {
    renderUseLocationLayout('');

    expect(mockedGetLocationLayout).not.toHaveBeenCalled();
  });
});
