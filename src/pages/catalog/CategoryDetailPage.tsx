import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { catalogApi } from '../../api/catalog';
import { getCategoryImageUrl, getCategoryKicker } from '../../components/catalog/categoryUtils';
import { ProductCard } from '../../components/catalog/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState';
import { useWishlistState } from '../../hooks/useWishlistState';
import { ApiError } from '../../lib/apiClient';
import type { Category, Product } from '../../types/domain';

const getErrorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Could not load this collection. Please try again.';

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const wishlist = useWishlistState();

  const loadCategory = useCallback(async () => {
    await Promise.resolve();
    if (!id) {
      setError('Collection ID is missing.');
      setLoading(false);
      return;
    }

    setError('');
    try {
      const isNumericId = /^\d+$/.test(id);
      const [freshCategory, productPage] = await Promise.all([
        catalogApi.getCategory(id),
        catalogApi.listProducts(
          isNumericId
            ? { categoryId: id, sort: 'newest', limit: 12 }
            : { categorySlug: id, sort: 'newest', limit: 12 },
        ),
      ]);
      setCategory(freshCategory);
      setProducts(productPage.items);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      void loadCategory();
    }, 0);
    return () => globalThis.clearTimeout(timer);
  }, [loadCategory]);

  if (loading) {
    return (
      <section className="catalog-page">
        <LoadingState title="Loading collection" />
      </section>
    );
  }

  if (error || !category) {
    return (
      <section className="catalog-page">
        <ErrorState title="Collection unavailable" message={error} action={{ label: 'Try again', onClick: loadCategory }} />
      </section>
    );
  }

  const imageUrl = getCategoryImageUrl(category);
  const productCount = products.length;
  const availableCount = products.filter((product) => {
    const stock = product.totalInventory ?? product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
    return stock > 0;
  }).length;
  const priceRange = products.reduce<{ min: number; max: number } | null>((range, product) => {
    const prices = [
      product.minPrice,
      product.maxPrice,
      product.basePrice,
      ...product.variants.map((variant) => variant.price),
    ].filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

    if (prices.length === 0) return range;

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return range ? { min: Math.min(range.min, min), max: Math.max(range.max, max) } : { min, max };
  }, null);
  const priceLabel = priceRange
    ? priceRange.min === priceRange.max
      ? `From ₹${priceRange.min.toLocaleString('en-IN')}`
      : `₹${priceRange.min.toLocaleString('en-IN')} - ₹${priceRange.max.toLocaleString('en-IN')}`
    : 'Curated styles';

  return (
    <section className="catalog-page collection-detail-page">
      <div className="collection-detail-hero">
        <div className="collection-detail-copy">
          <Link to="/collections" className="account-back-link">Back to collections</Link>
          <span className="eyebrow">{getCategoryKicker(category)}</span>
          <h1>{category.name}</h1>
          <p>{category.description ?? 'Explore the latest pieces in this Noor-e-ada collection.'}</p>

          <div className="collection-hero-actions">
            <a href="#collection-products" className="button button-primary">Shop this collection</a>
            <Link to="/products" className="button button-secondary">View all products</Link>
          </div>

          <dl className="collection-hero-stats" aria-label="Collection summary">
            <div>
              <dt>{productCount}</dt>
              <dd>{productCount === 1 ? 'Style' : 'Styles'}</dd>
            </div>
            <div>
              <dt>{availableCount}</dt>
              <dd>Available</dd>
            </div>
            <div>
              <dt>{priceLabel}</dt>
              <dd>Price range</dd>
            </div>
          </dl>
        </div>

        <div className="collection-detail-media">
          <img src={imageUrl} alt={`${category.name} collection`} />
          <div className="collection-media-note">
            <span>Curated by Noor-e-ada</span>
            <strong>{getCategoryKicker(category)}</strong>
          </div>
        </div>
      </div>

      <div id="collection-products" className="collection-products-section">
        <div className="collection-products-heading">
          <div>
            <span className="eyebrow">Collection pieces</span>
            <h2>{category.name}</h2>
          </div>
          <Link to="/products">Browse full catalog</Link>
        </div>

        {products.length === 0 ? (
          <EmptyState title="No products in this collection" message="Try another collection or return to all products." />
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlist.isWishlisted(product.id)}
                onToggleWishlist={wishlist.toggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
