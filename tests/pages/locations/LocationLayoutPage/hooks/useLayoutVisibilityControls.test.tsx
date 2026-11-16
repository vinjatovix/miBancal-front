import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLayoutVisibilityControls } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutVisibilityControls';
import { updateLocation } from '../../../../../src/services/locations.service';
import { ToastProvider } from '../../../../../src/shared/toast/ToastContext';
import { buildLocation } from '../../../../fixtures/locations/buildLocation';
import { createTestQueryClient } from '../../../../test-utils/createTestQueryClient';

vi.mock('../../../../../src/services/locations.service', () => ({
  updateLocation: vi.fn()
}));

const mockedUpdateLocation = vi.mocked(updateLocation);

function renderVisibilityControls(
  overrides: Partial<Parameters<typeof useLayoutVisibilityControls>[0]> = {}
) {
  const onRotationChange = vi.fn();
  const queryClient = createTestQueryClient();
  const utils = renderHook(
    () =>
      useLayoutVisibilityControls({
        locationId: 'loc-1',
        etag: '"1"',
        locationNorthAngle: 10,
        selectedRotation: 0,
        hasSelectedBed: false,
        onRotationChange,
        ...overrides
      }),
    {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      )
    }
  );
  return { ...utils, onRotationChange };
}

describe('useLayoutVisibilityControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes default visibility flags', () => {
    const { result } = renderVisibilityControls();
    expect(result.current.showBedNames).toBe(true);
    expect(result.current.showDimensions).toBe(true);
    expect(result.current.showCardinalOrientation).toBe(true);
    expect(result.current.showPlants).toBe(true);
    expect(result.current.showGrids).toBe(true);
    expect(result.current.effectiveNorthAngle).toBe(10);
    expect(result.current.bedAzimuth).toBeNull();
  });

  it('toggles an individual grid layer', () => {
    const { result } = renderVisibilityControls();
    const initial = result.current.activeGridLayers.sfg;
    act(() => result.current.handleToggleGridLayer('sfg'));
    expect(result.current.activeGridLayers.sfg).toBe(!initial);
  });

  it('toggles all grids off and back on', () => {
    const { result } = renderVisibilityControls();
    act(() => result.current.handleToggleGrids());
    expect(result.current.showGrids).toBe(false);
    act(() => result.current.handleToggleGrids());
    expect(result.current.showGrids).toBe(true);
  });

  it('toggles name, dimension, cardinal, and plant visibility', () => {
    const { result } = renderVisibilityControls();
    act(() => result.current.handleToggleShowNames());
    act(() => result.current.handleToggleShowDimensions());
    act(() => result.current.handleToggleShowCardinalOrientation());
    act(() => result.current.handleToggleShowPlants());
    expect(result.current.showBedNames).toBe(false);
    expect(result.current.showDimensions).toBe(false);
    expect(result.current.showCardinalOrientation).toBe(false);
    expect(result.current.showPlants).toBe(false);
  });

  it('toggles visibility through the toolbar props handlers', () => {
    const { result } = renderVisibilityControls();
    act(() => result.current.toolbarProps.onToggleShowNames());
    act(() => result.current.toolbarProps.onToggleShowDimensions());
    act(() => result.current.toolbarProps.onToggleShowCardinalOrientation());
    act(() => result.current.toolbarProps.onToggleShowPlants());
    act(() => result.current.toolbarProps.onToggleGridLayer('fine'));
    expect(result.current.showBedNames).toBe(false);
    expect(result.current.showPlants).toBe(false);
  });

  it('computes a bed azimuth only when a bed is selected', () => {
    const { result } = renderVisibilityControls({
      hasSelectedBed: true,
      selectedRotation: 20
    });
    expect(result.current.bedAzimuth).not.toBeNull();
  });

  it('translates a bed azimuth change into a relative rotation', () => {
    const { result, onRotationChange } = renderVisibilityControls({
      hasSelectedBed: true
    });
    act(() => result.current.handleBedRotationChange(40));
    expect(onRotationChange).toHaveBeenCalledWith(30);
  });

  it('applies a calibrated north override', () => {
    const { result } = renderVisibilityControls();
    act(() => result.current.setCalibratedNorth(90));
    expect(result.current.effectiveNorthAngle).toBe(90);
  });

  it('does not persist north when there is no effective angle', () => {
    const { result } = renderVisibilityControls({ locationNorthAngle: null });
    act(() => result.current.handleSaveNorth());
    expect(mockedUpdateLocation).not.toHaveBeenCalled();
  });

  it('persists the effective north angle and clears the calibration', async () => {
    mockedUpdateLocation.mockResolvedValueOnce({
      location: buildLocation({ id: 'loc-1', northAngle: 90 }),
      etag: '"2"'
    });
    const { result } = renderVisibilityControls();
    act(() => result.current.setCalibratedNorth(90));
    act(() => result.current.handleSaveNorth());
    await waitFor(() => {
      expect(mockedUpdateLocation).toHaveBeenCalledWith(
        'loc-1',
        { northAngle: 90 },
        '"1"'
      );
    });
    await waitFor(() => {
      expect(result.current.effectiveNorthAngle).toBe(10);
    });
  });
});
