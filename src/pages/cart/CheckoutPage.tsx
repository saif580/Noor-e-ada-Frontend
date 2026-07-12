import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { accountApi } from '../../api/account';
import { cartApi } from '../../api/cart';
import { ErrorState, LoadingState } from '../../components/ui/AsyncState';
import { ApiError } from '../../lib/apiClient';
import type { Address, Cart, Order } from '../../types/domain';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const getErrorMessage = (err: unknown) =>
  err instanceof ApiError || err instanceof Error ? err.message : 'Checkout failed. Please try again.';

interface PaymentOrder {
  razorpay_order_id: string;
  amount_paise: number;
  currency: string;
  key_id: string;
  order_number: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  theme: { color: string };
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const loadRazorpayScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Could not load Razorpay checkout.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Razorpay checkout.'));
    document.body.appendChild(script);
  });

export function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [reservationExpiresAt, setReservationExpiresAt] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const loadCheckout = useCallback(async () => {
    await Promise.resolve();
    setError('');
    try {
      const [freshCart, freshAddresses] = await Promise.all([
        cartApi.getCart(),
        accountApi.listAddresses(),
      ]);
      setCart(freshCart);
      setAddresses(freshAddresses);
      setSelectedAddressId(
        freshAddresses.find((address) => address.isDefaultShipping)?.id ?? freshAddresses[0]?.id ?? '',
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      void loadCheckout();
    }, 0);
    return () => globalThis.clearTimeout(timer);
  }, [loadCheckout]);

  async function placeOrder() {
    if (!selectedAddressId) {
      setError('Select a shipping address before placing the order.');
      return;
    }

    setPlacing(true);
    setError('');
    try {
      const reservation = await cartApi.reserveCheckoutStock(15);
      setReservationExpiresAt(reservation.expires_at);
      const createdOrder = await cartApi.placeOrder(selectedAddressId);
      setOrder(createdOrder);
      const createdPaymentOrder = await cartApi.createPaymentOrder(createdOrder.id);
      setPaymentOrder(createdPaymentOrder);
      await openRazorpayCheckout(createdPaymentOrder);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  }

  async function openRazorpayCheckout(createdPaymentOrder = paymentOrder) {
    if (!createdPaymentOrder) return;
    setPaying(true);
    setError('');
    try {
      await loadRazorpayScript();
      if (!window.Razorpay) throw new Error('Razorpay checkout is unavailable.');

      const checkout = new window.Razorpay({
        key: createdPaymentOrder.key_id,
        amount: createdPaymentOrder.amount_paise,
        currency: createdPaymentOrder.currency,
        name: 'Noor-e-ada',
        description: createdPaymentOrder.order_number,
        order_id: createdPaymentOrder.razorpay_order_id,
        theme: { color: '#9b2f43' },
        modal: {
          ondismiss: () => setPaying(false),
        },
        handler: (response) => {
          void (async () => {
            try {
              const verified = await cartApi.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              navigate(`/order-success/${verified.order_id}`);
            } catch (err) {
              setError(getErrorMessage(err));
            } finally {
              setPaying(false);
            }
          })();
        },
      });
      checkout.open();
    } catch (err) {
      setError(getErrorMessage(err));
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <section className="cart-page">
        <LoadingState title="Loading checkout" />
      </section>
    );
  }

  if (error && !cart) {
    return (
      <section className="cart-page">
        <ErrorState title="Checkout unavailable" message={error} action={{ label: 'Try again', onClick: loadCheckout }} />
      </section>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="cart-page">
        <ErrorState title="Cart is empty" message="Add items before checkout." action={{ label: 'Go to cart', onClick: () => navigate('/cart') }} />
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="account-heading">
        <span className="eyebrow">Secure checkout</span>
        <h1>Checkout</h1>
        <p>Choose a saved address, reserve stock, place the order, then complete Razorpay test payment.</p>
      </div>

      {error && <p className="auth-error account-alert" role="alert">{error}</p>}

      <div className="checkout-layout">
        <div className="account-panel checkout-panel">
          <div className="account-panel-heading">
            <h2>Shipping address</h2>
            <Link to="/account">Manage</Link>
          </div>
          {addresses.length === 0 ? (
            <p className="account-muted">Add an address in your account before checkout.</p>
          ) : (
            <div className="checkout-address-list">
              {addresses.map((address) => (
                <label className="checkout-address-card" key={address.id}>
                  <input
                    type="radio"
                    name="shippingAddress"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                  />
                  <span>
                    <strong>{address.label}</strong>
                    {address.fullName}<br />
                    {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}<br />
                    {address.city}, {address.state} {address.postalCode}
                  </span>
                </label>
              ))}
            </div>
          )}

          <button type="button" className="button button-primary checkout-place-button" onClick={() => void placeOrder()} disabled={placing || paying || !selectedAddressId || Boolean(paymentOrder)}>
            {placing || paying ? 'Opening payment...' : paymentOrder ? 'Order placed' : 'Place order and pay'}
          </button>
          {reservationExpiresAt && <p className="account-muted">Stock reserved until {new Date(reservationExpiresAt).toLocaleTimeString('en-IN')}.</p>}
        </div>

        <aside className="cart-summary account-panel">
          <h2>Order total</h2>
          <dl>
            <div><dt>Subtotal</dt><dd>{money.format(cart.totals.subtotal)}</dd></div>
            <div><dt>Discount</dt><dd>-{money.format(cart.totals.discountTotal)}</dd></div>
            <div><dt>Total</dt><dd>{money.format(cart.totals.grandTotal)}</dd></div>
          </dl>
        </aside>

        {paymentOrder && order && (
          <div className="account-panel payment-panel">
            <div className="account-panel-heading">
              <h2>Razorpay payment</h2>
              <span>{paymentOrder.order_number}</span>
            </div>
            <p className="account-muted">
              Amount: {money.format(paymentOrder.amount_paise / 100)}. Use Razorpay test card <strong>4111 1111 1111 1111</strong>, any future expiry, any CVV, and any OTP in test mode.
            </p>
            <button type="button" className="button button-primary" onClick={() => void openRazorpayCheckout()} disabled={paying}>
              {paying ? 'Opening Razorpay...' : 'Pay with Razorpay'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
