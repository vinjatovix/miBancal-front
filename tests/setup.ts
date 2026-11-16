import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

import '../src/i18n/messages/features';

if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn();
  window.scrollY = 0;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(pointer: fine)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });

  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Array(4) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => []),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn()
    });
  }

  beforeEach(() => {
    window.scrollY = 0;
    vi.mocked(window.scrollTo).mockClear();
    localStorage.clear();
    sessionStorage.clear();
  });
}

vi.mock('leaflet', () => {
  class MockEmitter {
    protected handlers: Record<string, ((e: unknown) => void)[]> = {};

    on(event: string, handler: (e: unknown) => void) {
      this.handlers[event] = this.handlers[event] || [];
      this.handlers[event].push(handler);
      return this;
    }

    _trigger(event: string, data?: unknown) {
      for (const h of this.handlers[event] ?? []) {
        h(data);
      }
    }
  }

  class MockMap extends MockEmitter {
    zoom = 6;
    center: [number, number] = [40.4168, -3.7038];

    setView(center: [number, number], zoom?: number) {
      this.center = center;
      if (zoom !== undefined) this.zoom = zoom;
      return this;
    }

    getZoom() {
      return this.zoom;
    }

    invalidateSize = vi.fn();
    remove = vi.fn();
  }

  class MockMarker extends MockEmitter {
    latlng: { lat: number; lng: number };

    constructor(latlng: [number, number]) {
      super();
      this.latlng = { lat: latlng[0], lng: latlng[1] };
    }

    addTo() {
      return this;
    }

    getLatLng() {
      return this.latlng;
    }

    setLatLng(latlng: [number, number]) {
      this.latlng = { lat: latlng[0], lng: latlng[1] };
      return this;
    }

    remove = vi.fn();
  }

  class MockTileLayer {
    addTo() {
      return this;
    }
  }

  return {
    default: {
      map: vi.fn(
        (
          _element: HTMLElement,
          options?: { center?: [number, number]; zoom?: number }
        ) => {
          const m = new MockMap();
          if (options?.center) m.center = options.center;
          if (options?.zoom) m.zoom = options.zoom;
          return m;
        }
      ),
      marker: vi.fn((latlng: [number, number]) => new MockMarker(latlng)),
      tileLayer: vi.fn(() => new MockTileLayer()),
      divIcon: vi.fn(() => ({}))
    },
    divIcon: vi.fn(() => ({}))
  };
});
