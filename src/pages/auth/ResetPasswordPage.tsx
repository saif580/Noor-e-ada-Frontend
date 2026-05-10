import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { ApiError } from '../../lib/apiClient';
import { FormField } from '../../components/ui/FormField';
import logoMark from '../../assets/logo.svg';

export function ResetPasswordPage() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const token           = searchParams.get('token') ?? '';

  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirm]       = useState('');
  const [error, setError]                   = useState('');
  const [submitting, setSubmitting]         = useState(false);

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <img src={logoMark} alt="Noor-e-ada" className="auth-logo" />
          <h1 className="auth-heading">Invalid link</h1>
          <p className="auth-error" role="alert">
            This password reset link is missing a token. Please request a new one.
          </p>
          <br />
          <div className="auth-links">
            <Link to="/forgot-password">Request new reset link</Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword(token, password, confirmPassword);
      navigate('/login?reset=1', { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logoMark} alt="Noor-e-ada" className="auth-logo" />

        <h1 className="auth-heading">Set new password</h1>
        <p className="auth-sub">Choose a strong password for your account.</p>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            hint="Min 8 characters, must include a number"
            required
          />
          <FormField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={e => setConfirm(e.target.value)}
            required
          />

          <button
            type="submit"
            className="button button-primary auth-submit"
            disabled={submitting}
          >
            {submitting ? 'Saving…' : 'Reset password'}
          </button>
        </form>

        <hr className="auth-divider" />
        <div className="auth-links">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
