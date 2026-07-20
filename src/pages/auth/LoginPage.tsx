import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FacebookAuthButton } from '../../components/auth/FacebookAuthButton';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import { FormField } from '../../components/ui/FormField';
import { env } from '../../config/env';
import logoMark from '../../assets/logo.svg';

export function LoginPage() {
  const { login, loginWithGoogle, loginWithFacebook, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasSocialLogin = Boolean(env.googleClientId || env.facebookAppId);

  const registeredMsg = new URLSearchParams(location.search).get('registered');
  const resetMsg      = new URLSearchParams(location.search).get('reset');
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const handleGoogleCredential = useCallback(async (idToken: string) => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle(idToken);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [from, loginWithGoogle, navigate]);

  const handleFacebookCredential = useCallback(async (accessToken: string) => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithFacebook(accessToken);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Facebook sign-in failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [from, loginWithFacebook, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError(
          'Your email is not verified yet. Check your inbox or resend the verification link.',
        );
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="register-page">

      {/* ── Left: brand panel ── */}
      <aside className="register-brand login-brand" aria-hidden="true">
        <a href="/" tabIndex={-1}><img src={logoMark} alt="Noor-e-ada" className="register-brand-logo" /></a>
        <h2 className="register-brand-headline">
          Dressed in<br />tradition.
        </h2>
        <p className="register-brand-body">
          Every piece in our collection carries the soul of South Asian
          craftsmanship — handwoven, hand-embroidered, and made to be
          cherished for generations.
        </p>
        <blockquote className="login-brand-quote">
          <p>
            "The craftsmanship is unlike anything I have ever worn. Noor-e-ada
            doesn't just sell clothes — they preserve an art form."
          </p>
          <footer>— Fatima R., Verified Customer</footer>
        </blockquote>
      </aside>

      {/* ── Right: form panel ── */}
      <div className="register-form-panel login-form-panel">
        <div className="register-form-inner">

          {/* Mobile-only logo */}
          <Link to="/"><img src={logoMark} alt="Noor-e-ada" className="register-mobile-logo" /></Link>

          <h1 className="auth-heading" style={{ textAlign: 'left' }}>Welcome back</h1>
          <p className="auth-sub" style={{ textAlign: 'left', marginBottom: '28px' }}>
            Sign in to your Noor-e-ada account
          </p>

          {/* Status messages from other flows */}
          <Alert
            message={registeredMsg ? 'Account created! Please check your email to verify your address before signing in.' : ''}
            type="success"
          />
          <Alert
            message={resetMsg ? 'Password reset successfully. You can now sign in with your new password.' : ''}
            type="success"
          />

          <Alert message={error} type="error" />

          {hasSocialLogin && (
            <>
              <div className="oauth-stack">
                <FacebookAuthButton
                  disabled={submitting}
                  onCredential={handleFacebookCredential}
                  onError={setError}
                />
              <GoogleAuthButton
                label="signin_with"
                onCredential={handleGoogleCredential}
                onError={setError}
              />
              </div>
              <div className="auth-divider auth-divider-text"><span>or sign in with email</span></div>
            </>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <FormField
              label="Email address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <FormField
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <div className="login-forgot-row">
              <Link to="/forgot-password" className="auth-inline-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="button button-primary auth-submit"
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <hr className="auth-divider" />
          <div className="auth-links">
            <span>
              Don't have an account?{' '}
              <Link to="/register">Create one — it's free</Link>
            </span>
            <span>
              Didn't receive a verification email?{' '}
              <Link to="/resend-verification">Resend it</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
