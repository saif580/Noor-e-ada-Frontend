import { useEffect, useState, type ReactNode } from 'react';
import logoMark from '../../assets/noor-logo-mark.svg';
import { footerNavigation, mainNavigation } from '../../routes/appRoutes';

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

interface AppLayoutProps {
  children: ReactNode;
  cartCount?: number;
}

export function AppLayout({ children, cartCount = 0 }: AppLayoutProps) {
  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <div className="site-shell">
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollPct / 100})` }}
        aria-hidden="true"
      />

      <header className="top-bar">
        <a href="/" className="brand-link" aria-label="Noor-e-ada home">
          <img src={logoMark} alt="" className="brand-mark" />
          <span className="brand-name">Noor-e-ada</span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          {mainNavigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions" aria-label="Shopping actions">
          <a href="/account" className="nav-desktop-only">Account</a>
          <a href="/wishlist" className="nav-desktop-only">Wishlist</a>
          <a href="/cart" className="cart-link">Cart <span>{cartCount}</span></a>
        </div>

        <button
          type="button"
          className={`hamburger${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {mainNavigation.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
          <a href="/account" onClick={closeMenu}>Account</a>
          <a href="/wishlist" onClick={closeMenu}>Wishlist</a>
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

      <main>{children}</main>

      <footer className="site-footer reveal">
        <div>
          <strong>Noor-e-ada</strong>
          <span>Ethnic wear for weddings, festivals, and daily grace.</span>
        </div>
        <nav aria-label="Footer navigation">
          {footerNavigation.map((route) => (
            <a key={route.path} href={route.path}>
              {route.label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
