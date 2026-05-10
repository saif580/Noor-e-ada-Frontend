import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { catalogApi } from '../../api/catalog';
import { ProductCard } from '../../components/catalog/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState';
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

  const loadCategory = useCallback(async () => {
    await Promise.resolve();
    if (!id) {
      setError('Collection ID is missing.');
      setLoading(false);
      return;
    }

    setError('');
    try {
      const [freshCategory, productPage] = await Promise.all([
        catalogApi.getCategory(id),
        catalogApi.listProducts({ categoryId: id, sort: 'newest', limit: 12 }),
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

  return (
    <section className="catalog-page">
      <div className="account-heading">
        <Link to="/collections" className="account-back-link">Back to collections</Link>
        <span className="eyebrow">{category.slug}</span>
        <h1>{category.name}</h1>
        <p>{category.description ?? 'Explore the latest pieces in this Noor-e-ada collection.'}</p>
      </div>

      {products.length === 0 ? (
        <EmptyState title="No products in this collection" message="Try another collection or return to all products." />
      ) : (
        <div className="product-grid">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </section>
  );
}
