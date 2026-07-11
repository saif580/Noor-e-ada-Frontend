import type { Product } from '../../types/domain';

const sampleProductImages: Record<string, string> = {
  '1': '/sample-products/product-01-linen-summer-dress.jpg',
  '2': '/sample-products/product-02-evening-gown.jpg',
  '3': '/sample-products/product-03-cart-tee.jpg',
  '4': '/sample-products/product-04-cart-check-product.jpg',
  '5': '/sample-products/product-05-orders-product.jpg',
  '6': '/sample-products/product-06-orders-product.jpg',
  '7': '/sample-products/product-07-status-product.jpg',
  '9': '/sample-products/product-09-inventory-product.jpg',
  '10': '/sample-products/product-10-inventory-check-product.jpg',
  '11': '/sample-products/product-11-coupon-product.jpg',
  '12': '/sample-products/product-12-coupon-modes-product.jpg',
};

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function productPriceLabel(product: Product) {
  const min = product.minPrice ?? product.basePrice ?? product.variants[0]?.price ?? 0;
  const max = product.maxPrice ?? min;
  return min === max ? money.format(min) : `${money.format(min)} - ${money.format(max)}`;
}

export function getStockLabel(product: Product) {
  const total = product.totalInventory ?? product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
  const lowestThreshold = Math.min(...product.variants.map((variant) => variant.lowStockThreshold ?? 5), 5);

  if (total <= 0) return { label: 'Out of stock', tone: 'out' };
  if (total <= lowestThreshold) return { label: 'Low stock', tone: 'low' };
  return { label: 'In stock', tone: 'in' };
}

export function getSampleProductImage(productId: string) {
  return sampleProductImages[productId] ?? '/sample-products/reusable-sample-suit.jpg';
}

export function getProductImageUrl(product: Product, imageUrl?: string | null) {
  if (!imageUrl || imageUrl.includes('example.com')) {
    return getSampleProductImage(product.id);
  }

  return imageUrl;
}
