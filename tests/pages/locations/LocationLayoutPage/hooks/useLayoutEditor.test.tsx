import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLayoutEditor } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutEditor';
import { updateBedsLayout } from '../../../../../src/services/locations.service';
import { ToastProvider } from '../../../../../src/shared/toast/ToastContext';
import {
  buildLocationLayout,
  buildPlacedBed,
  buildUnplacedBed
} from '../../../../fixtures/locations/buildLocationLayout';
import { createTestQueryClient } from '../../../../test-utils/createTestQueryClient';

vi.mock('../../../../../src/services/locations.service', () => ({
  updateBedsLayout: vi.fn(),
  getLocationLayout: vi.fn()
}));

const mockedUpdateBedsLayout = vi.mocked(updateBedsLayout);

const PLACED_ID = '22222222-2222-4222-8222-222222222221';
const UNPLACED_ID = '33333333-3333-4333-8333-333333333331';

const layout = buildLocationLayout({
  placedBeds: [
    buildPlacedBed({ id: PLACED_ID, position: { x: 100, y: 100 }, rotation: 0 })
  ],
  unplacedBeds: [buildUnplacedBed({ id: UNPLACED_ID })]
});

function renderEditor(etag = '"1"') {
  const queryClient = createTestQueryClient();
  return renderHook(() => useLayoutEditor('loc-1', etag, layout), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    )
  });
}

describe('useLayoutEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in read mode and resolves placed and unplaced beds', () => {
    const { result } = renderEditor();
    expect(result.current.mode).toBe('read');
    expect(result.current.placedBeds).toHaveLength(1);
    expect(result.current.unplacedBeds).toHaveLength(1);
    expect(result.current.viewBox).toMatch(/\d/);
    expect(result.current.dirty).toBe(false);
  });

  it('toggles between read and position modes', () => {
    const { result } = renderEditor();
    act(() => result.current.toggleMode());
    expect(result.current.mode).toBe('position');
    act(() => result.current.toggleMode());
    expect(result.current.mode).toBe('read');
  });

  it('enters and leaves planting mode', () => {
    const { result } = renderEditor();
    act(() => result.current.startPlanting(PLACED_ID));
    expect(result.current.mode).toBe('plants');
    expect(result.current.selectedId).toBe(PLACED_ID);
    act(() => result.current.stopPlanting());
    expect(result.current.mode).toBe('read');
  });

  it('toggles grid and neighbor snapping', () => {
    const { result } = renderEditor();
    act(() => result.current.toggleGridSnap());
    expect(result.current.gridSnapEnabled).toBe(false);
    act(() => result.current.toggleNeighborSnap());
    expect(result.current.neighborSnapEnabled).toBe(false);
  });

  it('selects and deselects a bed', () => {
    const { result } = renderEditor();
    act(() => result.current.selectBed(PLACED_ID));
    expect(result.current.selectedId).toBe(PLACED_ID);
    expect(result.current.selectedRotation).toBe(0);
    act(() => result.current.deselectBed());
    expect(result.current.selectedId).toBeNull();
  });

  it('moves and rotates a placed bed, marking the draft dirty', () => {
    const { result } = renderEditor();
    act(() => result.current.moveBed(PLACED_ID, 10, 10));
    expect(result.current.dirty).toBe(true);
    act(() => result.current.rotateBedBy(PLACED_ID, 45));
    act(() => result.current.selectBed(PLACED_ID));
    act(() => result.current.setSelectedRotation(90));
    expect(result.current.selectedRotation).toBe(90);
  });

  it('ignores moves and rotations for unknown beds', () => {
    const { result } = renderEditor();
    act(() => result.current.moveBed('missing', 10, 10));
    act(() => result.current.rotateBedBy('missing', 45));
    expect(result.current.dirty).toBe(false);
  });

  it('places and unplaces beds', () => {
    const { result } = renderEditor();
    act(() => result.current.placeBed(UNPLACED_ID));
    expect(result.current.selectedId).toBe(UNPLACED_ID);
    expect(
      result.current.placedBeds.some((bed) => bed.id === UNPLACED_ID)
    ).toBe(true);
    act(() => result.current.unplaceSelected());
    expect(result.current.selectedId).toBeNull();
  });

  it('renames a bed inline', () => {
    const { result } = renderEditor();
    act(() => result.current.renameBedInline(PLACED_ID, 'Nuevo nombre'));
    expect(
      result.current.placedBeds.find((bed) => bed.id === PLACED_ID)?.name
    ).toBe('Nuevo nombre');
  });

  it('prompts a discard when toggling out of a dirty position mode', () => {
    const { result } = renderEditor();
    act(() => result.current.toggleMode());
    act(() => result.current.moveBed(PLACED_ID, 5, 5));
    act(() => result.current.toggleMode());
    expect(result.current.discardOpen).toBe(true);
    act(() => result.current.cancelDiscard());
    expect(result.current.discardOpen).toBe(false);
  });

  it('confirms a discard, clearing changes and selection', () => {
    const { result } = renderEditor();
    act(() => result.current.selectBed(PLACED_ID));
    act(() => result.current.moveBed(PLACED_ID, 5, 5));
    act(() => result.current.promptDiscard());
    act(() => result.current.confirmDiscard());
    expect(result.current.discardOpen).toBe(false);
    expect(result.current.dirty).toBe(false);
    expect(result.current.selectedId).toBeNull();
  });

  it('discards pending changes without closing a dialog', () => {
    const { result } = renderEditor();
    act(() => result.current.moveBed(PLACED_ID, 5, 5));
    act(() => result.current.discard());
    expect(result.current.dirty).toBe(false);
  });

  it('does not save when there are no pending placements', () => {
    const { result } = renderEditor();
    act(() => result.current.save());
    expect(mockedUpdateBedsLayout).not.toHaveBeenCalled();
  });

  it('does not save when the etag is empty', () => {
    const { result } = renderEditor('');
    act(() => result.current.moveBed(PLACED_ID, 5, 5));
    act(() => result.current.save());
    expect(mockedUpdateBedsLayout).not.toHaveBeenCalled();
  });

  it('saves pending placements through the mutation', async () => {
    mockedUpdateBedsLayout.mockResolvedValueOnce({ etag: '"2"' });
    const { result } = renderEditor();
    act(() => result.current.moveBed(PLACED_ID, 5, 5));
    act(() => result.current.save());
    await waitFor(() => {
      expect(mockedUpdateBedsLayout).toHaveBeenCalledTimes(1);
    });
  });
});
