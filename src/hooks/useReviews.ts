import { useCallback, useEffect, useState } from 'react';
import { reviewsApi, type ReviewsPage, type ReviewWithAuthor, type SubmitReviewPayload } from '../api/reviews';
import { ApiError } from '../lib/apiClient';

interface ReviewsState {
  reviews: ReviewWithAuthor[];
  rating: ReviewsPage['rating'];
  pagination: ReviewsPage['pagination'];
  loading: boolean;
  error: string;
  submitting: boolean;
  submitError: string;
  submitSuccess: boolean;
  userHasReviewed: boolean;
}

const INITIAL: ReviewsState = {
  reviews: [],
  rating: { average: 0, count: 0 },
  pagination: { page: 1, totalPages: 1, total: 0 },
  loading: true,
  error: '',
  submitting: false,
  submitError: '',
  submitSuccess: false,
  userHasReviewed: false,
};

export function useReviews(productId: string) {
  const [state, setState] = useState<ReviewsState>(INITIAL);

  const load = useCallback(async (page: number) => {
    setState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const result = await reviewsApi.getReviews(productId, page);
      setState(prev => ({
        ...prev,
        loading: false,
        reviews: result.reviews,
        rating: result.rating,
        pagination: result.pagination,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof ApiError ? err.message : 'Could not load reviews.',
      }));
    }
  }, [productId]);

  useEffect(() => {
    void load(1);
  }, [load]);

  const submitReview = useCallback(async (payload: SubmitReviewPayload) => {
    setState(prev => ({ ...prev, submitting: true, submitError: '', submitSuccess: false }));
    try {
      const { rating } = await reviewsApi.submitReview(productId, payload);
      setState(prev => ({
        ...prev,
        submitting: false,
        submitSuccess: true,
        userHasReviewed: true,
        rating,
      }));
      // Reload page 1 so the new review appears
      void load(1);
    } catch (err) {
      const already = err instanceof ApiError && err.status === 409;
      setState(prev => ({
        ...prev,
        submitting: false,
        userHasReviewed: already ? true : prev.userHasReviewed,
        submitError: already
          ? 'You have already reviewed this product.'
          : err instanceof ApiError
          ? err.message
          : 'Could not submit your review. Please try again.',
      }));
    }
  }, [productId, load]);

  const goToPage = useCallback((page: number) => {
    void load(page);
  }, [load]);

  return { ...state, goToPage, submitReview };
}
