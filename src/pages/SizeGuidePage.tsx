const sizeRows = [
  ['XS', '32', '26', '36'],
  ['S', '34', '28', '38'],
  ['M', '36', '30', '40'],
  ['L', '38', '32', '42'],
  ['XL', '40', '34', '44'],
  ['XXL', '42', '36', '46'],
] as const;

const fitTips = [
  'Measure over fitted clothing and keep the tape comfortably close to the body.',
  'For anarkali and kurta sets, choose by bust first, then alter waist if needed.',
  'For sarees and lehengas, check blouse measurements separately from skirt or drape length.',
] as const;

export function SizeGuidePage() {
  return (
    <section className="catalog-page info-page">
      <div className="account-heading info-heading">
        <span className="eyebrow">Size Guide</span>
        <h1>Find the right ethnic wear fit.</h1>
        <p>Use these body measurements as a starting point. Product-specific fit notes should take priority.</p>
      </div>

      <div className="size-guide-layout">
        <div className="info-card size-table-card">
          <h2>Women&apos;s size chart</h2>
          <div className="size-table-wrap">
            <table className="size-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Bust</th>
                  <th>Waist</th>
                  <th>Hip</th>
                </tr>
              </thead>
              <tbody>
                {sizeRows.map(([size, bust, waist, hip]) => (
                  <tr key={size}>
                    <td>{size}</td>
                    <td>{bust}&quot;</td>
                    <td>{waist}&quot;</td>
                    <td>{hip}&quot;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="info-card">
          <h2>Fit notes</h2>
          <ul className="info-list">
            {fitTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
