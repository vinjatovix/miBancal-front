import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useToast } from '../../../src/shared/toast/useToast';
import { toastStore } from '../../../src/shared/toast/toastStore';

describe('useToast', () => {
  beforeEach(() => {
    toastStore.clearToasts();
  });

  it('provides empty toasts array initially', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toEqual([]);
  });

  it('enqueues a toast and updates toasts reactive list', () => {
    const { result } = renderHook(() => useToast());

    let toastId = '';
    act(() => {
      toastId = result.current.showToast({
        message: 'Aviso de prueba',
        variant: 'info'
      });
    });

    expect(toastId).toBeDefined();
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      id: toastId,
      message: 'Aviso de prueba',
      variant: 'info'
    });
  });

  it('enqueues an error toast using showErrorToast', () => {
    const { result } = renderHook(() => useToast());

    let toastId = '';
    act(() => {
      toastId = result.current.showErrorToast(
        new Error('Fallo crítico'),
        'Fallback'
      );
    });

    expect(toastId).toBeDefined();
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      id: toastId,
      message: 'Fallo crítico',
      variant: 'error'
    });
  });

  it('removes a specific toast via dismissToast', () => {
    const { result } = renderHook(() => useToast());

    let id1 = '';
    let id2 = '';
    act(() => {
      id1 = result.current.showToast({ message: 'Primero' });
      id2 = result.current.showToast({ message: 'Segundo' });
    });

    act(() => {
      result.current.dismissToast(id1);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].id).toBe(id2);
  });

  it('removes all active toasts via dismissAll', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({ message: 'Primero' });
      result.current.showToast({ message: 'Segundo' });
    });

    act(() => {
      result.current.dismissAll();
    });

    expect(result.current.toasts).toEqual([]);
  });
});
