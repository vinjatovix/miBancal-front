import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  toastStore,
  MAX_VISIBLE_TOASTS,
  type ToastInput
} from '../../../src/shared/toast/toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    toastStore.clearToasts();
  });

  it('starts with an empty queue of toasts', () => {
    const snapshot = toastStore.getSnapshot();

    expect(snapshot).toEqual([]);
  });

  it('enqueues a toast with generated UUID and defaults to error variant with permanent duration', () => {
    const id = toastStore.addToast({
      message: 'Error de prueba'
    });

    const snapshot = toastStore.getSnapshot();

    expect(id).toBeDefined();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]).toMatchObject({
      id,
      message: 'Error de prueba',
      variant: 'error',
      duration: 0
    });
    expect(typeof snapshot[0].createdAt).toBe('number');
  });

  it('preserves provided id, title, and custom variant when specified', () => {
    const customToast: ToastInput = {
      id: 'custom-id-123',
      title: 'Aviso',
      message: 'Operación completada',
      variant: 'success',
      duration: 3000
    };

    const id = toastStore.addToast(customToast);

    const snapshot = toastStore.getSnapshot();

    expect(id).toBe('custom-id-123');
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]).toMatchObject({
      id: 'custom-id-123',
      title: 'Aviso',
      message: 'Operación completada',
      variant: 'success',
      duration: 3000
    });
  });

  it('maintains up to MAX_VISIBLE_TOASTS without displacement', () => {
    toastStore.addToast({ message: 'Error 1' });
    toastStore.addToast({ message: 'Error 2' });
    toastStore.addToast({ message: 'Error 3' });

    const snapshot = toastStore.getSnapshot();

    expect(snapshot).toHaveLength(MAX_VISIBLE_TOASTS);
    expect(snapshot.map((item) => item.message)).toEqual([
      'Error 1',
      'Error 2',
      'Error 3'
    ]);
  });

  it('displaces the oldest toast when adding beyond MAX_VISIBLE_TOASTS via FIFO queue', () => {
    toastStore.addToast({ message: 'Error 1' });
    toastStore.addToast({ message: 'Error 2' });
    toastStore.addToast({ message: 'Error 3' });
    toastStore.addToast({ message: 'Error 4' });

    const snapshot = toastStore.getSnapshot();

    expect(snapshot).toHaveLength(3);
    expect(snapshot.map((item) => item.message)).toEqual([
      'Error 2',
      'Error 3',
      'Error 4'
    ]);
  });

  it('removes a specific toast by id when dismissToast is called', () => {
    const id1 = toastStore.addToast({ message: 'Error 1' });
    const id2 = toastStore.addToast({ message: 'Error 2' });

    toastStore.dismissToast(id1);

    const snapshot = toastStore.getSnapshot();

    expect(snapshot).toHaveLength(1);
    expect(snapshot[0].id).toBe(id2);
  });

  it('does nothing when dismissToast is called with a non-existent id', () => {
    toastStore.addToast({ message: 'Error 1' });

    toastStore.dismissToast('non-existent-id');

    const snapshot = toastStore.getSnapshot();

    expect(snapshot).toHaveLength(1);
  });

  it('clears all active toasts when clearToasts is called', () => {
    toastStore.addToast({ message: 'Error 1' });
    toastStore.addToast({ message: 'Error 2' });

    toastStore.clearToasts();

    const snapshot = toastStore.getSnapshot();

    expect(snapshot).toEqual([]);
  });

  it('notifies registered subscribers whenever the store state changes', () => {
    const listener = vi.fn();
    const unsubscribe = toastStore.subscribe(listener);

    toastStore.addToast({ message: 'Nuevo error' });

    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('stops notifying subscribers after unsubscribe is invoked', () => {
    const listener = vi.fn();
    const unsubscribe = toastStore.subscribe(listener);

    unsubscribe();
    toastStore.addToast({ message: 'Nuevo error' });

    expect(listener).not.toHaveBeenCalled();
  });

  it.each([
    { variant: 'error' as const, expectedDuration: 0 },
    { variant: 'warning' as const, expectedDuration: 0 },
    { variant: 'info' as const, expectedDuration: 0 }
  ])(
    'defaults duration to 0 for $variant when no duration is specified',
    ({ variant, expectedDuration }) => {
      toastStore.addToast({ message: 'Mensaje', variant });

      const snapshot = toastStore.getSnapshot();

      expect(snapshot[0].duration).toBe(expectedDuration);
    }
  );
});
