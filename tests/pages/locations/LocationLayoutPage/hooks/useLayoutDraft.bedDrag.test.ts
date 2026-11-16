import { createElement, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLayoutEditor } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutEditor';
import {
  getLocationLayout,
  updateBedsLayout
} from '../../../../../src/services/locations.service';
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
const mockedGetLocationLayout = vi.mocked(getLocationLayout);

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
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(ToastProvider, null, children)
    );
  return renderHook(() => useLayoutEditor('loc-1', etag, layout), { wrapper });
}

function positionOf(
  result: ReturnType<typeof renderEditor>['result'],
  id: string
) {
  return (
    result.current.placedBeds.find((bed) => bed.id === id)?.position ?? null
  );
}

describe('useLayoutEditor bed drag history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('records a mouse bed drag as an undoable move and reverts it', () => {
    const { result } = renderEditor();
    act(() => result.current.toggleGridSnap());

    act(() => result.current.beginBedDrag(PLACED_ID, 'mouse'));
    act(() => result.current.moveBedDrag(10, 10));
    act(() => result.current.endBedDrag());

    expect(result.current.canUndo).toBe(true);
    expect(positionOf(result, PLACED_ID)).toEqual({ x: 110, y: 110 });

    act(() => result.current.undo());
    expect(positionOf(result, PLACED_ID)).toEqual({ x: 100, y: 100 });
    expect(result.current.canUndo).toBe(false);
  });

  it('does not record anything when the mouse drag does not move the bed', () => {
    const { result } = renderEditor();
    act(() => result.current.beginBedDrag(PLACED_ID, 'mouse'));
    act(() => result.current.endBedDrag());
    expect(result.current.canUndo).toBe(false);
  });

  it('records placing a bed and reverts it by unplacing', () => {
    const { result } = renderEditor();
    act(() => result.current.placeBed(UNPLACED_ID));
    expect(
      result.current.placedBeds.some((bed) => bed.id === UNPLACED_ID)
    ).toBe(true);
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.undo());
    expect(
      result.current.placedBeds.some((bed) => bed.id === UNPLACED_ID)
    ).toBe(false);
    expect(result.current.canUndo).toBe(false);
  });

  it('clears the undo stack after a successful save', async () => {
    mockedUpdateBedsLayout.mockResolvedValueOnce({ etag: '"2"' });
    mockedGetLocationLayout.mockResolvedValueOnce({ layout, etag: '"2"' });
    const { result } = renderEditor();
    act(() => result.current.beginBedDrag(PLACED_ID, 'mouse'));
    act(() => result.current.moveBedDrag(10, 10));
    act(() => result.current.endBedDrag());
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.save());
    await waitFor(() => expect(result.current.canUndo).toBe(false));
  });

  it('resets the undo stack when discarding', () => {
    const { result } = renderEditor();
    act(() => result.current.beginBedDrag(PLACED_ID, 'mouse'));
    act(() => result.current.moveBedDrag(5, 5));
    act(() => result.current.endBedDrag());
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.discard());
    expect(result.current.canUndo).toBe(false);
  });
});

describe('useLayoutEditor bed drag long-press', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('does not arm a drag on a short touch, leaving the bed unmoved', () => {
    const { result } = renderEditor();
    act(() => result.current.toggleGridSnap());

    act(() => result.current.beginBedDrag(PLACED_ID, 'touch'));
    expect(result.current.draggingBedId).toBeNull();

    act(() => result.current.moveBedDrag(10, 10));
    expect(result.current.draggingBedId).toBeNull();
    expect(positionOf(result, PLACED_ID)).toEqual({ x: 100, y: 100 });

    act(() => result.current.endBedDrag());
    expect(result.current.canUndo).toBe(false);
    expect(positionOf(result, PLACED_ID)).toEqual({ x: 100, y: 100 });
  });

  it('moves and records a bed on touch only after the long-press elapses', () => {
    const { result } = renderEditor();
    act(() => result.current.toggleGridSnap());

    act(() => result.current.beginBedDrag(PLACED_ID, 'touch'));
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.draggingBedId).toBe(PLACED_ID);

    act(() => result.current.moveBedDrag(10, 10));
    act(() => result.current.endBedDrag());

    expect(result.current.canUndo).toBe(true);
    expect(positionOf(result, PLACED_ID)).toEqual({ x: 110, y: 110 });
  });
});
