import type { CSSProperties } from 'react';
import { BENEFITS } from '../../data/home';

export function BenefitStrip() {
  return (
    <section className="benefit-strip" aria-label="Shopping benefits">
      {BENEFITS.map(([title, text], index) => (
        <div
          key={title}
          className="reveal"
          style={{ '--delay': `${index * 120}ms` } as CSSProperties}
        >
          <strong>{title}</strong>
          <span>{text}</span>
        </div>
      ))}
    </section>
  );
}
