import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cartApi } from '../../api/cart';
import { ApiError } from '../../lib/apiClient';
import type { Product } from '../../types/domain';
import { getStockLabel, productPriceLabel } from './productUtils';

export function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
  const stock = getStockLabel(product);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  async function addFirstVariant() {
    const variant = product.variants.find((item) => item.isActive !== false && item.stockQuantity > 0);
    if (!variant) {
      setMessage('Out of stock');
      return;
    }

    setAdding(true);
    setMessage('');
    try {
      await cartApi.addItem(variant.id, 1);
      setMessage('Added');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Could not add');
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="product-card catalog-product-card">
      <Link to={`/products/${product.id}`} className="catalog-product-media">
        {primaryImage ? (
          <img src={primaryImage.url} alt={primaryImage.altText ?? product.name} />
        ) : (
          <div className="catalog-product-placeholder" aria-hidden="true">
            {product.name.slice(0, 1)}
          </div>
        )}
        <span className={`catalog-stock catalog-stock-${stock.tone}`}>{stock.label}</span>
      </Link>
      <div className="product-info">
        <span>{product.categoryName ?? 'Ethnic wear'}</span>
        <h3>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="price-row">
          <strong>{productPriceLabel(product)}</strong>
          {product.reviewCount ? <small>{product.averageRating?.toFixed(1) ?? '0.0'} / 5</small> : null}
        </div>
        <div className="catalog-card-actions">
          <button type="button" onClick={() => void addFirstVariant()} disabled={adding || stock.tone === 'out'}>
            {adding ? 'Adding...' : stock.tone === 'out' ? 'Out of stock' : 'Add to cart'}
          </button>
          <Link className="button button-secondary catalog-card-link" to={`/products/${product.id}`}>
            View
          </Link>
        </div>
        {message && <small className="catalog-card-message">{message}</small>}
      </div>
    </article>
  );
}
