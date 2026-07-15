import { useEffect, useState } from 'react';
import { env } from '../../config/env';

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init(options: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }): void;
      login(
        callback: (response: {
          status?: string;
          authResponse?: { accessToken?: string };
        }) => void,
        options: { scope: string; return_scopes: boolean },
      ): void;
    };
  }
}

const FACEBOOK_SCRIPT_ID = 'facebook-jssdk';
let facebookScriptPromise: Promise<void> | null = null;

function loadFacebookSdk() {
  if (window.FB) return Promise.resolve();
  if (facebookScriptPromise) return facebookScriptPromise;

  facebookScriptPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => resolve();

    const existingScript = document.getElementById(FACEBOOK_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) return;

    const script = document.createElement('script');
    script.id = FACEBOOK_SCRIPT_ID;
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => reject(new Error('Facebook login failed to load'));
    document.body.appendChild(script);
  });

  return facebookScriptPromise;
}

interface FacebookAuthButtonProps {
  disabled?: boolean;
  onCredential(accessToken: string): Promise<void> | void;
  onError(message: string): void;
}

export function FacebookAuthButton({
  disabled = false,
  onCredential,
  onError,
}: Readonly<FacebookAuthButtonProps>) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!env.facebookAppId) return;

    let cancelled = false;
    loadFacebookSdk()
      .then(() => {
        if (cancelled || !window.FB) return;
        window.FB.init({
          appId: env.facebookAppId,
          cookie: true,
          xfbml: false,
          version: 'v23.0',
        });
        setIsReady(true);
      })
      .catch(() => {
        if (!cancelled) onError('Facebook sign-in is temporarily unavailable.');
      });

    return () => {
      cancelled = true;
    };
  }, [onError]);

  if (!env.facebookAppId) return null;

  const handleClick = () => {
    if (!window.FB || !isReady) {
      onError('Facebook sign-in is still loading. Please try again.');
      return;
    }

    window.FB.login(
      response => {
        const token = response.authResponse?.accessToken;
        if (response.status !== 'connected' || !token) {
          onError('Facebook sign-in was cancelled or did not complete.');
          return;
        }
        void onCredential(token);
      },
      { scope: 'public_profile,email', return_scopes: true },
    );
  };

  return (
    <button
      className="oauth-provider-button oauth-provider-button-facebook"
      type="button"
      disabled={disabled || !isReady}
      onClick={handleClick}
    >
      <span className="oauth-provider-icon" aria-hidden="true">f</span>
      <span>{isReady ? 'Continue with Facebook' : 'Loading Facebook...'}</span>
    </button>
  );
}
