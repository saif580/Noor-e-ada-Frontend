import { Link } from 'react-router-dom';
import type { Product } from '../../types/domain';
import { getStockLabel, productPriceLabel } from './productUtils';

export function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
  const stock = getStockLabel(product);

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
        <Link className="button button-secondary catalog-card-link" to={`/products/${product.id}`}>
          View details
        </Link>
      </div>
    </article>
  );
}
