import type { Product } from '../../types/domain';

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
