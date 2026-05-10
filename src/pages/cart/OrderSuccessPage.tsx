import { Link, useParams } from 'react-router-dom';

export function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <section className="cart-page">
      <div className="order-success account-panel">
        <span className="eyebrow">Payment confirmed</span>
        <h1>Order placed</h1>
        <p>Your payment was verified and your Noor-e-ada order is now confirmed.</p>
        <div className="hero-actions">
          <Link to={id ? `/orders/${id}` : '/orders'} className="button button-primary">View order</Link>
          <Link to="/products" className="button button-secondary">Continue shopping</Link>
        </div>
      </div>
    </section>
  );
}
