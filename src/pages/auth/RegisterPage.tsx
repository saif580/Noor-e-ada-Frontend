import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import { FormField } from '../../components/ui/FormField';
import logoMark from '../../assets/logo.svg';

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    isMarketingOptIn: false,
  });
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({
        ...prev,
        [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
      }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.acceptTerms) {
      setError('You must accept the terms and conditions to continue.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ ...form, acceptTerms: true });
      navigate('/login?registered=1', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('An account with this email already exists. Try signing in instead.');
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
      <aside className="register-brand" aria-hidden="true">
        <img src={logoMark} alt="Noor-e-ada" className="register-brand-logo" />
        <h2 className="register-brand-headline">
          Your style,<br />your heritage.
        </h2>
        <p className="register-brand-body">
          Discover handcrafted ethnic wear that celebrates South Asian
          tradition — sarees, lehengas, anarkalis, and fine jewellery
          curated just for you.
        </p>
        <ul className="register-brand-perks">
          <li>Exclusive member-only collections</li>
          <li>Early access to new arrivals</li>
          <li>Saved wishlist &amp; order tracking</li>
          <li>Personalised style recommendations</li>
        </ul>
      </aside>

      {/* ── Right: form panel ── */}
      <div className="register-form-panel">
        <div className="register-form-inner">

          {/* Mobile-only logo */}
          <img src={logoMark} alt="Noor-e-ada" className="register-mobile-logo" />

          <h1 className="auth-heading" style={{ textAlign: 'left' }}>
            Create your account
          </h1>
          <p className="auth-sub" style={{ textAlign: 'left', marginBottom: '28px' }}>
            Join thousands of happy customers
          </p>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* ── Personal details ── */}
            <section className="register-section">
              <p className="register-section-label">Personal details</p>
              <div className="auth-form-row">
                <FormField
                  label="First name"
                  type="text"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={set('firstName')}
                  required
                />
                <FormField
                  label="Last name"
                  type="text"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={set('lastName')}
                  required
                />
              </div>
              <FormField
                label="Email address"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={set('email')}
                required
              />
              <FormField
                label="Phone number"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={set('phone')}
                required
              />
            </section>

            {/* ── Password ── */}
            <section className="register-section">
              <p className="register-section-label">Set your password</p>
              <FormField
                label="Password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={set('password')}
                hint="Min 8 characters, must include a number"
                required
              />
              <FormField
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                required
              />
            </section>

            {/* ── Preferences ── */}
            <section className="register-section">
              <p className="register-section-label">Preferences</p>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={set('acceptTerms')}
                  required
                />
                I agree to the{' '}
                <Link to="/terms" className="auth-inline-link">Terms &amp; Conditions</Link>
                {' '}and{' '}
                <Link to="/privacy" className="auth-inline-link">Privacy Policy</Link>
              </label>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={form.isMarketingOptIn}
                  onChange={set('isMarketingOptIn')}
                />{' '}
                <span>Send me new arrivals, offers, and style inspiration</span>
              </label>
            </section>

            <button
              type="submit"
              className="button button-primary auth-submit"
              disabled={submitting}
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <hr className="auth-divider" />
          <div className="auth-links">
            <span>
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
