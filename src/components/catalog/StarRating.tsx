import { useState } from 'react';

const STARS = [1, 2, 3, 4, 5] as const;

const LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
};

const PX: Record<string, number> = { sm: 14, md: 18, lg: 28 };

interface StarRatingProps {
  value: number;
  /** When provided the component becomes an interactive star-picker */
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const fontSize = PX[size] ?? 18;
  const isInteractive = Boolean(onChange);

  if (!isInteractive) {
    const filled = Math.round(value);
    return (
      <span
        className="star-display"
        aria-label={`${value.toFixed(1)} out of 5 stars`}
        style={{ '--star-size': `${fontSize}px` } as React.CSSProperties}
      >
        {STARS.map(n => (
          <span key={n} className={`star ${n <= filled ? 'star-full' : 'star-empty'}`}>
            {n <= filled ? '★' : '☆'}
          </span>
        ))}
      </span>
    );
  }

  const active = hover || value;

  return (
    <div
      className="star-picker"
      role="radiogroup"
      aria-label="Select a star rating"
      onMouseLeave={() => setHover(0)}
    >
      {STARS.map(n => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n !== 1 ? 's' : ''} — ${LABELS[n]}`}
          className={`star-btn${n <= active ? ' active' : ''}`}
          style={{ fontSize }}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange?.(n)}
        >
          ★
        </button>
      ))}
      {active > 0 && (
        <span className="star-picker-label">{LABELS[active]}</span>
      )}
    </div>
  );
}
