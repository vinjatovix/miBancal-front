import { useState, useEffect } from 'react';

const mediaQuery = '(pointer: fine)';

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function'
    ) {
      return window.matchMedia(mediaQuery).matches;
    }
    return true;
  });

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }

    const media = window.matchMedia(mediaQuery);
    const listener = () => {
      setIsDesktop(media.matches);
    };

    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, []);

  return isDesktop;
}
