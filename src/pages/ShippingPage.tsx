const shippingSteps = [
  {
    title: 'Order processing',
    detail: 'Most ready styles are packed within 1-2 working days after payment confirmation.',
  },
  {
    title: 'Delivery timelines',
    detail: 'Metro deliveries usually arrive in 3-5 working days. Other locations can take 5-8 working days.',
  },
  {
    title: 'Tracking updates',
    detail: 'Tracking details are shared by email once your parcel is handed over to the courier partner.',
  },
] as const;

export function ShippingPage() {
  return (
    <section className="catalog-page info-page">
      <div className="account-heading info-heading">
        <span className="eyebrow">Shipping</span>
        <h1>Delivery made clear before checkout.</h1>
        <p>Review processing times, delivery windows, and tracking details for Noor-e-ada orders.</p>
      </div>

      <div className="info-grid">
        {shippingSteps.map((item) => (
          <article key={item.title} className="info-card">
            <h2>{item.title}</h2>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="info-note">
        <strong>Free shipping</strong>
        <p>Prepaid orders above ₹999 qualify for free standard shipping. COD availability depends on pincode serviceability.</p>
      </div>
    </section>
  );
}
