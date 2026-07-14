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

export interface ProductMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  altText: string;
  poster?: string;
}

const productDescriptions: Record<string, string> = {
  '1': 'A breathable linen day dress with a relaxed ethnic silhouette, finished for warm-weather comfort and easy festive styling.',
  '2': 'An evening-ready gown with a soft fall, clean neckline, and polished finish for receptions, dinners, and celebration wear.',
  '3': 'A versatile black cotton kurta top designed for casual edits, travel looks, and relaxed daily styling.',
  '4': 'A coordinated indigo set with soft structure, breathable fabric, and a polished print for easy day-to-evening wear.',
  '5': 'A maroon festive anarkali set with a graceful flare, subtle detail, and celebration-ready finish.',
  '6': 'An ivory chikankari-inspired anarkali set with a soft dupatta and refined texture for wedding guest dressing.',
  '7': 'A charcoal silk-blend dupatta with a refined border, designed to lift simple kurtas and festive separates.',
  '9': 'A black straight kurta in breathable cotton with a neat neckline and versatile length for repeated wear.',
  '10': 'A noir kurta set with a light Chanderi-inspired finish, tailored pants, and a polished occasion look.',
  '11': 'A soft blush saree with delicate print work and an easy drape for gifting, dinners, and festive styling.',
  '12': 'A blue anarkali set with a flattering flare, comfortable lining, and a coordinated dupatta for festive occasions.',
};

const sampleProductGallery: Record<string, string[]> = {
  '1': [
    '/sample-products/product-01-linen-summer-dress.jpg',
    '/sample-products/home-chikankari-anarkali-set.jpg',
    '/sample-products/home-banarasi-silk-saree.jpg',
  ],
  '2': [
    '/sample-products/product-02-evening-gown.jpg',
    '/sample-products/home-zari-embroidered-lehenga.jpg',
    '/sample-products/home-pearl-kundan-choker.jpg',
  ],
};

const sampleVideoUrl = 'https://res.cloudinary.com/demo/video/upload/q_auto:eco,w_900/cld-sample-video.mp4';

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

export function getProductDescription(product: Product) {
  const backendDescription = product.description?.trim();
  if (backendDescription && backendDescription.length > 30 && !backendDescription.toLowerCase().includes('test')) {
    return backendDescription;
  }

  return productDescriptions[product.id] ?? 'A Noor-e-ada ethnic wear piece selected for graceful styling, comfortable movement, and occasion-ready polish.';
}

export function getProductMedia(product: Product): ProductMediaItem[] {
  const backendImages = product.images
    .map((image) => ({
      id: image.id,
      type: 'image' as const,
      url: getProductImageUrl(product, image.url),
      altText: image.altText ?? product.name,
    }))
    .filter((image, index, images) => image.url && images.findIndex((item) => item.url === image.url) === index);

  const sampleImages = (sampleProductGallery[product.id] ?? [
    getSampleProductImage(product.id),
    '/sample-products/home-chikankari-anarkali-set.jpg',
    '/sample-products/home-pearl-kundan-choker.jpg',
  ]).map((url, index) => ({
    id: `sample-${product.id}-${index}`,
    type: 'image' as const,
    url,
    altText: `${product.name} view ${index + 1}`,
  }));

  const usableImages = backendImages.length > 1 && !backendImages.every((image) => image.url.includes('/sample-products/'))
    ? backendImages
    : sampleImages;

  return [
    ...usableImages,
    {
      id: `sample-video-${product.id}`,
      type: 'video' as const,
      url: sampleVideoUrl,
      poster: usableImages[0]?.url,
      altText: `${product.name} video`,
    },
  ];
}
