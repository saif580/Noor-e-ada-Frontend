import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { ApiError } from '../../lib/apiClient';
import logoMark from '../../assets/logo.svg';

type Status = 'verifying' | 'success' | 'error';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<Status>(() => (token ? 'verifying' : 'error'));
  const [message, setMessage] = useState(() =>
    token ? '' : 'No verification token found in the link. Please request a new one.',
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    authApi
      .verifyEmail(token)
      .then(res => {
        setMessage(res.message);
        setStatus('success');
      })
      .catch(err => {
        setMessage(
          err instanceof ApiError
            ? err.message
            : 'Verification failed. The link may have expired.',
        );
        setStatus('error');
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <img src={logoMark} alt="Noor-e-ada" className="auth-logo" />

        {status === 'verifying' && (
          <>
            <h1 className="auth-heading">Verifying your email…</h1>
            <p className="auth-sub">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="auth-heading">Email verified!</h1>
            <p className="auth-sub">{message}</p>
            <br />
            <Link to="/login" className="button button-primary" style={{ display: 'inline-flex' }}>
              Sign in to your account
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="auth-heading">Verification failed</h1>
            <p className="auth-error" role="alert" style={{ textAlign: 'left' }}>
              {message}
            </p>
            <br />
            <div className="auth-links">
              <Link to="/resend-verification">Resend verification email</Link>
              <Link to="/login">Back to sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
