import { FormField } from '../ui/FormField';

export function NewsletterSection() {
  return (
    <section id="contact" className="newsletter-section reveal">
      <span className="eyebrow">Private sale access</span>
      <h2>Get first look at new drops.</h2>
      <form onSubmit={(event) => event.preventDefault()}>
        <FormField
          label="Email address"
          name="newsletterEmail"
          type="email"
          placeholder="Email address"
          autoComplete="email"
        />
        <button type="submit">Notify me</button>
      </form>
    </section>
  );
}
