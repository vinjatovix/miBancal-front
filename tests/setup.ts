import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

window.scrollTo = vi.fn();

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
  vi.mocked(window.scrollTo).mockClear();
});
