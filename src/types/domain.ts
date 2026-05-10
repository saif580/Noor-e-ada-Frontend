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
  isMarketingOptIn?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  parentId?: ID | null;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: ID;
  productId?: ID;
  variantId?: ID | null;
  url: string;
  cloudinaryPublicId?: string;
  width?: number | null;
  height?: number | null;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt?: string;
}

export interface ProductVariant {
  id: ID;
  productId: ID;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  categoryId?: ID;
  categoryName?: string;
  categorySlug?: string;
  basePrice?: number;
  minPrice?: number;
  maxPrice?: number;
  totalInventory?: number;
  isActive?: boolean;
  popularityScore?: number;
  averageRating?: number;
  reviewCount?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: ID;
  productId: ID;
  variantId: ID;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
  product: Product;
  variant: ProductVariant;
  imageUrl?: string;
  imageAltText?: string;
  createdAt?: string;
  updatedAt?: string;
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
  coupon?: {
    code: string;
    type: string;
    value: number;
    minPurchaseAmount?: number;
    freeShipping: boolean;
    appliedAt?: string;
  } | null;
  totals: CartTotals;
  itemCount?: number;
  uniqueItems?: number;
  message?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: ID;
  productId: ID;
  variantId?: ID;
  productName: string;
  productSlug?: string;
  sku?: string;
  variantSku?: string;
  variantColor?: string;
  variantSize?: string;
  variantMaterial?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt?: string;
}

export interface Order {
  id: ID;
  userId?: ID;
  orderNumber?: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  totals: CartTotals;
  subtotal?: number;
  discountAmount?: number;
  total?: number;
  coupon?: {
    code: string;
    type: string;
    value: number;
    freeShipping: boolean;
  } | null;
  placedAt?: string;
  createdAt: string;
  updatedAt?: string;
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
