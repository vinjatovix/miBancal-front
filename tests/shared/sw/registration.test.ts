import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSWUpdate } from '../../../src/shared/sw/registration';

const mockUpdateServiceWorker = vi.fn();

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [true, vi.fn()],
    updateServiceWorker: mockUpdateServiceWorker
  })
}));

describe('registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides SW update state through useSWUpdate hook', () => {
    const { result } = renderHook(() => useSWUpdate());

    expect(result.current).toEqual({
      needRefresh: true,
      updateServiceWorker: mockUpdateServiceWorker
    });
  });
});
