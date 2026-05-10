import { mapOrder } from './account';
import { apiClient } from '../lib/apiClient';
import type { Cart, CartItem, Order, Product, ProductVariant } from '../types/domain';

interface BackendCartItem {
  id: string | number;
  cart_id: string | number;
  product_id: string | number;
  variant_id: string | number;
  quantity: number;
  unit_price: number | string;
  line_total: number | string;
  product: {
    id: string | number;
    name: string;
    slug: string;
    is_active: boolean;
    base_price: number | string;
  };
  variant: {
    id: string | number;
    sku: string;
    color?: string | null;
    size?: string | null;
    material?: string | null;
    price: number | string;
    compare_at_price?: number | string | null;
    inventory_quantity: number;
    is_active: boolean;
  };
  image?: {
    image_url: string;
    alt_text?: string | null;
  } | null;
  created_at?: string;
  updated_at?: string;
}

interface BackendCart {
  id: string | number;
  user_id: string | number;
  items: BackendCartItem[];
  coupon?: {
    code: string;
    type: string;
    value: number | string;
    min_purchase_amount?: number | string;
    free_shipping: boolean;
    applied_at?: string;
  } | null;
  summary: {
    unique_items: number;
    item_count: number;
    subtotal: number | string;
    discount_amount?: number | string;
    free_shipping?: boolean;
    total?: number | string;
  };
  message?: string;
  created_at?: string;
  updated_at?: string;
}

interface BackendReservation {
  expires_at: string;
  reservations: Array<{
    id: string | number;
    user_id: string | number;
    variant_id: string | number;
    quantity: number;
    status: string;
    expires_at: string;
    created_at: string;
  }>;
}

interface BackendPaymentOrder {
  razorpay_order_id: string;
  amount_paise: number;
  currency: string;
  key_id: string;
  order_number: string;
}

interface BackendVerifyPayment {
  message: string;
  order_id: string | number;
}

const toNumber = (value: number | string | undefined | null) => Number(value ?? 0);

function mapCartItem(item: BackendCartItem): CartItem {
  const product: Product = {
    id: String(item.product.id),
    name: item.product.name,
    slug: item.product.slug,
    basePrice: toNumber(item.product.base_price),
    isActive: item.product.is_active,
    images: [],
    variants: [],
  };

  const variant: ProductVariant = {
    id: String(item.variant.id),
    productId: String(item.product_id),
    sku: item.variant.sku,
    color: item.variant.color ?? undefined,
    size: item.variant.size ?? undefined,
    material: item.variant.material ?? undefined,
    price: toNumber(item.variant.price),
    compareAtPrice: item.variant.compare_at_price == null ? null : toNumber(item.variant.compare_at_price),
    stockQuantity: item.variant.inventory_quantity,
    isActive: item.variant.is_active,
  };

  return {
    id: String(item.id),
    productId: String(item.product_id),
    variantId: String(item.variant_id),
    quantity: item.quantity,
    unitPrice: toNumber(item.unit_price),
    lineTotal: toNumber(item.line_total),
    product,
    variant,
    imageUrl: item.image?.image_url,
    imageAltText: item.image?.alt_text ?? undefined,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapCart(cart: BackendCart): Cart {
  const subtotal = toNumber(cart.summary.subtotal);
  const discountTotal = toNumber(cart.summary.discount_amount);
  const grandTotal = toNumber(cart.summary.total ?? cart.summary.subtotal);

  return {
    id: String(cart.id),
    items: cart.items.map(mapCartItem),
    couponCode: cart.coupon?.code,
    coupon: cart.coupon
      ? {
          code: cart.coupon.code,
          type: cart.coupon.type,
          value: toNumber(cart.coupon.value),
          minPurchaseAmount: toNumber(cart.coupon.min_purchase_amount),
          freeShipping: cart.coupon.free_shipping,
          appliedAt: cart.coupon.applied_at,
        }
      : null,
    totals: {
      subtotal,
      discountTotal,
      shippingTotal: 0,
      grandTotal,
    },
    itemCount: cart.summary.item_count,
    uniqueItems: cart.summary.unique_items,
    message: cart.message,
  };
}

export const cartApi = {
  async getCart(): Promise<Cart> {
    const res = await apiClient.get<BackendCart>('/cart');
    return mapCart(res.data);
  },

  async addItem(variantId: string, quantity = 1): Promise<Cart> {
    const res = await apiClient.post<BackendCart>('/cart/items', { variantId, quantity });
    return mapCart(res.data);
  },

  async updateItemQuantity(itemId: string, quantity: number): Promise<Cart> {
    const res = await apiClient.put<BackendCart>(`/cart/items/${itemId}`, { quantity });
    return mapCart(res.data);
  },

  async removeItem(itemId: string): Promise<Cart> {
    const res = await apiClient.delete<BackendCart>(`/cart/items/${itemId}`);
    return mapCart(res.data);
  },

  async clearCart(): Promise<Cart> {
    const res = await apiClient.delete<BackendCart>('/cart');
    return mapCart(res.data);
  },

  async applyCoupon(code: string): Promise<Cart> {
    const res = await apiClient.post<BackendCart>('/cart/coupon', { code });
    return mapCart(res.data);
  },

  async reserveCheckoutStock(holdMinutes = 15): Promise<BackendReservation> {
    const res = await apiClient.post<BackendReservation>('/inventory/reservations/checkout', { holdMinutes });
    return res.data;
  },

  async placeOrder(shippingAddressId: string): Promise<Order> {
    const res = await apiClient.post<Parameters<typeof mapOrder>[0]>('/orders', { shippingAddressId });
    return mapOrder(res.data);
  },

  async createPaymentOrder(orderId: string): Promise<BackendPaymentOrder> {
    const res = await apiClient.post<BackendPaymentOrder>('/payments/create-order', { orderId });
    return res.data;
  },

  async verifyPayment(payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<BackendVerifyPayment> {
    const res = await apiClient.post<BackendVerifyPayment>('/payments/verify', payload);
    return res.data;
  },
};
