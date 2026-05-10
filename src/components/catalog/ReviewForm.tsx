import { type FormEvent, useState } from 'react';
import type { SubmitReviewPayload } from '../../api/reviews';
import { FormField } from '../ui/FormField';
import { StarRating } from './StarRating';

interface ReviewFormProps {
  submitting: boolean;
  submitError: string;
  submitSuccess: boolean;
  onSubmit: (payload: SubmitReviewPayload) => void;
}

export function ReviewForm({
  submitting,
  submitError,
  submitSuccess,
  onSubmit,
}: Readonly<ReviewFormProps>) {
  const [rating, setRating]           = useState(0);
  const [title, setTitle]             = useState('');
  const [body, setBody]               = useState('');
  const [ratingError, setRatingError] = useState('');

  if (submitSuccess) {
    return (
      <output className="review-already">
        ✓ Your review has been submitted — thank you!
      </output>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setRatingError('Please select a star rating before submitting.');
      return;
    }
    setRatingError('');
    onSubmit({
      rating,
      title: title.trim() || undefined,
      body:  body.trim()  || undefined,
    });
  }

  return (
    <div className="review-form">
      <h3 className="review-form-title">Write a review</h3>

      {submitError && (
        <p className="auth-error" role="alert" style={{ marginBottom: '16px' }}>
          {submitError}
        </p>
      )}

      <form className="review-form-fields" onSubmit={handleSubmit} noValidate>
        {/* Star picker */}
        <div className="review-form-rating">
          <span className="review-form-rating-label">Your rating *</span>
          <StarRating value={rating} onChange={setRating} size="lg" />
          {ratingError && (
            <small className="review-rating-error">{ratingError}</small>
          )}
        </div>

        <FormField
          label="Title (optional)"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Summarise your experience"
          maxLength={120}
        />

        <label className="form-textarea">
          <span>Your review (optional)</span>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Tell other shoppers what you thought about this product…"
            rows={4}
            maxLength={2000}
          />
        </label>

        <button
          type="submit"
          className="button button-primary review-form-submit"
          disabled={submitting}
        >
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
      </form>
    </div>
  );
}
