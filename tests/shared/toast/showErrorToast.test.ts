import { beforeEach, describe, expect, it } from 'vitest';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { showErrorToast } from '../../../src/shared/toast/showErrorToast';
import { toastStore } from '../../../src/shared/toast/toastStore';

describe('showErrorToast', () => {
  beforeEach(() => {
    toastStore.clearToasts();
  });

  it('enqueues resolved error into toastStore and returns toast id', () => {
    const error = new ApiError('Error de red o servidor', 500);

    const toastId = showErrorToast(error);

    const toasts = toastStore.getSnapshot();
    expect(toastId).toBeDefined();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({
      id: toastId,
      message: 'Error de red o servidor',
      variant: 'error',
      duration: 0
    });
  });

  it('passes fallbackMessage when unknown error is supplied', () => {
    const toastId = showErrorToast(null, 'Mensaje de respaldo');

    const toasts = toastStore.getSnapshot();
    expect(toastId).toBeDefined();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Mensaje de respaldo');
  });
});
