import { apiClient } from '../lib/apiClient';
import type { Review } from '../types/domain';

/* ── Backend shape (snake_case) ── */
interface BackendReview {
  id: string;
  product_id: string;
  user_id: string;
  reviewer_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  updated_at: string;
}

interface BackendReviewsData {
  reviews: BackendReview[];
  rating: { average: number; count: number };
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/* ── Frontend shape ── */
export type ReviewWithAuthor = Review & { reviewerName: string };

export interface ReviewsPage {
  reviews: ReviewWithAuthor[];
  rating: { average: number; count: number };
  pagination: { page: number; totalPages: number; total: number };
}

export interface SubmitReviewPayload {
  rating: number;
  title?: string;
  body?: string;
}

/* ── Mapper ── */
function mapReview(r: BackendReview): ReviewWithAuthor {
  return {
    id: r.id,
    productId: r.product_id,
    userId: r.user_id,
    reviewerName: r.reviewer_name,
    rating: r.rating,
    title: r.title ?? undefined,
    comment: r.body ?? undefined,
    createdAt: r.created_at,
  };
}

/* ── API calls ── */
export const reviewsApi = {
  async getReviews(productId: string, page = 1, limit = 10): Promise<ReviewsPage> {
    const res = await apiClient.get<BackendReviewsData>(
      `/products/${productId}/reviews?page=${page}&limit=${limit}`,
      { skipAuth: true },
    );
    return {
      reviews: res.data.reviews.map(mapReview),
      rating: res.data.rating,
      pagination: {
        page: res.data.pagination.page,
        totalPages: res.data.pagination.totalPages,
        total: res.data.pagination.total,
      },
    };
  },

  async submitReview(
    productId: string,
    payload: SubmitReviewPayload,
  ): Promise<{ review: ReviewWithAuthor; rating: { average: number; count: number } }> {
    const res = await apiClient.post<{
      review: BackendReview;
      rating: { average: number; count: number };
    }>(`/products/${productId}/reviews`, payload);
    return {
      review: mapReview(res.data.review),
      rating: res.data.rating,
    };
  },
};
