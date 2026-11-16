import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePdfExportRunner } from '../../../../src/shared/components/PdfExport/usePdfExportRunner';
import { toastStore } from '../../../../src/shared/toast/toastStore';

const OPTS = {
  successMessage: 'export-success',
  errorMessage: 'export-error',
  errorSection: 'test-pdf-export'
};

describe('usePdfExportRunner', () => {
  beforeEach(() => {
    toastStore.clearToasts();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('defers the spinner until the delay elapses after start()', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => usePdfExportRunner());

    expect(result.current.isBusy).toBe(false);
    expect(result.current.showSpinner).toBe(false);

    act(() => result.current.start());
    expect(result.current.isBusy).toBe(true);
    expect(result.current.showSpinner).toBe(false);

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.showSpinner).toBe(true);
  });

  it('stop() cancels a spinner that has not appeared yet', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => usePdfExportRunner());

    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(399);
      result.current.stop();
    });

    expect(result.current.isBusy).toBe(false);
    expect(result.current.showSpinner).toBe(false);

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.showSpinner).toBe(false);
  });

  it('run() shows the success toast, invokes onSuccess and clears busy', async () => {
    const { result } = renderHook(() => usePdfExportRunner());
    const onSuccess = vi.fn();

    await act(async () => {
      await result.current.run(() => Promise.resolve(), { ...OPTS, onSuccess });
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    const toasts = toastStore.getSnapshot();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({
      message: 'export-success',
      variant: 'success'
    });
    expect(result.current.isBusy).toBe(false);
    expect(result.current.showSpinner).toBe(false);
  });

  it('run() reports the failure, shows the error toast and skips onSuccess', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => usePdfExportRunner());
    const onSuccess = vi.fn();

    await act(async () => {
      await result.current.run(() => Promise.reject(new Error('boom')), {
        ...OPTS,
        onSuccess
      });
    });

    expect(onSuccess).not.toHaveBeenCalled();
    const toasts = toastStore.getSnapshot();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({
      message: 'export-error',
      variant: 'error'
    });
    expect(consoleError).toHaveBeenCalled();
    expect(result.current.isBusy).toBe(false);
  });

  it('run() auto-marks busy while the task is pending', async () => {
    const { result } = renderHook(() => usePdfExportRunner());
    let release!: () => void;
    const task = () =>
      new Promise<void>((resolve) => {
        release = resolve;
      });

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.run(task, OPTS);
    });
    expect(result.current.isBusy).toBe(true);

    await act(async () => {
      release();
      await pending;
    });
    expect(result.current.isBusy).toBe(false);
    expect(toastStore.getSnapshot()).toHaveLength(1);
  });

  it('cleans up the pending spinner timer on unmount', () => {
    vi.useFakeTimers();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const { result, unmount } = renderHook(() => usePdfExportRunner());

    act(() => result.current.start());
    unmount();
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(consoleError).not.toHaveBeenCalled();
  });
});
