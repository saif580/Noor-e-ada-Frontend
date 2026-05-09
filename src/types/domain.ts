export type ID = string;

export type UserRole = 'customer' | 'admin';

export interface User {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isEmailVerified: boolean;
}

export interface Address {
  id: ID;
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

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  parentId?: ID | null;
  imageUrl?: string;
}

export interface ProductImage {
  id: ID;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: ID;
  productId: ID;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
}

export interface Product {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  categoryId?: ID;
  averageRating?: number;
  reviewCount?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes?: Record<string, string>;
  createdAt?: string;
}

export interface CartItem {
  id: ID;
  productId: ID;
  variantId: ID;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

export interface CartTotals {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  grandTotal: number;
}

export interface Cart {
  id: ID;
  items: CartItem[];
  couponCode?: string;
  totals: CartTotals;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: ID;
  productId: ID;
  variantId: ID;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: ID;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  totals: CartTotals;
  createdAt: string;
}

export interface Review {
  id: ID;
  productId: ID;
  userId: ID;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface WishlistItem {
  id: ID;
  productId: ID;
  product: Product;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}
