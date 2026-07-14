import type { CSSProperties } from 'react';
import { PRODUCTS } from '../../data/home';

export function BestsellersSection() {
  return (
    <section id="bestsellers" className="section-block products-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Customer favourites</span>
          <h2 className="reveal">Bestsellers this week</h2>
        </div>
        <a href="/products?sort=popularity">Shop all products</a>
      </div>

      <div className="product-grid">
        {PRODUCTS.map((product, index) => (
          <article
            key={product.name}
            className="product-card reveal"
            style={{ '--delay': `${index * 80}ms` } as CSSProperties}
          >
            <div className={`product-image ${product.color}`}>
              <img src={product.image} alt={product.name} loading="lazy" />
              <span className="product-badge">{product.badge}</span>
            </div>
            <div className="product-info">
              <span>{product.category}</span>
              <h3>{product.name}</h3>
              <div className="price-row">
                <strong>{product.price}</strong>
                <del>{product.oldPrice}</del>
              </div>
              <button type="button">Add to cart</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
