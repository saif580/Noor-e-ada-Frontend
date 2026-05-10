import { mapUser } from './auth';
import { apiClient } from '../lib/apiClient';
import type { Address, Order, OrderItem, User } from '../types/domain';

interface BackendUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  is_email_verified: boolean;
  is_marketing_opt_in?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BackendAddress {
  id: string | number;
  label: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BackendOrderItem {
  id: string | number;
  product_id: string | number;
  variant_id?: string | number | null;
  product_name: string;
  product_slug?: string;
  variant_sku?: string;
  variant_color?: string | null;
  variant_size?: string | null;
  variant_material?: string | null;
  quantity: number;
  unit_price: number | string;
  line_total: number | string;
  created_at?: string;
}

interface BackendOrder {
  id: string | number;
  user_id?: string | number;
  order_number?: string;
  status: Order['status'];
  subtotal: number | string;
  discount_amount?: number | string;
  total: number | string;
  coupon?: {
    code: string;
    type: string;
    value: number | string;
    free_shipping?: boolean;
  } | null;
  shipping_address: {
    full_name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items: BackendOrderItem[];
  placed_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phone: string;
  isMarketingOptIn?: boolean;
}

export interface AddressPayload {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

const toNumber = (value: number | string | undefined) => Number(value ?? 0);

function mapAccountUser(user: BackendUser): User {
  return {
    ...mapUser(user),
    isMarketingOptIn: Boolean(user.is_marketing_opt_in),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

function mapAddress(address: BackendAddress): Address {
  return {
    id: String(address.id),
    label: address.label,
    fullName: address.full_name,
    phone: address.phone,
    addressLine1: address.address_line_1,
    addressLine2: address.address_line_2 ?? undefined,
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country,
    isDefaultShipping: address.is_default_shipping,
    isDefaultBilling: address.is_default_billing,
    createdAt: address.created_at,
    updatedAt: address.updated_at,
  };
}

function mapOrderItem(item: BackendOrderItem): OrderItem {
  return {
    id: String(item.id),
    productId: String(item.product_id),
    variantId: item.variant_id == null ? undefined : String(item.variant_id),
    productName: item.product_name,
    productSlug: item.product_slug,
    sku: item.variant_sku,
    variantSku: item.variant_sku,
    variantColor: item.variant_color ?? undefined,
    variantSize: item.variant_size ?? undefined,
    variantMaterial: item.variant_material ?? undefined,
    quantity: item.quantity,
    unitPrice: toNumber(item.unit_price),
    total: toNumber(item.line_total),
    createdAt: item.created_at,
  };
}

function mapOrder(order: BackendOrder): Order {
  const subtotal = toNumber(order.subtotal);
  const discountAmount = toNumber(order.discount_amount);
  const total = toNumber(order.total);

  return {
    id: String(order.id),
    userId: order.user_id == null ? undefined : String(order.user_id),
    orderNumber: order.order_number,
    status: order.status,
    subtotal,
    discountAmount,
    total,
    coupon: order.coupon
      ? {
          code: order.coupon.code,
          type: order.coupon.type,
          value: toNumber(order.coupon.value),
          freeShipping: Boolean(order.coupon.free_shipping),
        }
      : null,
    shippingAddress: {
      id: `shipping-${order.id}`,
      label: 'Shipping',
      fullName: order.shipping_address.full_name,
      phone: order.shipping_address.phone,
      addressLine1: order.shipping_address.address_line_1,
      addressLine2: order.shipping_address.address_line_2 ?? undefined,
      city: order.shipping_address.city,
      state: order.shipping_address.state,
      postalCode: order.shipping_address.postal_code,
      country: order.shipping_address.country,
      isDefaultShipping: false,
      isDefaultBilling: false,
    },
    items: order.items.map(mapOrderItem),
    totals: {
      subtotal,
      discountTotal: discountAmount,
      shippingTotal: 0,
      grandTotal: total,
    },
    placedAt: order.placed_at,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

export const addressToPayload = (address: Address): AddressPayload => ({
  label: address.label,
  fullName: address.fullName,
  phone: address.phone,
  addressLine1: address.addressLine1,
  addressLine2: address.addressLine2 ?? '',
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country,
  isDefaultShipping: address.isDefaultShipping,
  isDefaultBilling: address.isDefaultBilling,
});

export const accountApi = {
  async getProfile(): Promise<User> {
    const res = await apiClient.get<BackendUser>('/users/me');
    return mapAccountUser(res.data);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const res = await apiClient.put<BackendUser>('/users/me', payload);
    return mapAccountUser(res.data);
  },

  async listAddresses(): Promise<Address[]> {
    const res = await apiClient.get<BackendAddress[]>('/users/addresses');
    return res.data.map(mapAddress);
  },

  async createAddress(payload: AddressPayload): Promise<Address> {
    const res = await apiClient.post<BackendAddress>('/users/addresses', payload);
    return mapAddress(res.data);
  },

  async updateAddress(addressId: string, payload: AddressPayload): Promise<Address> {
    const res = await apiClient.put<BackendAddress>(`/users/addresses/${addressId}`, payload);
    return mapAddress(res.data);
  },

  async deleteAddress(addressId: string): Promise<void> {
    await apiClient.delete<{ message: string }>(`/users/addresses/${addressId}`);
  },

  async listOrders(): Promise<Order[]> {
    const res = await apiClient.get<BackendOrder[]>('/orders');
    return res.data.map(mapOrder);
  },

  async getOrder(orderId: string): Promise<Order> {
    const res = await apiClient.get<BackendOrder>(`/orders/${orderId}`);
    return mapOrder(res.data);
  },
};
