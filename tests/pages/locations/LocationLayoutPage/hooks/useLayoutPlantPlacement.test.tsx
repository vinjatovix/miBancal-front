import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLayoutPlantPlacement } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutPlantPlacement';
import type { ResolvedBed } from '../../../../../src/components/beds/layout/utils/layoutTypes';
import type { CropPlacementItem } from '../../../../../src/types/PlantInstance/plantPlacementTypes';
import { ToastProvider } from '../../../../../src/shared/toast/ToastContext';
import { buildCropPlacementItem } from '../../../../fixtures/plantInstances/buildPlantInstance';
import { buildPlantListItem } from '../../../../fixtures/plants/buildPlantListItem';
import { createTestQueryClient } from '../../../../test-utils/createTestQueryClient';

vi.mock('../../../../../src/shared/auth/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } })
}));

const bed: ResolvedBed = {
  id: 'bed-a',
  name: 'Bancal A',
  width: 100,
  height: 100,
  position: { x: 0, y: 0 },
  rotation: 0
};

const crop = buildCropPlacementItem({
  id: 'crop-a1',
  bedId: 'bed-a',
  position: { x: 50, y: 50 },
  vitalRadius: 10
});

const plant = buildPlantListItem({ id: 'plant-1' });

function renderPlantPlacement() {
  const cropsByBed = new Map<string, readonly CropPlacementItem[]>([
    ['bed-a', [crop]]
  ]);
  const queryClient = createTestQueryClient();
  return renderHook(
    () =>
      useLayoutPlantPlacement({
        beds: [bed],
        cropsByBed,
        activeBedId: 'bed-a'
      }),
    {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      )
    }
  );
}

describe('useLayoutPlantPlacement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes placement defaults', () => {
    const { result } = renderPlantPlacement();
    expect(result.current.toolMode).toBe('brush');
    expect(result.current.activePlantId).toBeNull();
    expect(result.current.selectedCropId).toBeNull();
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.effectiveCropsByBed.get('bed-a')).toHaveLength(1);
  });

  it('switches the tool mode', () => {
    const { result } = renderPlantPlacement();
    act(() => result.current.setToolMode('select'));
    expect(result.current.toolMode).toBe('select');
    act(() => result.current.setToolMode('brush'));
    expect(result.current.toolMode).toBe('brush');
  });

  it('selects a palette plant and tap-places it', () => {
    const { result } = renderPlantPlacement();
    act(() => result.current.selectPalettePlant(plant));
    expect(result.current.activePlantId).toBe('plant-1');
    act(() => result.current.tapPlace({ x: 20, y: 20 }));
    expect(result.current.hasChanges).toBe(true);
    expect(result.current.pendingCount).toBeGreaterThan(0);
  });

  it('selects, toggles, and clears crop selection', () => {
    const { result } = renderPlantPlacement();
    act(() => result.current.setToolMode('select'));
    act(() => result.current.selectCrop('crop-a1'));
    expect(result.current.selectedCropId).toBe('crop-a1');
    expect(result.current.selectedCrop?.id).toBe('crop-a1');
    act(() => result.current.toggleCropSelection('crop-a1'));
    expect(result.current.selectedCropCount).toBe(0);
    act(() => result.current.selectCrop('crop-a1'));
    act(() => result.current.clearSelection());
    expect(result.current.selectedCropId).toBeNull();
  });

  it('drives the palette drag-and-drop wrappers', () => {
    const { result } = renderPlantPlacement();
    act(() => result.current.dragPalettePlant(plant));
    act(() => result.current.updateDropPreview({ x: 20, y: 20 }));
    expect(result.current.preview).toMatchObject({ bedId: 'bed-a' });
    act(() => result.current.clearPreview());
    expect(result.current.preview).toBeNull();
    act(() => result.current.dropPlant({ x: 20, y: 20 }, 'plant-1'));
    expect(result.current.hasChanges).toBe(true);
    act(() => result.current.cancelPalettePlant());
    expect(result.current.activePlantId).toBeNull();
  });

  it('resets all placement interaction state', () => {
    const { result } = renderPlantPlacement();
    act(() => result.current.selectPalettePlant(plant));
    act(() => result.current.reset());
    expect(result.current.activePlantId).toBeNull();
    expect(result.current.selectedCropId).toBeNull();
  });

  it('discards staged changes', () => {
    const { result } = renderPlantPlacement();
    act(() => result.current.selectPalettePlant(plant));
    act(() => result.current.tapPlace({ x: 20, y: 20 }));
    expect(result.current.hasChanges).toBe(true);
    act(() => result.current.discardChanges());
    expect(result.current.hasChanges).toBe(false);
  });
});
