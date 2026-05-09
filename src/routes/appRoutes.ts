export type RouteAccess = 'public' | 'customer' | 'admin';

export interface AppRoute {
  path: string;
  label: string;
  access: RouteAccess;
  navGroup?: 'main' | 'account' | 'admin' | 'footer';
}

export const appRoutes = [
  { path: '/', label: 'Home', access: 'public' },
  { path: '/products', label: 'Products', access: 'public', navGroup: 'main' },
  { path: '/collections', label: 'Collections', access: 'public', navGroup: 'main' },
  { path: '/wishlist', label: 'Wishlist', access: 'customer', navGroup: 'account' },
  { path: '/cart', label: 'Cart', access: 'customer', navGroup: 'account' },
  { path: '/checkout', label: 'Checkout', access: 'customer' },
  { path: '/account', label: 'Account', access: 'customer', navGroup: 'account' },
  { path: '/orders', label: 'Orders', access: 'customer', navGroup: 'account' },
  { path: '/admin', label: 'Admin', access: 'admin', navGroup: 'admin' },
  { path: '/shipping', label: 'Shipping', access: 'public', navGroup: 'footer' },
  { path: '/returns', label: 'Returns', access: 'public', navGroup: 'footer' },
  { path: '/size-guide', label: 'Size Guide', access: 'public', navGroup: 'footer' },
  { path: '/contact', label: 'Contact', access: 'public', navGroup: 'footer' },
] satisfies AppRoute[];

export const mainNavigation = [
  { href: '#new-arrivals', label: 'New Arrivals' },
  { href: '#collections', label: 'Collections' },
  { href: '#bestsellers', label: 'Bestsellers' },
  { href: '#contact', label: 'Contact' },
] as const;

export const footerNavigation = appRoutes.filter((route) => route.navGroup === 'footer');
