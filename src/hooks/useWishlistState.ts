import { useCallback, useEffect, useMemo, useState } from 'react';
import { wishlistApi } from '../api/wishlist';
import { useAuth } from './useAuth';
import type { WishlistItem } from '../types/domain';

export function useWishlistState() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(isAuthenticated);

  const loadWishlist = useCallback(async () => {
    await Promise.resolve();
    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setItems(await wishlistApi.getWishlist());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      void loadWishlist();
    }, 0);
    return () => globalThis.clearTimeout(timer);
  }, [loadWishlist]);

  const itemByProductId = useMemo(
    () => new Map(items.map((item) => [item.productId, item])),
    [items],
  );

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      throw new Error('Sign in to save wishlist items.');
    }

    const existing = itemByProductId.get(productId);
    const nextItems = existing
      ? await wishlistApi.removeItem(existing.id)
      : await wishlistApi.addItem(productId);
    setItems(nextItems);
    return !existing;
  }, [isAuthenticated, itemByProductId]);

  return {
    items,
    loading,
    itemByProductId,
    isWishlisted(productId: string) {
      return itemByProductId.has(productId);
    },
    toggleWishlist,
    reloadWishlist: loadWishlist,
  };
}
