import { resolveErrorToastPayload } from './resolveErrorToastPayload';
import { toastStore } from './toastStore';

export function showErrorToast(
  error: unknown,
  fallbackMessage?: string
): string {
  const payload = resolveErrorToastPayload(error, fallbackMessage);
  return toastStore.addToast({
    title: payload.title,
    message: payload.message,
    variant: 'error',
    duration: 0
  });
}
