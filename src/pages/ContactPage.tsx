import { Link } from 'react-router-dom';

const contactMethods = [
  {
    label: 'Customer care',
    value: 'support@nooreada.com',
    detail: 'Order help, returns, size guidance, and delivery updates.',
    href: 'mailto:support@nooreada.com',
  },
  {
    label: 'WhatsApp',
    value: '+91 98765 43210',
    detail: 'Quick questions before checkout or after placing an order.',
    href: 'https://wa.me/919876543210',
  },
  {
    label: 'Studio hours',
    value: 'Mon-Sat, 10 AM-7 PM',
    detail: 'Responses usually arrive within one working day.',
    href: null,
  },
] as const;

export function ContactPage() {
  return (
    <section className="catalog-page contact-page">
      <div className="account-heading contact-heading">
        <span className="eyebrow">Contact Noor-e-ada</span>
        <h1>We are here to help with your order.</h1>
        <p>
          Reach out for styling help, delivery updates, exchanges, product details, or bulk occasion orders.
        </p>
      </div>

      <div className="contact-grid">
        <div className="contact-panel">
          <h2>Get in touch</h2>
          <div className="contact-method-list">
            {contactMethods.map((method) => (
              <div key={method.label} className="contact-method">
                <span>{method.label}</span>
                {method.href ? (
                  <a href={method.href}>{method.value}</a>
                ) : (
                  <strong>{method.value}</strong>
                )}
                <p>{method.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <form className="contact-panel contact-form">
          <h2>Send a message</h2>
          <label>
            <span>Name</span>
            <input type="text" name="name" placeholder="Your name" />
          </label>
          <label>
            <span>Email</span>
            <input type="email" name="email" placeholder="you@example.com" />
          </label>
          <label>
            <span>Message</span>
            <textarea name="message" rows={5} placeholder="Tell us what you need help with" />
          </label>
          <button type="button" className="button button-primary">Send message</button>
          <small>This form is a frontend placeholder until the contact API is added.</small>
        </form>
      </div>

      <div className="contact-support-band">
        <span>Need account or order history?</span>
        <Link to="/account" className="button button-secondary">Open account</Link>
      </div>
    </section>
  );
}
