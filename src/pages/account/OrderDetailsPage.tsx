import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { accountApi } from '../../api/account';
import { ErrorState, LoadingState } from '../../components/ui/AsyncState';
import { ApiError } from '../../lib/apiClient';
import type { Order } from '../../types/domain';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));

const getErrorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Could not load this order. Please try again.';

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrder = useCallback(async () => {
    await Promise.resolve();
    if (!id) {
      setError('Order ID is missing.');
      setLoading(false);
      return;
    }

    setError('');
    try {
      const freshOrder = await accountApi.getOrder(id);
      setOrder(freshOrder);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      void loadOrder();
    }, 0);

    return () => globalThis.clearTimeout(timer);
  }, [loadOrder]);

  if (loading) {
    return (
      <section className="account-page">
        <LoadingState title="Loading order" />
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="account-page">
        <ErrorState title="Order unavailable" message={error} action={{ label: 'Try again', onClick: loadOrder }} />
      </section>
    );
  }

  return (
    <section className="account-page">
      <div className="account-heading">
        <Link to="/orders" className="account-back-link">Back to orders</Link>
        <span className="eyebrow">{order.orderNumber ?? `Order ${order.id}`}</span>
        <h1>Order details</h1>
        <p>{formatDate(order.placedAt ?? order.createdAt)} · <span className={`order-status order-status-${order.status}`}>{order.status}</span></p>
      </div>

      <div className="order-details-grid">
        <div className="account-panel">
          <div className="account-panel-heading">
            <h2>Items</h2>
            <span>{order.items.length} item{order.items.length === 1 ? '' : 's'}</span>
          </div>
          <div className="order-items">
            {order.items.map((item) => (
              <article className="order-item" key={item.id}>
                <div>
                  <strong>{item.productName}</strong>
                  <span>
                    {[item.variantColor, item.variantSize, item.variantMaterial, item.variantSku].filter(Boolean).join(' · ')}
                  </span>
                </div>
                <span>Qty {item.quantity}</span>
                <strong>{money.format(item.total)}</strong>
              </article>
            ))}
          </div>
        </div>

        <aside className="account-panel order-summary">
          <h2>Summary</h2>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{money.format(order.subtotal ?? order.totals.subtotal)}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>-{money.format(order.discountAmount ?? order.totals.discountTotal)}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{money.format(order.total ?? order.totals.grandTotal)}</dd>
            </div>
          </dl>
          {order.coupon && (
            <p className="account-muted">Coupon applied: {order.coupon.code}</p>
          )}
        </aside>

        <div className="account-panel order-address">
          <h2>Shipping address</h2>
          <p>
            {order.shippingAddress.fullName}<br />
            {order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
            {order.shippingAddress.country} · {order.shippingAddress.phone}
          </p>
        </div>
      </div>
    </section>
  );
}
