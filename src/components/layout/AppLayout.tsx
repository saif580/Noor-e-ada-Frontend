import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { footerNavigation, mainNavigation } from '../../routes/appRoutes';
import headerLogo from '../../assets/logo.svg';

const MARQUEE_ITEMS = [
  'Handcrafted Ethnic Wear',
  'Free Shipping on ₹999+',
  '10k+ Happy Customers',
  'Banarasi Silks',
  'Chikankari Elegance',
  'New Arrivals Every Week',
  'Bridal & Festive Styles',
  'Easy 7-Day Returns',
] as const;

export function AppLayout({ cartCount = 0 }: Readonly<{ cartCount?: number }>) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    const onScroll = () => {
      setMenuOpen(false);
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      setScrollPct((scrollTop / Math.max(scrollHeight - clientHeight, 1)) * 100);
    };

    globalThis.addEventListener('keydown', onKey);
    globalThis.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      globalThis.removeEventListener('keydown', onKey);
      globalThis.removeEventListener('scroll', onScroll);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="site-shell">
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollPct / 100})` }}
        aria-hidden="true"
      />

      <header className="top-bar">
        <Link to="/" className="brand-link" aria-label="Noor-e-ada home">
          <img src={headerLogo} alt="" className="brand-mark" />
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          {mainNavigation.map((item) => (
            <Link key={item.href} to={item.href}>{item.label}</Link>
          ))}
        </nav>

        <div className="nav-actions" aria-label="Shopping actions">
          {isAuthenticated ? (
            <>
              <span className="nav-desktop-only nav-greeting">
                Hi, {user?.firstName}
              </span>
              <Link to="/account" className="nav-desktop-only">Account</Link>
              <Link to="/wishlist" className="nav-desktop-only">Wishlist</Link>
            </>
          ) : (
            <Link to="/login" className="nav-desktop-only">Sign in</Link>
          )}
          <Link to="/cart" className="cart-link">
            Cart <span>{cartCount}</span>
          </Link>
        </div>

        <button
          type="button"
          className={`hamburger${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </header>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {mainNavigation.map((item) => (
            <Link key={item.href} to={item.href} onClick={closeMenu}>{item.label}</Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/account"  onClick={closeMenu}>Account</Link>
              <Link to="/wishlist" onClick={closeMenu}>Wishlist</Link>
              <button
                type="button"
                onClick={() => { closeMenu(); void handleLogout(); }}
                className="mobile-nav-logout"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={closeMenu}>Sign in</Link>
              <Link to="/register" onClick={closeMenu}>Create account</Link>
            </>
          )}
        </nav>
      )}

      <div className="marquee-strip" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
            <span
              key={`${item}-${index < MARQUEE_ITEMS.length ? 'a' : 'b'}`}
              className="marquee-item"
            >
              <span className="marquee-gem">✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer reveal">
        <div>
          <strong>Noor-e-ada</strong>
          <span>Ethnic wear for weddings, festivals, and daily grace.</span>
        </div>
        <nav aria-label="Footer navigation">
          {footerNavigation.map((route) => (
            <Link key={route.path} to={route.path}>{route.label}</Link>
          ))}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="footer-logout-btn"
            >
              Sign out
            </button>
          )}
        </nav>
      </footer>
    </div>
  );
}
