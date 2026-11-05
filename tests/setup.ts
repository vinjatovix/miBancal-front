import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

import '../src/i18n/messages/features';

if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn();
  window.scrollY = 0;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });

  beforeEach(() => {
    window.scrollY = 0;
    vi.mocked(window.scrollTo).mockClear();
    localStorage.clear();
    sessionStorage.clear();
  });
}

vi.mock('leaflet', () => {
  class MockMap {
    private handlers: Record<string, ((e: unknown) => void)[]> = {};
    zoom = 6;
    center: [number, number] = [40.4168, -3.7038];

    on(event: string, handler: (e: unknown) => void) {
      this.handlers[event] = this.handlers[event] || [];
      this.handlers[event].push(handler);
      return this;
    }

    _trigger(event: string, data: unknown) {
      for (const h of this.handlers[event] ?? []) {
        h(data);
      }
    }

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

  class MockMarker {
    private handlers: Record<string, ((e: unknown) => void)[]> = {};
    latlng: { lat: number; lng: number };

    constructor(latlng: [number, number]) {
      this.latlng = { lat: latlng[0], lng: latlng[1] };
    }

    addTo() {
      return this;
    }

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
