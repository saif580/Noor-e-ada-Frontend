import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { catalogApi, type CatalogSort } from '../../api/catalog';
import { ProductCard } from '../../components/catalog/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState';
import { FormField } from '../../components/ui/FormField';
import { ApiError } from '../../lib/apiClient';
import type { Category, Product } from '../../types/domain';

const sortOptions: Array<{ value: CatalogSort; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price low to high' },
  { value: 'price_desc', label: 'Price high to low' },
  { value: 'popularity', label: 'Popularity' },
];

const getErrorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Could not load products. Please try again.';

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = useMemo(() => ({
    q: searchParams.get('q') ?? '',
    categoryId: searchParams.get('categoryId') ?? '',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    sizes: searchParams.get('sizes') ?? '',
    colors: searchParams.get('colors') ?? '',
    sort: (searchParams.get('sort') as CatalogSort | null) ?? 'newest',
    page: Number(searchParams.get('page') ?? 1),
  }), [searchParams]);

  const [draft, setDraft] = useState(filters);

  const loadCatalog = useCallback(async () => {
    await Promise.resolve();
    setError('');
    try {
      const [freshCategories, productPage] = await Promise.all([
        catalogApi.listCategories(),
        catalogApi.listProducts({ ...filters, limit: 12 }),
      ]);
      setCategories(freshCategories);
      setProducts(productPage.items);
      setTotal(productPage.total);
      setPage(productPage.page);
      setTotalPages(productPage.totalPages);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      setDraft(filters);
      void loadCatalog();
    }, 0);
    return () => globalThis.clearTimeout(timer);
  }, [filters, loadCatalog]);

  function updateDraft(field: keyof typeof draft, value: string | number) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function applyFilters(event?: FormEvent) {
    event?.preventDefault();
    const next = new URLSearchParams();
    Object.entries({ ...draft, page: 1 }).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== 'newest') next.set(key, String(value));
    });
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    if (nextPage <= 1) next.delete('page');
    else next.set('page', String(nextPage));
    setSearchParams(next);
  }

  return (
    <section className="catalog-page">
      <div className="catalog-layout">
        <aside className="catalog-filter-panel">
          <div className="account-panel-heading">
            <h2>Filters</h2>
            <button type="button" className="account-link-button" onClick={clearFilters}>Clear</button>
          </div>

          <form className="catalog-filter-form" onSubmit={applyFilters}>
            <FormField
              label="Search"
              name="q"
              value={draft.q}
              onChange={(event) => updateDraft('q', event.target.value)}
              placeholder="Saree, chikankari, kundan"
            />

            <label className="catalog-select-field">
              <span>Category</span>
              <select value={draft.categoryId} onChange={(event) => updateDraft('categoryId', event.target.value)}>
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>

            <div className="catalog-filter-row">
              <FormField label="Min price" name="minPrice" type="number" min="0" value={draft.minPrice} onChange={(event) => updateDraft('minPrice', event.target.value)} />
              <FormField label="Max price" name="maxPrice" type="number" min="0" value={draft.maxPrice} onChange={(event) => updateDraft('maxPrice', event.target.value)} />
            </div>

            <FormField
              label="Sizes"
              name="sizes"
              value={draft.sizes}
              onChange={(event) => updateDraft('sizes', event.target.value)}
              placeholder="S,M,L"
              hint="Comma separated"
            />
            <FormField
              label="Colors"
              name="colors"
              value={draft.colors}
              onChange={(event) => updateDraft('colors', event.target.value)}
              placeholder="red,black,gold"
              hint="Comma separated"
            />

            <label className="catalog-select-field">
              <span>Sort</span>
              <select value={draft.sort} onChange={(event) => updateDraft('sort', event.target.value)}>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <button type="submit" className="button button-primary">Apply filters</button>
          </form>
        </aside>

        <div className="catalog-results">
          <div className="account-heading catalog-results-heading">
            <span className="eyebrow">Ethnic wear catalog</span>
            <h1>Products</h1>
            <p>{total} styles found across sarees, lehengas, anarkali sets, and accessories.</p>
          </div>

          {loading && <LoadingState title="Loading products" />}
          {!loading && error && <ErrorState title="Products unavailable" message={error} action={{ label: 'Try again', onClick: loadCatalog }} />}
          {!loading && !error && products.length === 0 && <EmptyState title="No products found" message="Adjust filters or clear search to see more styles." />}

          {!loading && !error && products.length > 0 && (
            <>
              <div className="product-grid">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
              <div className="catalog-pagination">
                <button type="button" disabled={page <= 1} onClick={() => goToPage(page - 1)}>Previous</button>
                <span>Page {page} of {Math.max(totalPages, 1)}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>Next</button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
