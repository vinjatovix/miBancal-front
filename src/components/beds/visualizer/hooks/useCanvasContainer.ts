import { useCallback, useEffect, useRef, useState } from 'react';

export function useCanvasContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState<{
    readonly width: number;
    readonly height: number;
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = (width: number, height: number) => {
      const roundedWidth = Math.round(width);
      const roundedHeight = Math.round(height);
      if (roundedWidth > 0 && roundedHeight > 0) {
        setContainerDimensions((prev) => {
          if (
            prev &&
            prev.width === roundedWidth &&
            prev.height === roundedHeight
          ) {
            return prev;
          }
          return { width: roundedWidth, height: roundedHeight };
        });
      }
    };

    const rect = container.getBoundingClientRect();
    updateDimensions(rect.width, rect.height);

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      updateDimensions(entry.contentRect.width, entry.contentRect.height);
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void containerRef.current?.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  }, []);

  return {
    containerRef,
    containerDimensions,
    isFullscreen,
    toggleFullscreen
  };
}
