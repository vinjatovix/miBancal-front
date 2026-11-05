import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import useDrawer from '../../../src/shared/hooks/useDrawer';

describe('useDrawer', () => {
  it('should start closed by default', () => {
    const { result } = renderHook(() => useDrawer());

    expect(result.current.isOpen).toBe(false);
  });

  it('should start open if initialOpen is true', () => {
    const { result } = renderHook(() => useDrawer(true));

    expect(result.current.isOpen).toBe(true);
  });

  it('should open drawer', () => {
    const { result } = renderHook(() => useDrawer());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should close drawer', () => {
    const { result } = renderHook(() => useDrawer(true));

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle drawer state', () => {
    const { result } = renderHook(() => useDrawer());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle correctly from previous state multiple times', () => {
    const { result } = renderHook(() => useDrawer());

    act(() => {
      result.current.open();
      result.current.toggle(); // false
      result.current.toggle(); // true
    });

    expect(result.current.isOpen).toBe(true);
  });
});
