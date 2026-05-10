import { apiClient } from '../lib/apiClient';
import type { Product, WishlistItem } from '../types/domain';

interface BackendWishlistItem {
  id: string | number;
  user_id: string | number;
  product_id: string | number;
  product: {
    id: string | number;
    name: string;
    slug: string;
    base_price: number | string;
    is_active: boolean;
  };
  image?: {
    image_url: string;
    alt_text?: string | null;
  } | null;
  created_at: string;
}

interface BackendWishlist {
  items: BackendWishlistItem[];
  total: number;
}

function mapWishlistProduct(item: BackendWishlistItem): Product {
  return {
    id: String(item.product.id),
    name: item.product.name,
    slug: item.product.slug,
    basePrice: Number(item.product.base_price),
    minPrice: Number(item.product.base_price),
    maxPrice: Number(item.product.base_price),
    isActive: item.product.is_active,
    images: item.image
      ? [{
          id: `wishlist-image-${item.id}`,
          url: item.image.image_url,
          altText: item.image.alt_text ?? item.product.name,
          sortOrder: 0,
          isPrimary: true,
        }]
      : [],
    variants: [],
  };
}

function mapWishlistItem(item: BackendWishlistItem): WishlistItem {
  return {
    id: String(item.id),
    productId: String(item.product_id),
    product: mapWishlistProduct(item),
    createdAt: item.created_at,
  };
}

export const wishlistApi = {
  async getWishlist(): Promise<WishlistItem[]> {
    const res = await apiClient.get<BackendWishlist>('/wishlist');
    return res.data.items.map(mapWishlistItem);
  },

  async addItem(productId: string): Promise<WishlistItem[]> {
    const res = await apiClient.post<BackendWishlist>('/wishlist', { productId });
    return res.data.items.map(mapWishlistItem);
  },

  async removeItem(wishlistItemId: string): Promise<WishlistItem[]> {
    const res = await apiClient.delete<BackendWishlist>(`/wishlist/${wishlistItemId}`);
    return res.data.items.map(mapWishlistItem);
  },
};
