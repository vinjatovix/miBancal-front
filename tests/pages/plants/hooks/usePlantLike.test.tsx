import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { usePlantLike } from '../../../../src/pages/plants/hooks/usePlantLike';
import { checkPlantLike } from '../../../../src/services/plantLikes.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../../../../src/services/plantLikes.service');

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('usePlantLike', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('fetches plant like status when authenticated', async () => {
    vi.mocked(checkPlantLike).mockResolvedValue({ liked: true });

    const { result } = renderHook(() => usePlantLike('p-1', 'u-1'), {
      wrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.liked).toBe(true);
    expect(checkPlantLike).toHaveBeenCalledWith('p-1');
  });

  it('is disabled when anonymous', async () => {
    const { result } = renderHook(() => usePlantLike('p-1', undefined), {
      wrapper
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(checkPlantLike).not.toHaveBeenCalled();
  });
});
