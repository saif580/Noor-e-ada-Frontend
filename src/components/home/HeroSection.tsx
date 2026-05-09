import type { CSSProperties, RefObject } from 'react';
import { PARTICLES } from '../../data/home';

interface HeroSectionProps {
  metricsRef: RefObject<HTMLDListElement | null>;
  countDesigns: number;
  countRating: string;
}

export function HeroSection({ metricsRef, countDesigns, countRating }: HeroSectionProps) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <span className="eyebrow fade-in-1">Indian ethnic wear</span>
        <h1 className="fade-in-2">
          <span className="highlight-word">Graceful</span>{' '}
          festive styles for every celebration.
        </h1>
        <p className="fade-in-3">
          Shop sarees, lehengas, anarkali sets, and accessories crafted for
          weddings, festivals, and everyday elegance.
        </p>
        <div className="hero-actions fade-in-4">
          <a href="#bestsellers" className="button button-primary">Shop Bestsellers</a>
          <a href="#collections" className="button button-secondary">Explore Collections</a>
        </div>

        <dl
          className="hero-metrics fade-in-4"
          ref={metricsRef}
          aria-label="Store highlights"
        >
          <div><dt>{countDesigns}+</dt><dd>Designs</dd></div>
          <div><dt>{countRating}/5</dt><dd>Customer rating</dd></div>
          <div><dt>COD</dt><dd>Available</dd></div>
        </dl>
      </div>

      <div className="hero-showcase fade-in-showcase" aria-label="Featured festive collection">
        {PARTICLES.map((particle) => (
          <span
            key={`${particle.top}-${particle.bg}`}
            className="particle"
            aria-hidden="true"
            style={{
              width: particle.size,
              height: particle.size,
              top: particle.top,
              ...('left' in particle ? { left: particle.left } : {}),
              ...('right' in particle ? { right: particle.right } : {}),
              background: particle.bg,
              '--d': particle.d,
              '--del': particle.del,
            } as CSSProperties}
          />
        ))}
        <div className="showcase-card showcase-large">
          <span>Festive Edit</span>
          <strong>Up to 30% off</strong>
        </div>
        <div className="showcase-card showcase-small top">
          <span>New</span>
          <strong>Pastel Anarkalis</strong>
        </div>
        <div className="showcase-card showcase-small bottom">
          <span>Trending</span>
          <strong>Kundan Sets</strong>
        </div>
      </div>
    </section>
  );
}
