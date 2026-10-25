import { useSyncExternalStore } from 'react';
import { showErrorToast } from './showErrorToast';
import { toastStore, type ToastInput, type ToastItem } from './toastStore';

export interface ToastActions {
  readonly showToast: (input: ToastInput) => string;
  readonly showErrorToast: (error: unknown, fallbackMessage?: string) => string;
  readonly dismissToast: (id: string) => void;
  readonly dismissAll: () => void;
}

export interface UseToastReturn extends ToastActions {
  readonly toasts: readonly ToastItem[];
}

export const toastActions: ToastActions = {
  showToast: toastStore.addToast,
  showErrorToast,
  dismissToast: toastStore.dismissToast,
  dismissAll: toastStore.clearToasts
};

export function useToastActions(): ToastActions {
  return toastActions;
}

export function useToast(): UseToastReturn {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot
  );

  return {
    toasts,
    ...toastActions
  };
}
