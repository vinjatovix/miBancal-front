import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

import '../src/i18n/messages/features';

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
});
