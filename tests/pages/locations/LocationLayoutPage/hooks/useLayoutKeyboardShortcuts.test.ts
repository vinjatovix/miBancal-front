import { fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useLayoutKeyboardShortcuts } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutKeyboardShortcuts';

describe('useLayoutKeyboardShortcuts', () => {
  it.each([
    ['1', 'read', 'position'],
    ['2', 'position', 'read'],
    ['3', 'plants', 'read']
  ] as const)(
    'switches to %s mode on key %s',
    (key, expectedMode, currentMode) => {
      const setMode = vi.fn();
      renderHook(() =>
        useLayoutKeyboardShortcuts({
          mode: currentMode,
          setMode
        })
      );

      fireEvent.keyDown(window, { key });

      expect(setMode).toHaveBeenCalledWith(expectedMode);
    }
  );

  it.each([
    ['v', 'select'],
    ['p', 'plant-single'],
    ['b', 'brush']
  ] as const)(
    'switches tool to %s on key %s when in plants mode',
    (key, expectedTool) => {
      const setTool = vi.fn();
      renderHook(() =>
        useLayoutKeyboardShortcuts({
          mode: 'plants',
          setMode: vi.fn(),
          setTool
        })
      );

      fireEvent.keyDown(window, { key });

      expect(setTool).toHaveBeenCalledWith(expectedTool);
    }
  );

  it('invokes onDeleteSelected on Delete key', () => {
    const onDeleteSelected = vi.fn();
    renderHook(() =>
      useLayoutKeyboardShortcuts({
        mode: 'plants',
        setMode: vi.fn(),
        onDeleteSelected
      })
    );

    fireEvent.keyDown(window, { key: 'Delete' });

    expect(onDeleteSelected).toHaveBeenCalledTimes(1);
  });

  it('invokes onDuplicateSelected on Ctrl+D shortcut', () => {
    const onDuplicateSelected = vi.fn();
    renderHook(() =>
      useLayoutKeyboardShortcuts({
        mode: 'plants',
        setMode: vi.fn(),
        onDuplicateSelected
      })
    );

    fireEvent.keyDown(window, { key: 'd', ctrlKey: true });

    expect(onDuplicateSelected).toHaveBeenCalledTimes(1);
  });

  it('invokes onClearSelection on Escape key', () => {
    const onClearSelection = vi.fn();
    renderHook(() =>
      useLayoutKeyboardShortcuts({
        mode: 'plants',
        setMode: vi.fn(),
        onClearSelection
      })
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });

  it('invokes onFitToView on key F', () => {
    const onFitToView = vi.fn();
    renderHook(() =>
      useLayoutKeyboardShortcuts({
        mode: 'read',
        setMode: vi.fn(),
        onFitToView
      })
    );

    fireEvent.keyDown(window, { key: 'f' });

    expect(onFitToView).toHaveBeenCalledTimes(1);
  });

  it('invokes onSave on Ctrl+S when canSave is true', () => {
    const onSave = vi.fn();
    renderHook(() =>
      useLayoutKeyboardShortcuts({
        mode: 'position',
        setMode: vi.fn(),
        onSave,
        canSave: true
      })
    );

    fireEvent.keyDown(window, { key: 's', ctrlKey: true });

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('invokes onRotateSelected on key R when in position mode', () => {
    const onRotateSelected = vi.fn();
    renderHook(() =>
      useLayoutKeyboardShortcuts({
        mode: 'position',
        setMode: vi.fn(),
        onRotateSelected
      })
    );

    fireEvent.keyDown(window, { key: 'r' });

    expect(onRotateSelected).toHaveBeenCalledTimes(1);
  });

  it('invokes onUnplaceSelected on key U when in position mode', () => {
    const onUnplaceSelected = vi.fn();
    renderHook(() =>
      useLayoutKeyboardShortcuts({
        mode: 'position',
        setMode: vi.fn(),
        onUnplaceSelected
      })
    );

    fireEvent.keyDown(window, { key: 'u' });

    expect(onUnplaceSelected).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onRotateSelected or onUnplaceSelected when not in position mode', () => {
    const onRotateSelected = vi.fn();
    const onUnplaceSelected = vi.fn();
    renderHook(() =>
      useLayoutKeyboardShortcuts({
        mode: 'read',
        setMode: vi.fn(),
        onRotateSelected,
        onUnplaceSelected
      })
    );

    fireEvent.keyDown(window, { key: 'r' });
    fireEvent.keyDown(window, { key: 'u' });

    expect(onRotateSelected).not.toHaveBeenCalled();
    expect(onUnplaceSelected).not.toHaveBeenCalled();
  });

  it('ignores shortcuts when event target is an input element', () => {
    const setMode = vi.fn();
    renderHook(() =>
      useLayoutKeyboardShortcuts({
        mode: 'read',
        setMode
      })
    );

    const input = document.createElement('input');
    document.body.appendChild(input);

    fireEvent.keyDown(input, { key: '2' });

    expect(setMode).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});
