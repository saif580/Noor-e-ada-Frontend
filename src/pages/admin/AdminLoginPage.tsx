import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { Alert } from '../../components/ui/Alert';
import { FormField } from '../../components/ui/FormField';
import logoMark from '../../assets/logo.svg';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';

export function AdminLoginPage() {
  const { login, logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate(from.startsWith('/admin') ? from : '/admin', { replace: true });
    }
  }, [from, isAuthenticated, navigate, user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      await authApi.verifyAdminAccess();
      navigate(from.startsWith('/admin') ? from : '/admin', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        await logout();
        setError('This account does not have admin access.');
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Could not sign in. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-brand">
        <Link to="/" className="admin-login-logo-link" aria-label="Back to storefront">
          <img src={logoMark} alt="Noor-e-ada" />
        </Link>
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Noor-e-ada operations</h1>
          <p>
            Manage products, collections, orders, inventory alerts, and customer access from one focused console.
          </p>
        </div>
      </section>

      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <span className="eyebrow">Secure access</span>
        <h2 id="admin-login-title">Admin sign in</h2>
        <p>Use an account with admin role enabled.</p>

        <Alert message={error} type="error" className="admin-alert" />

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Admin email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button className="button button-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Checking access...' : 'Sign in to admin'}
          </button>
        </form>

        <div className="admin-login-footnote">
          <Link to="/login">Customer login</Link>
          <Link to="/">Storefront</Link>
        </div>
      </section>
    </main>
  );
}
