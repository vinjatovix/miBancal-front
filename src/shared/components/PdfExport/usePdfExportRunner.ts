import { useCallback, useEffect, useRef, useState } from 'react';

import {
  reportUnexpectedError,
  toUnexpectedErrorReport
} from '../../observability/reportUnexpectedError';
import { useToastActions } from '../../toast/useToast';

const SPINNER_DELAY_MS = 400;

export interface PdfExportRunOptions {
  readonly successMessage: string;
  readonly errorMessage: string;
  readonly errorSection: string;
  readonly onSuccess?: () => void;
}

export interface UsePdfExportRunnerResult {
  readonly isBusy: boolean;
  readonly showSpinner: boolean;
  start(): void;
  stop(): void;
  run(
    task: () => Promise<unknown>,
    options: PdfExportRunOptions
  ): Promise<void>;
}

export function usePdfExportRunner(): UsePdfExportRunnerResult {
  const { showSuccessToast, showErrorToast } = useToastActions();
  const [isBusy, setIsBusy] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const busyRef = useRef(false);
  const spinnerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (spinnerTimer.current) {
        clearTimeout(spinnerTimer.current);
        spinnerTimer.current = null;
      }
    };
  }, []);

  const start = useCallback(() => {
    busyRef.current = true;
    setIsBusy(true);
    spinnerTimer.current = setTimeout(() => {
      if (isMountedRef.current) {
        setShowSpinner(true);
      }
    }, SPINNER_DELAY_MS);
  }, []);

  const stop = useCallback(() => {
    busyRef.current = false;
    if (spinnerTimer.current) {
      clearTimeout(spinnerTimer.current);
      spinnerTimer.current = null;
    }
    if (isMountedRef.current) {
      setShowSpinner(false);
      setIsBusy(false);
    }
  }, []);

  const run = useCallback(
    async (task: () => Promise<unknown>, options: PdfExportRunOptions) => {
      if (!busyRef.current) {
        start();
      }
      try {
        await task();
        if (isMountedRef.current) {
          showSuccessToast(options.successMessage);
          options.onSuccess?.();
        }
      } catch (error) {
        reportUnexpectedError(
          toUnexpectedErrorReport(error, {
            kind: 'unknown',
            section: options.errorSection
          }),
          error
        );
        if (isMountedRef.current) {
          showErrorToast(undefined, options.errorMessage);
        }
      } finally {
        stop();
      }
    },
    [showErrorToast, showSuccessToast, start, stop]
  );

  return { isBusy, showSpinner, start, stop, run };
}
