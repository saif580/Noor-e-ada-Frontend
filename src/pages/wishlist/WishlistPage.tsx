import { Link } from 'react-router-dom';
import { getProductDescription, getProductImageUrl, productPriceLabel } from '../../components/catalog/productUtils';
import { EmptyState, LoadingState } from '../../components/ui/AsyncState';
import { useWishlistState } from '../../hooks/useWishlistState';

export function WishlistPage() {
  const { items, loading, toggleWishlist } = useWishlistState();

  return (
    <section className="wishlist-page">
      <div className="account-heading">
        <span className="eyebrow">Saved styles</span>
        <h1>Wishlist</h1>
        <p>Keep track of pieces you want to revisit before checkout.</p>
      </div>

      {loading && <LoadingState title="Loading wishlist" />}

      {!loading && items.length === 0 && (
        <EmptyState
          title="No wishlist items yet"
          message="Save products from the catalog to compare them here."
          action={{ label: 'Shop products', onClick: () => { globalThis.location.href = '/products'; } }}
        />
      )}

      {!loading && items.length > 0 && (
        <div className="wishlist-grid">
          {items.map((item) => {
            const image = item.product.images[0];
            const imageUrl = getProductImageUrl(item.product, image?.url);
            const description = getProductDescription(item.product);

            return (
              <article className="wishlist-card" key={item.id}>
                <Link to={`/products/${item.productId}`} className="wishlist-card-image">
                  <img src={imageUrl} alt={image?.altText ?? item.product.name} />
                </Link>
                <div>
                  <span>{item.product.isActive ? 'Available' : 'Unavailable'}</span>
                  <h2><Link to={`/products/${item.productId}`}>{item.product.name}</Link></h2>
                  <p>{description}</p>
                  <strong>{productPriceLabel(item.product)}</strong>
                </div>
                <div className="wishlist-card-actions">
                  <Link to={`/products/${item.productId}`} className="button button-primary">View details</Link>
                  <button type="button" className="account-link-button" onClick={() => void toggleWishlist(item.productId)}>
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
