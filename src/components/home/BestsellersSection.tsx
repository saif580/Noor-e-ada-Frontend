import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { catalogApi } from '../../api/catalog';
import { PRODUCTS } from '../../data/home';
import type { Product } from '../../types/domain';

const matchTermsByProductName: Record<string, string[]> = {
  'Zari Embroidered Lehenga': ['lehenga', 'gown', 'occasion'],
  'Chikankari Anarkali Set': ['anarkali', 'chikankari', 'festive'],
  'Banarasi Silk Saree': ['saree', 'silk', 'blush'],
  'Pearl Kundan Choker': ['dupatta', 'accessories', 'choker'],
};

const findAvailableVariant = (product?: Product) =>
  product?.variants.find((variant) => variant.isActive !== false && variant.stockQuantity > 0);

const findHomeProductMatch = (homeProductName: string, index: number, products: Product[]) => {
  const terms = matchTermsByProductName[homeProductName] ?? [];
  const matched = products.find((product) => {
    const searchable = `${product.name} ${product.categoryName ?? ''} ${product.description ?? ''}`.toLowerCase();
    return terms.some((term) => searchable.includes(term));
  });

  if (matched && findAvailableVariant(matched)) return matched;

  const indexedFallback = products[index];
  if (indexedFallback && findAvailableVariant(indexedFallback)) return indexedFallback;

  return products.find((product) => findAvailableVariant(product));
};

export function BestsellersSection() {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;

    catalogApi.listProducts({ sort: 'popularity', limit: 12 })
      .then((page) => {
        if (mounted) setCatalogProducts(page.items);
      })
      .catch(() => {
        if (mounted) setCatalogProducts([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const productMatches = useMemo(() => PRODUCTS.map((homeProduct, index) =>
    findHomeProductMatch(homeProduct.name, index, catalogProducts)), [catalogProducts]);

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
              <a className="home-product-link" href={productMatches[index] ? `/products/${productMatches[index]?.id}` : '/products?sort=popularity'}>
                View details
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
