import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../../api/catalog';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState';
import { ApiError } from '../../lib/apiClient';
import type { Category } from '../../types/domain';

const tones = ['rose', 'sage', 'gold', 'ivory'] as const;

const getErrorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Could not load collections. Please try again.';

export function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = useCallback(async () => {
    await Promise.resolve();
    setError('');
    try {
      setCategories(await catalogApi.listCategories());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      void loadCategories();
    }, 0);
    return () => globalThis.clearTimeout(timer);
  }, [loadCategories]);

  return (
    <section className="catalog-page">
      <div className="account-heading">
        <span className="eyebrow">Shop by category</span>
        <h1>Collections</h1>
        <p>Browse Noor-e-ada edits by occasion, craft, and silhouette.</p>
      </div>

      {loading && <LoadingState title="Loading collections" />}
      {!loading && error && <ErrorState title="Collections unavailable" message={error} action={{ label: 'Try again', onClick: loadCategories }} />}
      {!loading && !error && categories.length === 0 && <EmptyState title="No collections yet" message="Categories will appear here once they are active." />}

      {!loading && !error && categories.length > 0 && (
        <div className="category-grid">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/collections/${category.id}`}
              className={`category-card ${tones[index % tones.length]}`}
            >
              <span>{category.slug}</span>
              <strong>{category.name}</strong>
              <small>Shop now</small>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
