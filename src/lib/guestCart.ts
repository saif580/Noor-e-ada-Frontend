import { CART_UPDATED_EVENT, cartApi } from '../api/cart';
import type { Cart, CartItem, Product, ProductVariant } from '../types/domain';

const GUEST_CART_KEY = 'nooreada.guestCart';

type StoredGuestCartItem = Pick<CartItem, 'productId' | 'variantId' | 'quantity' | 'product' | 'variant' | 'imageUrl' | 'imageAltText'>;

function readItems(): StoredGuestCartItem[] {
  try {
    const raw = globalThis.localStorage?.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredGuestCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeItems(items: StoredGuestCartItem[]) {
  globalThis.localStorage?.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function notify(cart: Cart) {
  globalThis.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: { itemCount: cart.itemCount } }));
}

function toCart(items: StoredGuestCartItem[], message?: string): Cart {
  const mappedItems: CartItem[] = items.map((item) => {
    const unitPrice = item.variant.price ?? item.product.minPrice ?? item.product.basePrice ?? 0;
    return {
      ...item,
      id: `guest-${item.variantId}`,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = mappedItems.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);
  const itemCount = mappedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: 'guest',
    items: mappedItems,
    coupon: null,
    totals: {
      subtotal,
      discountTotal: 0,
      shippingTotal: 0,
      grandTotal: subtotal,
    },
    itemCount,
    uniqueItems: mappedItems.length,
    message,
  };
}

export const guestCart = {
  getCart(): Cart {
    return toCart(readItems());
  },

  getItemCount(): number {
    return readItems().reduce((sum, item) => sum + item.quantity, 0);
  },

  addItem(product: Product, variant: ProductVariant, quantity = 1): Cart {
    const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
    const items = readItems();
    const existing = items.find((item) => item.variantId === variant.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        productId: product.id,
        variantId: variant.id,
        quantity,
        product,
        variant,
        imageUrl: primaryImage?.url,
        imageAltText: primaryImage?.altText,
      });
    }

    writeItems(items);
    const cart = toCart(items, 'Added to cart.');
    notify(cart);
    return cart;
  },

  updateItemQuantity(itemId: string, quantity: number): Cart {
    const variantId = itemId.replace(/^guest-/, '');
    const items = readItems().map((item) => (
      item.variantId === variantId ? { ...item, quantity } : item
    ));
    writeItems(items);
    const cart = toCart(items);
    notify(cart);
    return cart;
  },

  removeItem(itemId: string): Cart {
    const variantId = itemId.replace(/^guest-/, '');
    const items = readItems().filter((item) => item.variantId !== variantId);
    writeItems(items);
    const cart = toCart(items, 'Item removed.');
    notify(cart);
    return cart;
  },

  clearCart(): Cart {
    writeItems([]);
    const cart = toCart([], 'Cart cleared.');
    notify(cart);
    return cart;
  },

  async mergeIntoAccount(): Promise<void> {
    const items = readItems();
    if (items.length === 0) return;

    for (const item of items) {
      await cartApi.addItem(item.variantId, item.quantity);
    }

    writeItems([]);
    notify({ ...toCart([]), message: 'Cart moved to your account.' });
  },
};
