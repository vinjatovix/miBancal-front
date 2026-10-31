import { useEffect, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '../../../config/env';
import { t } from '../../../i18n/core/t';
import { loadGoogleSdk } from '../../../shared/auth/googleSdk';
import { useIsDesktop } from '../../../shared/hooks/useIsDesktop';
import './googleAuthButton.css';

interface GoogleAuthButtonProps {
  readonly onCredential?: (idToken: string) => void;
  readonly disabled?: boolean;
}

export default function GoogleAuthButton({
  onCredential,
  disabled = false
}: GoogleAuthButtonProps) {
  const isDesktop = useIsDesktop();
  const buttonRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let isMounted = true;

    if (GOOGLE_CLIENT_ID) {
      const clientId = GOOGLE_CLIENT_ID;
      loadGoogleSdk()
        .then(() => {
          if (!isMounted) return;

          window.google?.accounts.id.initialize({
            client_id: clientId,
            callback: (response: { readonly credential: string }) => {
              onCredentialRef.current?.(response.credential);
            },
            ux_mode: isDesktop ? 'popup' : 'redirect'
          });

          if (isDesktop && buttonRef.current) {
            window.google?.accounts.id.renderButton(buttonRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              shape: 'rectangular',
              text: 'continue_with',
              logo_alignment: 'center',
              width: 320
            });
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [isDesktop]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  const handleClick = () => {
    window.google?.accounts.id.prompt();
  };

  if (isDesktop) {
    return (
      <div
        data-testid="google-auth-desktop-container"
        className={`google-auth-desktop-container ${disabled ? 'google-auth-button-disabled' : ''}`}
      >
        <div ref={buttonRef} />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="google-auth-button"
      onClick={handleClick}
      disabled={disabled}
    >
      <svg
        className="google-auth-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="currentColor"
      >
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
      <span>{t('auth.google_login')}</span>
    </button>
  );
}
