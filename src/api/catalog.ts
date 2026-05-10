import { apiClient } from '../lib/apiClient';
import type { Category, PaginatedResponse, Product, ProductImage, ProductVariant } from '../types/domain';

export type CatalogSort = 'newest' | 'price_asc' | 'price_desc' | 'popularity';

export interface ProductFilters {
  q?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: string;
  maxPrice?: string;
  sizes?: string;
  colors?: string;
  sort?: CatalogSort;
  page?: number;
  limit?: number;
}

interface BackendCategory {
  id: string | number;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | number | null;
  image_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BackendProductImage {
  id: string | number;
  product_id?: string | number;
  variant_id?: string | number | null;
  image_url: string;
  cloudinary_public_id?: string | null;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  sort_order?: number;
  created_at?: string;
}

interface BackendProductVariant {
  id: string | number;
  product_id: string | number;
  sku: string;
  color?: string | null;
  size?: string | null;
  material?: string | null;
  price: number | string;
  compare_at_price?: number | string | null;
  inventory_quantity: number;
  low_stock_threshold?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BackendProductAttribute {
  name: string;
  value: string;
}

interface BackendProduct {
  id: string | number;
  category_id?: string | number;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  description?: string | null;
  base_price?: number | string;
  popularity_score?: number;
  min_price?: number | string;
  max_price?: number | string;
  total_inventory?: number | string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  rating?: {
    average?: number | string | null;
    count?: number;
  };
  variants: BackendProductVariant[];
  images: BackendProductImage[];
  attributes: BackendProductAttribute[];
}

interface BackendProductList {
  products: BackendProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const toNumber = (value: number | string | undefined | null) =>
  value === undefined || value === null ? undefined : Number(value);

export function mapCategory(category: BackendCategory): Category {
  return {
    id: String(category.id),
    name: category.name,
    slug: category.slug,
    description: category.description ?? undefined,
    parentId: category.parent_id == null ? null : String(category.parent_id),
    imageUrl: category.image_url ?? undefined,
    isActive: category.is_active,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
  };
}

function mapImage(image: BackendProductImage, index: number): ProductImage {
  return {
    id: String(image.id),
    productId: image.product_id == null ? undefined : String(image.product_id),
    variantId: image.variant_id == null ? null : String(image.variant_id),
    url: image.image_url,
    cloudinaryPublicId: image.cloudinary_public_id ?? undefined,
    width: image.width,
    height: image.height,
    altText: image.alt_text ?? undefined,
    sortOrder: image.sort_order ?? index,
    isPrimary: index === 0,
    createdAt: image.created_at,
  };
}

function mapVariant(variant: BackendProductVariant): ProductVariant {
  return {
    id: String(variant.id),
    productId: String(variant.product_id),
    sku: variant.sku,
    color: variant.color ?? undefined,
    size: variant.size ?? undefined,
    material: variant.material ?? undefined,
    price: Number(variant.price),
    compareAtPrice: toNumber(variant.compare_at_price) ?? null,
    stockQuantity: variant.inventory_quantity,
    lowStockThreshold: variant.low_stock_threshold,
    isActive: variant.is_active,
    createdAt: variant.created_at,
    updatedAt: variant.updated_at,
  };
}

function mapAttributes(attributes: BackendProductAttribute[]) {
  return attributes.reduce<Record<string, string>>((acc, attribute) => {
    acc[attribute.name] = attribute.value;
    return acc;
  }, {});
}

export function mapProduct(product: BackendProduct): Product {
  return {
    id: String(product.id),
    categoryId: product.category_id == null ? undefined : String(product.category_id),
    categoryName: product.category_name,
    categorySlug: product.category_slug,
    name: product.name,
    slug: product.slug,
    description: product.description ?? undefined,
    basePrice: toNumber(product.base_price),
    popularityScore: product.popularity_score,
    minPrice: toNumber(product.min_price),
    maxPrice: toNumber(product.max_price),
    totalInventory: toNumber(product.total_inventory),
    isActive: product.is_active,
    averageRating: toNumber(product.rating?.average),
    reviewCount: product.rating?.count ?? 0,
    variants: product.variants.map(mapVariant),
    images: product.images.map(mapImage),
    attributes: mapAttributes(product.attributes ?? []),
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

const appendParam = (params: URLSearchParams, key: string, value?: string | number) => {
  if (value === undefined || value === '') return;
  params.set(key, String(value));
};

export const catalogApi = {
  async listCategories(): Promise<Category[]> {
    const res = await apiClient.get<BackendCategory[]>('/categories', { skipAuth: true });
    return res.data.map(mapCategory);
  },

  async getCategory(categoryId: string): Promise<Category> {
    const res = await apiClient.get<BackendCategory>(`/categories/${categoryId}`, { skipAuth: true });
    return mapCategory(res.data);
  },

  async listProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    appendParam(params, 'q', filters.q);
    appendParam(params, 'categoryId', filters.categoryId);
    appendParam(params, 'categorySlug', filters.categorySlug);
    appendParam(params, 'minPrice', filters.minPrice);
    appendParam(params, 'maxPrice', filters.maxPrice);
    appendParam(params, 'sizes', filters.sizes);
    appendParam(params, 'colors', filters.colors);
    appendParam(params, 'sort', filters.sort ?? 'newest');
    appendParam(params, 'page', filters.page ?? 1);
    appendParam(params, 'limit', filters.limit ?? 12);

    const res = await apiClient.get<BackendProductList>(`/products?${params.toString()}`, { skipAuth: true });
    return {
      items: res.data.products.map(mapProduct),
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      total: res.data.pagination.total,
      totalPages: res.data.pagination.totalPages,
    };
  },

  async getProduct(productId: string): Promise<Product> {
    const res = await apiClient.get<BackendProduct>(`/products/${productId}`, { skipAuth: true });
    return mapProduct(res.data);
  },
};
