import { apiClient } from '../lib/apiClient';
import { mapOrder } from './account';
import { mapCategory, mapProduct } from './catalog';
import { mapUser } from './auth';
import type { Category, Order, PaginatedResponse, Product, User, UserRole } from '../types/domain';

type BackendProduct = Parameters<typeof mapProduct>[0];
type BackendCategory = Parameters<typeof mapCategory>[0];
type BackendOrder = Parameters<typeof mapOrder>[0];
type BackendUser = Parameters<typeof mapUser>[0] & {
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface BackendProductList {
  products: BackendProduct[];
  pagination: BackendPagination;
}

interface BackendOrderList {
  orders: Array<BackendOrder & { user?: { name?: string; email?: string } | null }>;
  pagination: BackendPagination;
}

interface BackendUserList {
  users: BackendUser[];
  pagination: BackendPagination;
}

export interface AdminProductPayload {
  categoryId: string;
  name: string;
  slug?: string;
  description: string;
  basePrice: number;
  popularityScore?: number;
  isActive: boolean;
  variants: Array<{
    sku: string;
    color: string;
    size: string;
    material?: string;
    price: number;
    compareAtPrice?: number | null;
    inventoryQuantity: number;
    lowStockThreshold?: number;
    isActive: boolean;
  }>;
  images: Array<{
    imageUrl: string;
    altText?: string;
    sortOrder?: number;
  }>;
  attributes?: Array<{ name: string; value: string }>;
}

export interface AdminCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  imageUrl?: string;
  isActive: boolean;
}

export interface AdminLowStockVariant {
  variantId: string;
  productId: string;
  productName: string;
  productSlug?: string;
  sku: string;
  color?: string;
  size?: string;
  material?: string;
  inventoryQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
}

export interface AdminUser extends User {
  isActive?: boolean;
}

export interface AdminOrder extends Order {
  user?: { name?: string; email?: string } | null;
}

const toPagination = <T>(items: T[], pagination: BackendPagination): PaginatedResponse<T> => ({
  items,
  page: pagination.page,
  limit: pagination.limit,
  total: pagination.total,
  totalPages: pagination.totalPages,
});

const mapAdminUser = (user: BackendUser): AdminUser => ({
  ...mapUser(user),
  isActive: user.is_active,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const mapAdminOrder = (order: BackendOrder & { user?: { name?: string; email?: string } | null }): AdminOrder => ({
  ...mapOrder(order),
  user: order.user ?? null,
});

const mapLowStockVariant = (variant: {
  variant_id: string | number;
  product_id: string | number;
  product_name: string;
  product_slug?: string;
  sku: string;
  color?: string | null;
  size?: string | null;
  material?: string | null;
  inventory_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  low_stock_threshold: number;
}): AdminLowStockVariant => ({
  variantId: String(variant.variant_id),
  productId: String(variant.product_id),
  productName: variant.product_name,
  productSlug: variant.product_slug,
  sku: variant.sku,
  color: variant.color ?? undefined,
  size: variant.size ?? undefined,
  material: variant.material ?? undefined,
  inventoryQuantity: variant.inventory_quantity,
  reservedQuantity: variant.reserved_quantity,
  availableQuantity: variant.available_quantity,
  lowStockThreshold: variant.low_stock_threshold,
});

export const adminApi = {
  async listProducts(params: { q?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    query.set('all', 'true');
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));
    query.set('sort', 'newest');
    if (params.q) query.set('q', params.q);

    const res = await apiClient.get<BackendProductList>(`/products?${query.toString()}`);
    return toPagination(res.data.products.map(mapProduct), res.data.pagination);
  },

  async createProduct(payload: AdminProductPayload): Promise<Product> {
    const res = await apiClient.post<BackendProduct>('/products', payload);
    return mapProduct(res.data);
  },

  async updateProduct(productId: string, payload: AdminProductPayload): Promise<Product> {
    const res = await apiClient.put<BackendProduct>(`/products/${productId}`, payload);
    return mapProduct(res.data);
  },

  async deleteProduct(productId: string): Promise<void> {
    await apiClient.delete(`/products/${productId}`);
  },

  async updateProductStatus(productId: string, isActive: boolean): Promise<void> {
    await apiClient.patch('/products/bulk/status', { productIds: [productId], isActive });
  },

  async listCategories(): Promise<Category[]> {
    const res = await apiClient.get<BackendCategory[]>('/categories');
    return res.data.map(mapCategory);
  },

  async createCategory(payload: AdminCategoryPayload): Promise<Category> {
    const res = await apiClient.post<BackendCategory>('/categories', payload);
    return mapCategory(res.data);
  },

  async updateCategory(categoryId: string, payload: AdminCategoryPayload): Promise<Category> {
    const res = await apiClient.put<BackendCategory>(`/categories/${categoryId}`, payload);
    return mapCategory(res.data);
  },

  async deleteCategory(categoryId: string): Promise<void> {
    await apiClient.delete(`/categories/${categoryId}`);
  },

  async listOrders(params: { q?: string; status?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));
    if (params.q) query.set('q', params.q);
    if (params.status) query.set('status', params.status);

    const res = await apiClient.get<BackendOrderList>(`/orders/admin?${query.toString()}`);
    return toPagination(res.data.orders.map(mapAdminOrder), res.data.pagination);
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const res = await apiClient.patch<BackendOrder>(`/orders/${orderId}/status`, { status });
    return mapOrder(res.data);
  },

  async listUsers(params: { q?: string; role?: UserRole | ''; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));
    if (params.q) query.set('q', params.q);
    if (params.role) query.set('role', params.role);

    const res = await apiClient.get<BackendUserList>(`/users/admin/users?${query.toString()}`);
    return toPagination(res.data.users.map(mapAdminUser), res.data.pagination);
  },

  async updateUserRole(userId: string, role: UserRole): Promise<AdminUser> {
    const res = await apiClient.patch<BackendUser>(`/users/admin/users/${userId}/role`, { role });
    return mapAdminUser(res.data);
  },

  async setUserActive(userId: string, isActive: boolean): Promise<AdminUser> {
    const res = await apiClient.patch<BackendUser>(`/users/admin/users/${userId}/active`, { isActive });
    return mapAdminUser(res.data);
  },

  async listLowStock(threshold?: string): Promise<AdminLowStockVariant[]> {
    const query = threshold ? `?threshold=${encodeURIComponent(threshold)}` : '';
    const res = await apiClient.get<Array<Parameters<typeof mapLowStockVariant>[0]>>(`/inventory/low-stock${query}`);
    return res.data.map(mapLowStockVariant);
  },
};
