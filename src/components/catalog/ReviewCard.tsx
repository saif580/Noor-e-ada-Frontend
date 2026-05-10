import type { ReviewWithAuthor } from '../../api/reviews';
import { StarRating } from './StarRating';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export function ReviewCard({ review }: Readonly<{ review: ReviewWithAuthor }>) {
  return (
    <article className="review-card">
      <div className="review-card-header">
        <div className="review-meta">
          <span className="review-author">{review.reviewerName}</span>
          <time className="review-date" dateTime={review.createdAt}>
            {fmtDate(review.createdAt)}
          </time>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>

      {review.title   && <h4 className="review-title">{review.title}</h4>}
      {review.comment && <p className="review-body">{review.comment}</p>}
    </article>
  );
}
