import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { cartApi } from '../../api/cart';
import { getProductImageUrl } from '../../components/catalog/productUtils';
import { Alert } from '../../components/ui/Alert';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState';
import { FormField } from '../../components/ui/FormField';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import { guestCart } from '../../lib/guestCart';
import type { Cart } from '../../types/domain';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const getErrorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Could not load your cart. Please try again.';

export function CartPage() {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    await Promise.resolve();
    setError('');
    if (!isAuthenticated) {
      setCart(guestCart.getCart());
      setCoupon('');
      setLoading(false);
      return;
    }

    try {
      const freshCart = await cartApi.getCart();
      setCart(freshCart);
      setCoupon(freshCart.couponCode ?? '');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      void loadCart();
    }, 0);
    return () => globalThis.clearTimeout(timer);
  }, [loadCart]);

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    setBusyId(itemId);
    setError('');
    setSuccess('');
    try {
      setCart(isAuthenticated
        ? await cartApi.updateItemQuantity(itemId, quantity)
        : guestCart.updateItemQuantity(itemId, quantity));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(itemId: string) {
    setBusyId(itemId);
    setError('');
    setSuccess('');
    try {
      setCart(isAuthenticated ? await cartApi.removeItem(itemId) : guestCart.removeItem(itemId));
      setSuccess('Item removed.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function clearCart() {
    setBusyId('clear');
    setError('');
    setSuccess('');
    try {
      const freshCart = isAuthenticated ? await cartApi.clearCart() : guestCart.clearCart();
      setCart(freshCart);
      setCoupon('');
      setSuccess(freshCart.message ?? 'Cart cleared.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function applyCoupon(event: FormEvent) {
    event.preventDefault();
    setBusyId('coupon');
    setError('');
    setSuccess('');
    if (!isAuthenticated) {
      setError('Sign in before applying coupons at checkout.');
      setBusyId(null);
      return;
    }

    try {
      const freshCart = await cartApi.applyCoupon(coupon);
      setCart(freshCart);
      setSuccess(`Coupon ${freshCart.couponCode} applied.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <section className="cart-page">
        <LoadingState title="Loading cart" />
      </section>
    );
  }

  if (error && !cart) {
    return (
      <section className="cart-page">
        <ErrorState title="Cart unavailable" message={error} action={{ label: 'Try again', onClick: loadCart }} />
      </section>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <section className="cart-page">
      <div className="account-heading">
        <span className="eyebrow">Shopping bag</span>
        <h1>Cart</h1>
        <p>{isAuthenticated ? 'Review your selected styles before reserving stock for checkout.' : 'Your picks are saved here. Sign in when you are ready to checkout.'}</p>
      </div>

      <Alert message={error} type="error" className="account-alert" />
      <Alert message={success} type="success" className="account-alert" />

      {isEmpty ? (
        <EmptyState
          title="Your cart is empty"
          message="Add a style from the catalog to begin checkout."
          action={{ label: 'Shop products', onClick: () => { globalThis.location.href = '/products'; } }}
        />
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <article className="cart-item" key={item.id}>
                <Link to={`/products/${item.productId}`} className="cart-item-image">
                  <img src={getProductImageUrl(item.product, item.imageUrl)} alt={item.imageAltText ?? item.product.name} />
                </Link>
                <div>
                  <span>{[item.variant.color, item.variant.size, item.variant.material].filter(Boolean).join(' / ')}</span>
                  <h2><Link to={`/products/${item.productId}`}>{item.product.name}</Link></h2>
                  <p>{item.variant.sku}</p>
                </div>
                <div className="cart-quantity">
                  <button type="button" onClick={() => void updateQuantity(item.id, item.quantity - 1)} disabled={busyId === item.id || item.quantity <= 1}>-</button>
                  <strong>{item.quantity}</strong>
                  <button type="button" onClick={() => void updateQuantity(item.id, item.quantity + 1)} disabled={busyId === item.id}>+</button>
                </div>
                <div className="cart-item-total">
                  <strong>{money.format(item.lineTotal ?? 0)}</strong>
                  <button type="button" onClick={() => void removeItem(item.id)} disabled={busyId === item.id}>Remove</button>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary account-panel">
            <h2>Summary</h2>
            <dl>
              <div><dt>Subtotal</dt><dd>{money.format(cart.totals.subtotal)}</dd></div>
              <div><dt>Discount</dt><dd>-{money.format(cart.totals.discountTotal)}</dd></div>
              <div><dt>Shipping</dt><dd>{cart.coupon?.freeShipping ? 'Free' : 'Calculated later'}</dd></div>
              <div><dt>Total</dt><dd>{money.format(cart.totals.grandTotal)}</dd></div>
            </dl>

            <form className="coupon-form" onSubmit={applyCoupon}>
              <FormField label="Coupon code" name="coupon" value={coupon} onChange={(event) => setCoupon(event.target.value)} />
              <button type="submit" className="button button-secondary" disabled={busyId === 'coupon' || !isAuthenticated}>Apply coupon</button>
            </form>
            {!isAuthenticated && <p className="account-muted">Coupons and stock reservation are available after sign in.</p>}
            {cart.coupon && <p className="account-muted">Applied: {cart.coupon.code}</p>}

            <Link to={isAuthenticated ? '/checkout' : '/login'} state={isAuthenticated ? undefined : { from: { pathname: '/checkout' } }} className="button button-primary cart-checkout-link">
              {isAuthenticated ? 'Checkout' : 'Sign in to checkout'}
            </Link>
            <button type="button" className="account-link-button cart-clear-button" onClick={() => void clearCart()} disabled={busyId === 'clear'}>Clear cart</button>
          </aside>
        </div>
      )}
    </section>
  );
}
