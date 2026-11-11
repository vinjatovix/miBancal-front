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
import { reportUnexpectedError } from '../../../../src/shared/observability/reportUnexpectedError';
import { buildPlant } from '../../../fixtures/plants/buildPlant';

vi.mock('../../../../src/services/plantLikes.service', () => ({
  likePlant: vi.fn(() => Promise.resolve()),
  unlikePlant: vi.fn(() => Promise.resolve())
}));

vi.mock(
  '../../../../src/shared/observability/reportUnexpectedError',
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import('../../../../src/shared/observability/reportUnexpectedError')
    >()),
    reportUnexpectedError: vi.fn()
  })
);

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
    ['da me gusta', 'like', 5, 6],
    ['quita el me gusta', 'unlike', 5, 4]
  ] as const)(
    'actualiza de forma optimista likesCount en la caché de detalle al %s',
    async (_label, action, initialCount, expectedCount) => {
      const queryClient = new QueryClient();
      seedDetailCache(queryClient, initialCount);
      const { result } = renderHook(
        () => useTogglePlantLike(PLANT_ID, USER_ID),
        { wrapper: createWrapper(queryClient) }
      );

      result.current[action]();

      await waitFor(() => {
        const cached = queryClient.getQueryData<{ likesCount: number }>(
          plantKeys.detail(PLANT_ID, 'public')
        );
        expect(cached?.likesCount).toBe(expectedCount);
      });
    }
  );

  it('invoca likePlant al dar me gusta', async () => {
    const queryClient = new QueryClient();
    seedDetailCache(queryClient, 5);
    const { result } = renderHook(() => useTogglePlantLike(PLANT_ID, USER_ID), {
      wrapper: createWrapper(queryClient)
    });

    result.current.like();

    await waitFor(() => expect(likePlant).toHaveBeenCalledWith(PLANT_ID));
    expect(unlikePlant).not.toHaveBeenCalled();
  });

  it('invoca unlikePlant al quitar el me gusta', async () => {
    const queryClient = new QueryClient();
    seedDetailCache(queryClient, 5);
    const { result } = renderHook(() => useTogglePlantLike(PLANT_ID, USER_ID), {
      wrapper: createWrapper(queryClient)
    });

    result.current.unlike();

    await waitFor(() => expect(unlikePlant).toHaveBeenCalledWith(PLANT_ID));
    expect(likePlant).not.toHaveBeenCalled();
  });

  it('reporta el error cuando la invalidación de la caché falla', async () => {
    const queryClient = new QueryClient();
    const invalidationError = new Error('invalidate failed');
    vi.spyOn(queryClient, 'invalidateQueries').mockRejectedValue(
      invalidationError
    );
    seedDetailCache(queryClient, 5);
    const { result } = renderHook(() => useTogglePlantLike(PLANT_ID, USER_ID), {
      wrapper: createWrapper(queryClient)
    });

    result.current.like();

    await waitFor(() =>
      expect(reportUnexpectedError).toHaveBeenCalledWith(
        expect.objectContaining({ section: 'plant-like' }),
        invalidationError
      )
    );
  });
});
