import { useEffect, useRef, useCallback, useMemo } from 'react';

export function useDebouncedCallback<T>(
  callback: (value: T) => void,
  delay = 400
) {
  const timeoutRef = useRef<number | null>(null);

  const debounced = useCallback(
    (value: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = globalThis.setTimeout(() => {
        callback(value);
      }, delay);
    },
    [callback, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  return useMemo(
    () => ({
      call: debounced,
      cancel
    }),
    [debounced, cancel]
  );
}
