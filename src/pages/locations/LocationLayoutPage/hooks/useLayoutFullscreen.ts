import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject
} from 'react';

export interface CanvasDisplayState {
  readonly isFullscreen: boolean;
  readonly supportsNativeFullscreen: boolean;
  readonly enterFullscreen: () => void;
  readonly exitFullscreen: () => void;
  readonly toggleFullscreen: () => void;
}

function detectNativeFullscreenSupport(): boolean {
  if (typeof document === 'undefined') return false;
  return typeof document.documentElement.requestFullscreen === 'function';
}

export function useLayoutFullscreen(
  targetRef: RefObject<HTMLElement | null>
): CanvasDisplayState {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const supportsNativeFullscreen = detectNativeFullscreenSupport();
  const isFullscreenRef = useRef(isFullscreen);
  useEffect(() => {
    isFullscreenRef.current = isFullscreen;
  });

  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
    const element = targetRef.current;
    if (
      supportsNativeFullscreen &&
      element &&
      typeof element.requestFullscreen === 'function' &&
      document.fullscreenElement === null
    ) {
      void element.requestFullscreen().catch(() => undefined);
    }
  }, [supportsNativeFullscreen, targetRef]);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    if (
      typeof document !== 'undefined' &&
      document.fullscreenElement !== null &&
      typeof document.exitFullscreen === 'function'
    ) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreenRef.current) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, exitFullscreen]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleFullscreenChange = (): void => {
      if (document.fullscreenElement === null && isFullscreenRef.current) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return {
    isFullscreen,
    supportsNativeFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
}
