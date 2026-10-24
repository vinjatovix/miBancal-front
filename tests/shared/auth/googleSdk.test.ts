import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  loadGoogleSdk,
  resetGoogleSdk
} from '../../../src/shared/auth/googleSdk';

describe('loadGoogleSdk', () => {
  beforeEach(() => {
    resetGoogleSdk();
    vi.stubGlobal('google', undefined);
    document.head.innerHTML = '';
  });

  it('loads the google sdk script once', async () => {
    vi.stubGlobal('google', {
      accounts: {
        id: {
          initialize: vi.fn(),
          renderButton: vi.fn()
        }
      }
    });
    const scriptPromise = loadGoogleSdk();
    const script = document.querySelector(
      'script[src*="accounts.google.com/gsi/client"]'
    );

    (script as HTMLScriptElement).onload?.(new Event('load'));

    await scriptPromise;
    expect(
      document.querySelectorAll('script[src*="accounts.google.com/gsi/client"]')
        .length
    ).toBe(1);
  });

  it('rejects and resets promise when script loading fails', async () => {
    const scriptPromise = loadGoogleSdk();
    const script = document.querySelector(
      'script[src*="accounts.google.com/gsi/client"]'
    );

    (script as HTMLScriptElement).onerror?.(new Event('error'));

    await expect(scriptPromise).rejects.toThrow('Failed to load Google SDK');
  });
});
