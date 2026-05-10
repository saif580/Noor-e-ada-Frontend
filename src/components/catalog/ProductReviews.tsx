import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useReviews } from '../../hooks/useReviews';
import { EmptyState, ErrorState, LoadingState } from '../ui/AsyncState';
import { RatingSummary } from './RatingSummary';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';

export function ProductReviews({ productId }: Readonly<{ productId: string }>) {
  const { isAuthenticated } = useAuth();
  const {
    reviews, rating, pagination,
    loading, error,
    submitting, submitError, submitSuccess, userHasReviewed,
    goToPage, submitReview,
  } = useReviews(productId);

  const showForm = isAuthenticated && !userHasReviewed;

  return (
    <section className="product-reviews">
      <h2 className="product-reviews-heading">Customer Reviews</h2>

      {/* Rating aggregate */}
      <RatingSummary average={rating.average} count={rating.count} />

      {/* ── Submission area ── */}
      {showForm && (
        <ReviewForm
          submitting={submitting}
          submitError={submitError}
          submitSuccess={submitSuccess}
          onSubmit={submitReview}
        />
      )}

      {userHasReviewed && !submitSuccess && (
        <div className="review-already">
          ✓ You have already reviewed this product.
        </div>
      )}

      {!isAuthenticated && (
        <div className="review-auth-prompt">
          <Link to="/login">Sign in</Link> to share your experience with this product.
        </div>
      )}

      {/* ── Reviews list ── */}
      {loading && <LoadingState message="Loading reviews…" />}

      {!loading && error && (
        <ErrorState
          title="Couldn't load reviews"
          message={error}
          action={{ label: 'Retry', onClick: () => goToPage(pagination.page) }}
        />
      )}

      {!loading && !error && reviews.length === 0 && (
        <EmptyState
          title="No reviews yet"
          message="Be the first to share your experience."
        />
      )}

      {!loading && !error && reviews.length > 0 && (
        <>
          <div className="review-list">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <nav className="reviews-pagination" aria-label="Review pages">
              <button
                type="button"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                aria-label="Previous page"
              >
                ← Prev
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  type="button"
                  className={page === pagination.page ? 'is-current' : undefined}
                  onClick={() => goToPage(page)}
                  aria-label={`Page ${page}`}
                  aria-current={page === pagination.page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                aria-label="Next page"
              >
                Next →
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
