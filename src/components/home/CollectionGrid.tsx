import type { CSSProperties } from 'react';
import { CATEGORIES } from '../../data/home';

export function CollectionGrid() {
  return (
    <section id="collections" className="section-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Shop by category</span>
          <h2>Collections made for the occasion</h2>
        </div>
        <a href="/collections">View all</a>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((category, index) => (
          <a
            key={category.name}
            href={category.href}
            className={`category-card ${category.tone}`}
            style={{ '--delay': `${index * 90}ms` } as CSSProperties}
          >
            <img className="category-img" src={category.image} alt="" aria-hidden="true" loading="lazy" />
            <span>{category.count}</span>
            <strong>{category.name}</strong>
            <small>Shop now</small>
          </a>
        ))}
      </div>
    </section>
  );
}
