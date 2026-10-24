import type { ReactNode } from 'react';

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTogglePlantLike } from '../../../../src/pages/plants/hooks/useTogglePlantLike';
import {
  likePlant,
  unlikePlant
} from '../../../../src/services/plantLikes.service';
import { plantKeys } from '../../../../src/shared/reactQuery/plantKeys';
import { buildPlant } from '../../../fixtures/plants/buildPlant';

vi.mock('../../../../src/services/plantLikes.service', () => ({
  likePlant: vi.fn(() => Promise.resolve()),
  unlikePlant: vi.fn(() => Promise.resolve())
}));

const PLANT_ID = 'p-1';
const USER_ID = 'u-1';

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function seedDetailCache(queryClient: QueryClient, likesCount: number) {
  queryClient.setQueryData(
    plantKeys.detail(PLANT_ID, 'public'),
    buildPlant({ id: PLANT_ID, likesCount })
  );
}

describe('useTogglePlantLike', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['da me gusta', false, 5, 6],
    ['quita el me gusta', true, 5, 4]
  ])(
    'actualiza de forma optimista likesCount en la caché de detalle al %s',
    async (_label, currentlyLiked, initialCount, expectedCount) => {
      const queryClient = new QueryClient();
      seedDetailCache(queryClient, initialCount);
      const { result } = renderHook(
        () => useTogglePlantLike(PLANT_ID, USER_ID),
        { wrapper: createWrapper(queryClient) }
      );

      result.current.mutate(currentlyLiked);

      await waitFor(() => {
        const cached = queryClient.getQueryData<{ likesCount: number }>(
          plantKeys.detail(PLANT_ID, 'public')
        );
        expect(cached?.likesCount).toBe(expectedCount);
      });
    }
  );

  it('invoca likePlant cuando la planta no estaba marcada', async () => {
    const queryClient = new QueryClient();
    seedDetailCache(queryClient, 5);
    const { result } = renderHook(() => useTogglePlantLike(PLANT_ID, USER_ID), {
      wrapper: createWrapper(queryClient)
    });

    result.current.mutate(false);

    await waitFor(() => expect(likePlant).toHaveBeenCalledWith(PLANT_ID));
    expect(unlikePlant).not.toHaveBeenCalled();
  });

  it('invoca unlikePlant cuando la planta ya estaba marcada', async () => {
    const queryClient = new QueryClient();
    seedDetailCache(queryClient, 5);
    const { result } = renderHook(() => useTogglePlantLike(PLANT_ID, USER_ID), {
      wrapper: createWrapper(queryClient)
    });

    result.current.mutate(true);

    await waitFor(() => expect(unlikePlant).toHaveBeenCalledWith(PLANT_ID));
    expect(likePlant).not.toHaveBeenCalled();
  });
});
