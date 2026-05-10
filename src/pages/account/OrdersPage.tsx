import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { accountApi } from '../../api/account';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState';
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
  err instanceof ApiError ? err.message : 'Could not load orders. Please try again.';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    await Promise.resolve();
    setError('');
    try {
      const freshOrders = await accountApi.listOrders();
      setOrders(freshOrders);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => globalThis.clearTimeout(timer);
  }, [loadOrders]);

  return (
    <section className="account-page">
      <div className="account-heading">
        <span className="eyebrow">Purchase history</span>
        <h1>Orders</h1>
        <p>Track your recent Noor-e-ada purchases and view delivery details.</p>
      </div>

      {loading && <LoadingState title="Loading orders" />}
      {!loading && error && <ErrorState title="Orders unavailable" message={error} action={{ label: 'Try again', onClick: loadOrders }} />}
      {!loading && !error && orders.length === 0 && (
        <EmptyState
          title="No orders yet"
          message="Your placed orders will appear here after checkout."
          action={{ label: 'Shop bestsellers', onClick: () => { globalThis.location.href = '/#bestsellers'; } }}
        />
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="order-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div>
                <span className="order-label">{order.orderNumber ?? `Order ${order.id}`}</span>
                <h2>{money.format(order.total ?? order.totals.grandTotal)}</h2>
                <p>
                  {formatDate(order.placedAt ?? order.createdAt)} · {order.items.length} item{order.items.length === 1 ? '' : 's'}
                </p>
              </div>
              <span className={`order-status order-status-${order.status}`}>{order.status}</span>
              <Link className="button button-secondary" to={`/orders/${order.id}`}>
                View details
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
