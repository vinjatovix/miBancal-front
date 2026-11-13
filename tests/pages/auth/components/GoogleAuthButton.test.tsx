import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

let mockGoogleClientId: string | undefined = 'test-google-client-id';

vi.mock('../../../../src/config/env', () => ({
  get GOOGLE_CLIENT_ID() {
    return mockGoogleClientId;
  }
}));

import GoogleAuthButton from '../../../../src/pages/auth/components/GoogleAuthButton';
import * as googleSdk from '../../../../src/shared/auth/googleSdk';
import * as useIsDesktopModule from '../../../../src/shared/hooks/useIsDesktop';

describe('GoogleAuthButton', () => {
  beforeEach(() => {
    mockGoogleClientId = 'test-google-client-id';
    vi.restoreAllMocks();
    vi.stubGlobal('google', {
      accounts: {
        id: {
          initialize: vi.fn(),
          renderButton: vi.fn(),
          prompt: vi.fn()
        }
      }
    });
  });

  it('renders nothing when GOOGLE_CLIENT_ID is not configured', () => {
    mockGoogleClientId = undefined;

    const { container } = render(<GoogleAuthButton />);

    expect(container).toBeEmptyDOMElement();
  });

  it('does not load google sdk when GOOGLE_CLIENT_ID is not configured', () => {
    mockGoogleClientId = undefined;
    const loadSpy = vi
      .spyOn(googleSdk, 'loadGoogleSdk')
      .mockResolvedValue(undefined);

    render(<GoogleAuthButton />);

    expect(loadSpy).not.toHaveBeenCalled();
  });

  it('loads google sdk on mount', () => {
    const loadSpy = vi
      .spyOn(googleSdk, 'loadGoogleSdk')
      .mockResolvedValue(undefined);

    render(<GoogleAuthButton />);

    expect(loadSpy).toHaveBeenCalled();
  });

  it('renders official GIS button via renderButton on desktop', async () => {
    vi.spyOn(useIsDesktopModule, 'useIsDesktop').mockReturnValue(true);
    vi.spyOn(googleSdk, 'loadGoogleSdk').mockResolvedValue(undefined);
    const renderButtonSpy = vi.fn();
    window.google!.accounts.id.renderButton = renderButtonSpy;

    render(<GoogleAuthButton />);
    await Promise.resolve();

    expect(renderButtonSpy).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        logo_alignment: 'center',
        width: 320
      })
    );
  });

  it('applies disabled styling to desktop container when disabled is true', () => {
    vi.spyOn(useIsDesktopModule, 'useIsDesktop').mockReturnValue(true);
    vi.spyOn(googleSdk, 'loadGoogleSdk').mockResolvedValue(undefined);

    render(<GoogleAuthButton disabled={true} />);

    expect(screen.getByTestId('google-auth-desktop-container')).toHaveClass(
      'google-auth-button-disabled'
    );
  });

  it('triggers prompt when custom button is clicked on mobile', () => {
    vi.spyOn(useIsDesktopModule, 'useIsDesktop').mockReturnValue(false);
    vi.spyOn(googleSdk, 'loadGoogleSdk').mockResolvedValue(undefined);
    const promptSpy = vi.fn();
    window.google!.accounts.id.prompt = promptSpy;

    render(<GoogleAuthButton />);
    const button = screen.getByRole('button', {
      name: /continuar con google/i
    });
    fireEvent.click(button);

    expect(promptSpy).toHaveBeenCalled();
  });

  it('disables custom button on mobile when disabled is true', () => {
    vi.spyOn(useIsDesktopModule, 'useIsDesktop').mockReturnValue(false);
    vi.spyOn(googleSdk, 'loadGoogleSdk').mockResolvedValue(undefined);

    render(<GoogleAuthButton disabled={true} />);
    const button = screen.getByRole('button', {
      name: /continuar con google/i
    });

    expect(button).toBeDisabled();
  });

  it('calls onCredential callback when Google SDK triggers response', async () => {
    let capturedCallback:
      | ((res: { readonly credential: string }) => void)
      | undefined;
    window.google!.accounts.id.initialize = vi.fn((config) => {
      capturedCallback = config.callback;
    });
    vi.spyOn(googleSdk, 'loadGoogleSdk').mockResolvedValue(undefined);
    const onCredentialMock = vi.fn();

    render(<GoogleAuthButton onCredential={onCredentialMock} />);
    await Promise.resolve();

    capturedCallback?.({ credential: 'test-google-token' });

    expect(onCredentialMock).toHaveBeenCalledWith('test-google-token');
  });

  it('handles loadGoogleSdk error gracefully without throwing', () => {
    vi.spyOn(googleSdk, 'loadGoogleSdk').mockRejectedValue(
      new Error('Script blocked')
    );

    expect(() => render(<GoogleAuthButton />)).not.toThrow();
  });
});
