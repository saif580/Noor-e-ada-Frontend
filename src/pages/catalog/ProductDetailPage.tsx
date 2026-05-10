import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { catalogApi } from '../../api/catalog';
import { getStockLabel, productPriceLabel } from '../../components/catalog/productUtils';
import { ErrorState, LoadingState } from '../../components/ui/AsyncState';
import { ApiError } from '../../lib/apiClient';
import type { Product, ProductImage, ProductVariant } from '../../types/domain';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const getErrorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Could not load this product. Please try again.';

const variantLabel = (variant: ProductVariant) =>
  [variant.color, variant.size, variant.material].filter(Boolean).join(' / ') || variant.sku;

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedVariant = useMemo(
    () => product?.variants.find((variant) => variant.id === selectedVariantId) ?? product?.variants[0],
    [product, selectedVariantId],
  );

  const loadProduct = useCallback(async () => {
    await Promise.resolve();
    if (!id) {
      setError('Product ID is missing.');
      setLoading(false);
      return;
    }

    setError('');
    try {
      const freshProduct = await catalogApi.getProduct(id);
      setProduct(freshProduct);
      setSelectedImage(freshProduct.images[0] ?? null);
      setSelectedVariantId(freshProduct.variants[0]?.id ?? '');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      void loadProduct();
    }, 0);
    return () => globalThis.clearTimeout(timer);
  }, [loadProduct]);

  if (loading) {
    return (
      <section className="catalog-page">
        <LoadingState title="Loading product" />
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="catalog-page">
        <ErrorState title="Product unavailable" message={error} action={{ label: 'Try again', onClick: loadProduct }} />
      </section>
    );
  }

  const stock = getStockLabel(product);
  const isOutOfStock = !selectedVariant || selectedVariant.stockQuantity <= 0;

  return (
    <section className="catalog-page">
      <div className="product-detail-layout">
        <div className="product-gallery">
          <div className="product-gallery-main">
            {selectedImage ? (
              <img src={selectedImage.url} alt={selectedImage.altText ?? product.name} />
            ) : (
              <div className="catalog-product-placeholder" aria-hidden="true">{product.name.slice(0, 1)}</div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="product-thumbnails">
              {product.images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  className={selectedImage?.id === image.id ? 'is-active' : ''}
                  onClick={() => setSelectedImage(image)}
                  aria-label={`Show ${image.altText ?? product.name}`}
                >
                  <img src={image.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-copy">
          <Link to="/products" className="account-back-link">Back to products</Link>
          <span className="eyebrow">{product.categoryName ?? 'Noor-e-ada'}</span>
          <h1>{product.name}</h1>
          <p>{product.description ?? 'A thoughtfully crafted ethnic wear piece from Noor-e-ada.'}</p>

          <div className="product-detail-price">
            <strong>{selectedVariant ? money.format(selectedVariant.price) : productPriceLabel(product)}</strong>
            {selectedVariant?.compareAtPrice ? <del>{money.format(selectedVariant.compareAtPrice)}</del> : null}
          </div>

          <div className="product-detail-meta">
            <span className={`catalog-stock catalog-stock-${stock.tone}`}>{stock.label}</span>
            {product.reviewCount ? <span>{product.averageRating?.toFixed(1)} / 5 from {product.reviewCount} reviews</span> : <span>No reviews yet</span>}
          </div>

          <div className="variant-panel">
            <h2>Choose variant</h2>
            <div className="variant-options">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  className={variant.id === selectedVariant?.id ? 'is-selected' : ''}
                  disabled={!variant.isActive || variant.stockQuantity <= 0}
                  onClick={() => setSelectedVariantId(variant.id)}
                >
                  <span>{variantLabel(variant)}</span>
                  <strong>{money.format(variant.price)}</strong>
                  <small>{variant.stockQuantity <= 0 ? 'Out of stock' : variant.stockQuantity <= (variant.lowStockThreshold ?? 5) ? 'Low stock' : 'Available'}</small>
                </button>
              ))}
            </div>
          </div>

          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <dl className="product-attributes">
              {Object.entries(product.attributes).map(([name, value]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <button type="button" className="button button-primary product-detail-cta" disabled={isOutOfStock}>
            {isOutOfStock ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </section>
  );
}
