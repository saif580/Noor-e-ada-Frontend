const returnRules = [
  {
    title: '7-day exchange window',
    detail: 'Eligible items can be exchanged within 7 days of delivery if unused, unworn, and returned with tags.',
  },
  {
    title: 'Non-returnable items',
    detail: 'Customized pieces, final sale styles, used products, and items without original packaging are not eligible.',
  },
  {
    title: 'Refund method',
    detail: 'Approved prepaid refunds are processed back to the original payment method after quality inspection.',
  },
] as const;

export function ReturnsPage() {
  return (
    <section className="catalog-page info-page">
      <div className="account-heading info-heading">
        <span className="eyebrow">Returns</span>
        <h1>Simple exchanges for eligible styles.</h1>
        <p>Use this page to understand exchange eligibility before placing or returning an order.</p>
      </div>

      <div className="info-grid">
        {returnRules.map((item) => (
          <article key={item.title} className="info-card">
            <h2>{item.title}</h2>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="info-note">
        <strong>Start a return</strong>
        <p>Contact customer care with your order number, item name, delivery date, and reason for exchange.</p>
      </div>
    </section>
  );
}
