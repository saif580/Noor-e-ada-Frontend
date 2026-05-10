import { StarRating } from './StarRating';

interface RatingSummaryProps {
  average: number;
  count: number;
}

export function RatingSummary({ average, count }: Readonly<RatingSummaryProps>) {
  if (count === 0) return null;

  return (
    <div className="rating-summary">
      <div className="rating-score">
        <span className="rating-score-number">{average.toFixed(1)}</span>
        <StarRating value={average} size="md" />
        <span className="rating-score-count">
          {count} review{count !== 1 ? 's' : ''}
        </span>
      </div>
      <p className="rating-summary-label">
        Based on verified customer purchases
      </p>
    </div>
  );
}
