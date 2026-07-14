import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { cartApi } from '../../api/cart';
import { catalogApi } from '../../api/catalog';
import { PRODUCTS } from '../../data/home';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import { guestCart } from '../../lib/guestCart';
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
  const { isAuthenticated } = useAuth();
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [addingIndex, setAddingIndex] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, string>>({});

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

  async function addHomeProduct(index: number) {
    setAddingIndex(index);
    setMessages((current) => ({ ...current, [index]: '' }));

    try {
      const products = catalogProducts.length > 0
        ? catalogProducts
        : (await catalogApi.listProducts({ sort: 'popularity', limit: 12 })).items;

      if (catalogProducts.length === 0) setCatalogProducts(products);

      const product = productMatches[index] ?? findHomeProductMatch(PRODUCTS[index].name, index, products);
      const variant = findAvailableVariant(product);

      if (!product || !variant) {
        setMessages((current) => ({ ...current, [index]: 'Currently unavailable' }));
        return;
      }

      if (isAuthenticated) await cartApi.addItem(variant.id, 1);
      else guestCart.addItem(product, variant, 1);
      setMessages((current) => ({ ...current, [index]: 'Added to cart' }));
    } catch (err) {
      setMessages((current) => ({
        ...current,
        [index]: err instanceof ApiError ? err.message : 'Could not add',
      }));
    } finally {
      setAddingIndex(null);
    }
  }

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
              <button type="button" onClick={() => void addHomeProduct(index)} disabled={addingIndex === index}>
                {addingIndex === index ? 'Adding...' : 'Add to cart'}
              </button>
              {messages[index] && <small className="catalog-card-message">{messages[index]}</small>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
