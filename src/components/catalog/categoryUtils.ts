import type { Category } from '../../types/domain';

const categoryImageByKeyword: Array<[string, string]> = [
  ['saree', '/sample-products/home-banarasi-silk-saree.jpg'],
  ['silk', '/sample-products/home-banarasi-silk-saree.jpg'],
  ['anarkali', '/sample-products/home-chikankari-anarkali-set.jpg'],
  ['chikankari', '/sample-products/home-chikankari-anarkali-set.jpg'],
  ['bridal', '/sample-products/home-zari-embroidered-lehenga.jpg'],
  ['lehenga', '/sample-products/home-zari-embroidered-lehenga.jpg'],
  ['jewel', '/sample-products/home-pearl-kundan-choker.jpg'],
  ['accessor', '/sample-products/home-pearl-kundan-choker.jpg'],
  ['cart', '/sample-products/product-04-cart-check-product.jpg'],
  ['order', '/sample-products/product-06-orders-product.jpg'],
  ['inventory', '/sample-products/product-09-inventory-product.jpg'],
  ['coupon', '/sample-products/product-11-coupon-product.jpg'],
];

const fallbackCategoryImages = [
  '/sample-products/home-banarasi-silk-saree.jpg',
  '/sample-products/home-chikankari-anarkali-set.jpg',
  '/sample-products/home-zari-embroidered-lehenga.jpg',
  '/sample-products/home-pearl-kundan-choker.jpg',
  '/sample-products/reusable-sample-suit.jpg',
] as const;

export function getCategoryImageUrl(category: Category, index = 0): string {
  if (category.imageUrl && !category.imageUrl.includes('example.com')) {
    return category.imageUrl;
  }

  const searchableText = `${category.slug} ${category.name}`.toLowerCase();
  const keywordMatch = categoryImageByKeyword.find(([keyword]) => searchableText.includes(keyword));
  if (keywordMatch) return keywordMatch[1];

  return fallbackCategoryImages[index % fallbackCategoryImages.length];
}

export function getCategoryKicker(category: Category): string {
  const text = `${category.name} ${category.description ?? ''}`.toLowerCase();
  if (text.includes('sale') || text.includes('offer')) return 'Seasonal edit';
  if (text.includes('stock') || text.includes('last chance')) return 'Limited availability';
  if (text.includes('wedding') || text.includes('bridal')) return 'Wedding edit';
  if (text.includes('saree')) return 'Drapes & classics';
  if (text.includes('kurta') || text.includes('cotton')) return 'Everyday ethnic';
  return 'Curated collection';
}
