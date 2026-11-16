import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useBedsLayoutMutation } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useBedsLayoutMutation';
import {
  getLocationLayout,
  updateBedsLayout
} from '../../../../../src/services/locations.service';
import { ApiError } from '../../../../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../../src/shared/errors/PreconditionFailedError';
import type { BedLayoutPlacementInput } from '../../../../../src/types/Location/LocationLayout';
import {
  buildLocationLayout,
  buildPlacedBed
} from '../../../../fixtures/locations/buildLocationLayout';
import { createTestQueryClient } from '../../../../test-utils/createTestQueryClient';

vi.mock('../../../../../src/services/locations.service', () => ({
  getLocationLayout: vi.fn(),
  updateBedsLayout: vi.fn()
}));

const mockedUpdate = vi.mocked(updateBedsLayout);
const mockedGetLayout = vi.mocked(getLocationLayout);

const PLACEMENTS: readonly BedLayoutPlacementInput[] = [
  {
    id: '22222222-2222-4222-8222-222222222221',
    position: { x: 10, y: 20 },
    rotation: 90
  }
];

function renderMutation(etag = '"7"') {
  const queryClient = createTestQueryClient();
  return renderHook(() => useBedsLayoutMutation('loc-1', etag), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useBedsLayoutMutation', () => {
  it('sends the placements with the current etag and refetches the layout', async () => {
    mockedUpdate.mockResolvedValueOnce({ etag: '"9"' });
    mockedGetLayout.mockResolvedValueOnce({
      layout: buildLocationLayout({
        placedBeds: [
          buildPlacedBed({
            id: '22222222-2222-4222-8222-222222222221',
            position: { x: 10, y: 20 },
            rotation: 90
          })
        ],
        unplacedBeds: []
      }),
      etag: '"9"'
    });

    const { result } = renderMutation();

    result.current.mutation.mutate(PLACEMENTS);

    await waitFor(() => {
      expect(result.current.mutation.isSuccess).toBe(true);
    });
    expect(mockedUpdate).toHaveBeenCalledWith('loc-1', PLACEMENTS, '"7"');
    expect(mockedGetLayout).toHaveBeenCalledWith('loc-1');
    expect(result.current.adjustedBedIds).toEqual([]);
    expect(result.current.conflict).toBeNull();
  });

  it('reports adjusted beds when the server moved them', async () => {
    mockedUpdate.mockResolvedValueOnce({ etag: '"9"' });
    mockedGetLayout.mockResolvedValueOnce({
      layout: buildLocationLayout({
        placedBeds: [
          buildPlacedBed({
            id: '22222222-2222-4222-8222-222222222221',
            position: { x: 0, y: 0 },
            rotation: 90
          })
        ],
        unplacedBeds: []
      }),
      etag: '"9"'
    });

    const { result } = renderMutation();

    result.current.mutation.mutate(PLACEMENTS);

    await waitFor(() => {
      expect(result.current.adjustedBedIds).toEqual([
        '22222222-2222-4222-8222-222222222221'
      ]);
    });
  });

  it('marks a concurrency conflict and reloads on 412', async () => {
    mockedUpdate.mockRejectedValueOnce(new PreconditionFailedError());
    mockedGetLayout.mockResolvedValueOnce({
      layout: buildLocationLayout(),
      etag: '"9"'
    });

    const { result } = renderMutation();

    result.current.mutation.mutate(PLACEMENTS);

    await waitFor(() => {
      expect(result.current.conflict).toBe('concurrency');
    });
    expect(mockedGetLayout).toHaveBeenCalledWith('loc-1');
  });

  it('marks an overlap conflict on 409 without reloading', async () => {
    mockedUpdate.mockRejectedValueOnce(new ApiError('Conflict', 409));

    const { result } = renderMutation();

    result.current.mutation.mutate(PLACEMENTS);

    await waitFor(() => {
      expect(result.current.conflict).toBe('overlap');
    });
    expect(mockedGetLayout).not.toHaveBeenCalled();
  });

  it('marks a validation conflict on 400', async () => {
    mockedUpdate.mockRejectedValueOnce(new ApiError('Bad', 400));

    const { result } = renderMutation();

    result.current.mutation.mutate(PLACEMENTS);

    await waitFor(() => {
      expect(result.current.conflict).toBe('validation');
    });
    expect(result.current.collisionBedIds).toEqual([]);
  });

  it('extracts the colliding bed ids from the error message as an overlap', async () => {
    const first = '70543b29-b51c-4126-904c-5b17c4837e5c';
    const second = 'bb5be82c-f453-4ee1-b0b8-af79e07a05ea';
    mockedUpdate.mockRejectedValueOnce(
      new ApiError(
        `Bed collision detected between beds: ${first} and ${second}`,
        400
      )
    );

    const { result } = renderMutation();

    result.current.mutation.mutate(PLACEMENTS);

    await waitFor(() => {
      expect(result.current.conflict).toBe('overlap');
    });
    expect(result.current.collisionBedIds).toEqual([first, second]);
  });
});
