import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useLayoutDraft } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutDraft';
import type { DraftPlacement } from '../../../../../src/components/beds/layout/utils/layoutTypes';

const SERVER: Record<string, DraftPlacement> = {
  a: { position: { x: 10, y: 10 }, rotation: 30 },
  b: { position: null, rotation: 0 }
};

function getServerPlacement(id: string): DraftPlacement {
  return SERVER[id] ?? { position: null, rotation: 0 };
}

function renderDraft() {
  return renderHook(() => useLayoutDraft(getServerPlacement));
}

describe('useLayoutDraft', () => {
  it('starts clean', () => {
    const { result } = renderDraft();

    expect(result.current.dirty).toBe(false);
    expect(result.current.placements.size).toBe(0);
  });

  it('moving a bed updates its position and marks dirty keeping rotation', () => {
    const { result } = renderDraft();

    act(() => {
      result.current.moveBed('a', { x: 55, y: 60 });
    });

    expect(result.current.dirty).toBe(true);
    expect(result.current.placements.get('a')).toEqual({
      position: { x: 55, y: 60 },
      rotation: 30
    });
  });

  it('rotating a bed normalizes the angle to 0-359', () => {
    const { result } = renderDraft();

    act(() => {
      result.current.rotateBed('a', 365);
    });

    expect(result.current.placements.get('a')?.rotation).toBe(5);
  });

  it('unplacing a bed sets its position to null', () => {
    const { result } = renderDraft();

    act(() => {
      result.current.unplaceBed('a');
    });

    expect(result.current.placements.get('a')).toEqual({
      position: null,
      rotation: 30
    });
  });

  it('discarding empties the draft', () => {
    const { result } = renderDraft();

    act(() => {
      result.current.moveBed('a', { x: 1, y: 1 });
    });
    act(() => {
      result.current.discard();
    });

    expect(result.current.dirty).toBe(false);
    expect(result.current.placements.size).toBe(0);
  });

  it('marking saved empties the draft', () => {
    const { result } = renderDraft();

    act(() => {
      result.current.moveBed('a', { x: 1, y: 1 });
    });
    act(() => {
      result.current.markSaved();
    });

    expect(result.current.dirty).toBe(false);
    expect(result.current.placements.size).toBe(0);
  });
});
