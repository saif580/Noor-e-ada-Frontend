import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { authApi } from '../../api/auth';
import { FormField } from '../../components/ui/FormField';
import logoMark from '../../assets/logo.svg';

export function ResendVerificationPage() {
  const [email, setEmail]           = useState('');
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authApi.resendVerification(email);
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

        <h1 className="auth-heading">Resend verification</h1>
        <p className="auth-sub">
          Enter your email and we'll send you a new verification link.
        </p>

        {submitted ? (
          <Alert
            message="If an unverified account exists for that email, a new link has been sent. Please check your inbox (and spam folder)."
            type="success"
          />
        ) : (
          <>
            <Alert message={error} type="error" />
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
                {submitting ? 'Sending…' : 'Send verification link'}
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
