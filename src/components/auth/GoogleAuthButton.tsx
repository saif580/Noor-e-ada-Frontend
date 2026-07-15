import { useEffect, useId, useRef, useState } from 'react';
import { env } from '../../config/env';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(options: {
            client_id: string;
            callback(response: { credential?: string }): void;
          }): void;
          renderButton(
            parent: HTMLElement,
            options: {
              theme: 'outline' | 'filled_blue' | 'filled_black';
              size: 'large' | 'medium' | 'small';
              shape: 'rectangular' | 'pill' | 'circle' | 'square';
              text: 'signin_with' | 'signup_with' | 'continue_with';
              width?: number;
            },
          ): void;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT_ID = 'google-identity-services';
let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google login failed to load')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google login failed to load'));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

interface GoogleAuthButtonProps {
  label?: 'signin_with' | 'signup_with' | 'continue_with';
  onCredential(idToken: string): Promise<void> | void;
  onError(message: string): void;
}

export function GoogleAuthButton({
  label = 'continue_with',
  onCredential,
  onError,
}: Readonly<GoogleAuthButtonProps>) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const buttonId = useId();

  useEffect(() => {
    if (!env.googleClientId) return;

    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return;

        buttonRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: env.googleClientId,
          callback: response => {
            if (!response.credential) {
              onError('Google did not return a sign-in token. Please try again.');
              return;
            }
            void onCredential(response.credential);
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text: label,
          width: 360,
        });
        setIsReady(true);
      })
      .catch(() => {
        if (!cancelled) onError('Google sign-in is temporarily unavailable.');
      });

    return () => {
      cancelled = true;
    };
  }, [buttonId, label, onCredential, onError]);

  if (!env.googleClientId) return null;

  return (
    <div className="oauth-panel" aria-busy={!isReady}>
      <div ref={buttonRef} className="oauth-google-button" />
      {!isReady && <span className="oauth-loading">Loading Google sign-in...</span>}
    </div>
  );
}
