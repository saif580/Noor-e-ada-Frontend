import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { FormField } from '../../components/ui/FormField';
import logoMark from '../../assets/logo.svg';

export function ForgotPasswordPage() {
  const [email, setEmail]           = useState('');
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logoMark} alt="Noor-e-ada" className="auth-logo" />

        <h1 className="auth-heading">Forgot password?</h1>
        <p className="auth-sub">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {submitted ? (
          <div className="auth-success" role="status">
            If that email is registered, a reset link has been sent. Please check
            your inbox (and spam folder).
          </div>
        ) : (
          <>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <FormField
                label="Email address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="button button-primary auth-submit"
                disabled={submitting}
              >
                {submitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}

        <hr className="auth-divider" />
        <div className="auth-links">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
