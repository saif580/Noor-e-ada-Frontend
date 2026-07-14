import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cartApi } from '../../api/cart';
import { catalogApi } from '../../api/catalog';
import {
  getProductDescription,
  getProductMedia,
  getStockLabel,
  productPriceLabel,
  type ProductMediaItem,
} from '../../components/catalog/productUtils';
import { ProductReviews } from '../../components/catalog/ProductReviews';
import { Alert } from '../../components/ui/Alert';
import { ErrorState, LoadingState } from '../../components/ui/AsyncState';
import { useAuth } from '../../hooks/useAuth';
import { useWishlistState } from '../../hooks/useWishlistState';
import { ApiError } from '../../lib/apiClient';
import { guestCart } from '../../lib/guestCart';
import type { Product, ProductVariant } from '../../types/domain';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const getErrorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Could not load this product. Please try again.';

const variantLabel = (variant: ProductVariant) =>
  [variant.color, variant.size, variant.material].filter(Boolean).join(' / ') || variant.sku;

const variantStockLabel = (variant: ProductVariant): string => {
  if (variant.stockQuantity <= 0) return 'Out of stock';
  if (variant.stockQuantity <= (variant.lowStockThreshold ?? 5)) return 'Low stock';
  return 'Available';
};

const cartButtonLabel = (adding: boolean, outOfStock: boolean): string => {
  if (adding) return 'Adding…';
  if (outOfStock) return 'Out of stock';
  return 'Add to cart';
};

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<ProductMediaItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [wishlistMessage, setWishlistMessage] = useState('');
  const [error, setError] = useState('');
  const wishlist = useWishlistState();
  const { isAuthenticated } = useAuth();

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
      const media = getProductMedia(freshProduct);
      setProduct(freshProduct);
      setSelectedMedia(media[0] ?? null);
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

  async function addToCart() {
    if (!product || !selectedVariant) return;
    setAdding(true);
    setCartMessage('');
    try {
      if (isAuthenticated) await cartApi.addItem(selectedVariant.id, 1);
      else guestCart.addItem(product, selectedVariant, 1);
      setCartMessage('Added to cart.');
    } catch (err) {
      setCartMessage(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function toggleWishlist() {
    if (!product) return;
    setWishlistMessage('');
    try {
      const saved = await wishlist.toggleWishlist(product.id);
      setWishlistMessage(saved ? 'Saved to wishlist.' : 'Removed from wishlist.');
    } catch (err) {
      setWishlistMessage(err instanceof Error ? err.message : getErrorMessage(err));
    }
  }

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
  const mediaItems = getProductMedia(product);
  const activeMedia = selectedMedia ?? mediaItems[0];
  const productDescription = getProductDescription(product);

  return (
    <section className="catalog-page">
      <div className="product-detail-layout">
        <div className="product-gallery">
          <div className="product-gallery-main">
            {activeMedia?.type === 'video' ? (
              <video controls playsInline poster={activeMedia.poster}>
                <source src={activeMedia.url} type="video/mp4" />
              </video>
            ) : (
              <img src={activeMedia?.url} alt={activeMedia?.altText ?? product.name} />
            )}
          </div>

          {mediaItems.length > 1 && (
            <div className="product-thumbnails">
              {mediaItems.map((media) => (
                <button
                  key={media.id}
                  type="button"
                  className={activeMedia?.id === media.id ? 'is-active' : ''}
                  onClick={() => setSelectedMedia(media)}
                  aria-label={`Show ${media.altText}`}
                >
                  {media.type === 'video' ? (
                    <span className="product-video-thumb">Video</span>
                  ) : (
                    <img src={media.url} alt="" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-copy">
          <Link to="/products" className="account-back-link">Back to products</Link>
          <span className="eyebrow">{product.categoryName ?? 'Noor-e-ada'}</span>
          <h1>{product.name}</h1>
          <p>{productDescription}</p>

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
                  <small>{variantStockLabel(variant)}</small>
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

          <Alert message={cartMessage} type="success" className="account-alert" />
          <Alert message={wishlistMessage} type="success" className="account-alert" />
          <button type="button" className="button button-secondary product-detail-cta" onClick={() => void toggleWishlist()}>
            {wishlist.isWishlisted(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
          </button>
          <button type="button" className="button button-primary product-detail-cta" onClick={() => void addToCart()} disabled={isOutOfStock || adding}>
            {cartButtonLabel(adding, isOutOfStock)}
          </button>
        </div>
      </div>

      {id && <ProductReviews productId={id} />}
    </section>
  );
}
