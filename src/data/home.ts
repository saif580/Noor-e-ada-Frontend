export const PARTICLES = [
  { size: 12, top: '8%', right: '8%', bg: 'rgba(234,192,189,0.85)', d: '6s', del: '0s' },
  { size: 8, top: '38%', left: '4%', bg: 'rgba(201,172,131,0.8)', d: '8.5s', del: '1.2s' },
  { size: 6, top: '16%', left: '16%', bg: 'rgba(155,47,67,0.4)', d: '5.5s', del: '0.5s' },
  { size: 10, top: '72%', right: '4%', bg: 'rgba(234,192,189,0.7)', d: '7s', del: '2s' },
  { size: 5, top: '55%', right: '22%', bg: 'rgba(201,172,131,0.9)', d: '9s', del: '0.8s' },
  { size: 9, top: '82%', left: '10%', bg: 'rgba(155,47,67,0.28)', d: '6.5s', del: '1.6s' },
  { size: 7, top: '28%', right: '28%', bg: 'rgba(234,192,189,0.6)', d: '7.5s', del: '3s' },
] as const;

export const CATEGORIES = [
  { name: 'Festive Sarees', count: '84 styles', tone: 'rose', href: '/collections/festive-sarees' },
  { name: 'Anarkali Sets', count: '52 styles', tone: 'sage', href: '/collections/anarkali-sets' },
  { name: 'Bridal Edit', count: '36 styles', tone: 'gold', href: '/collections/bridal' },
  { name: 'Jewellery', count: '70 styles', tone: 'ivory', href: '/collections/jewellery' },
] as const;

export const PRODUCTS = [
  {
    name: 'Zari Embroidered Lehenga',
    category: 'Bridal',
    price: '₹18,499',
    oldPrice: '₹22,999',
    badge: 'Bestseller',
    color: 'product-ruby',
  },
  {
    name: 'Chikankari Anarkali Set',
    category: 'Festive Wear',
    price: '₹7,999',
    oldPrice: '₹9,499',
    badge: 'New',
    color: 'product-cream',
  },
  {
    name: 'Banarasi Silk Saree',
    category: 'Sarees',
    price: '₹12,299',
    oldPrice: '₹15,499',
    badge: 'Limited',
    color: 'product-emerald',
  },
  {
    name: 'Pearl Kundan Choker',
    category: 'Accessories',
    price: '₹3,299',
    oldPrice: '₹4,199',
    badge: 'Trending',
    color: 'product-blush',
  },
] as const;

export const BENEFITS = [
  ['Free shipping', 'On prepaid orders over ₹999'],
  ['Easy returns', '7-day exchange on eligible styles'],
  ['Secure checkout', 'Protected payments and order updates'],
] as const;
