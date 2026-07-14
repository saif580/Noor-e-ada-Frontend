import type { Category, Product } from '../types/domain';

const categoryDisplayById: Record<string, Pick<Category, 'name' | 'description'>> = {
  '1': {
    name: "Women's Ethnic Wear",
    description: 'Curated sarees, kurtas, anarkalis, lehengas, and festive essentials.',
  },
  '2': {
    name: 'Occasion Dresses',
    description: 'Easy celebration-ready silhouettes with refined fabrics and graceful movement.',
  },
  '3': {
    name: 'Everyday Kurtas',
    description: 'Comfortable cotton and linen pieces for relaxed daily styling.',
  },
  '4': {
    name: 'Printed Co-ord Sets',
    description: 'Matched sets designed for casual outings, travel, and effortless hosting.',
  },
  '5': {
    name: 'Festive Sarees',
    description: 'Drapes selected for weddings, poojas, receptions, and family celebrations.',
  },
  '6': {
    name: 'Wedding Guest Anarkalis',
    description: 'Polished anarkali sets with soft volume, elegant color, and occasion-ready detail.',
  },
  '7': {
    name: 'Last Chance Styles',
    description: 'Limited pieces with low or changing availability.',
  },
  '8': {
    name: 'Limited Stock Edit',
    description: 'Fast-moving pieces to revisit before they sell out.',
  },
  '9': {
    name: 'Cotton Kurta Sets',
    description: 'Breathable kurta sets for daytime events and repeated wear.',
  },
  '10': {
    name: 'Low Stock Picks',
    description: 'Popular sizes and colors with only a few pieces remaining.',
  },
  '11': {
    name: 'Sale Edit',
    description: 'Selected styles with promotional pricing and seasonal offers.',
  },
  '12': {
    name: 'Festive Offers',
    description: 'Occasion wear and accessories eligible for current Noor-e-ada promotions.',
  },
};

const productDisplayById: Record<string, Pick<Product, 'name' | 'description' | 'categoryName'>> = {
  '1': {
    name: 'Linen Embroidered Kurta Dress',
    categoryName: 'Occasion Dresses',
    description: 'A breathable linen kurta dress with delicate embroidery, side pockets, and an easy A-line fall for warm daytime celebrations.',
  },
  '2': {
    name: 'Ruby Satin Occasion Gown',
    categoryName: 'Occasion Dresses',
    description: 'A fluid ruby gown with a soft satin sheen, tailored neckline, and graceful drape for receptions, dinners, and evening events.',
  },
  '3': {
    name: 'Black Cotton Kurta Top',
    categoryName: 'Everyday Kurtas',
    description: 'A versatile black cotton kurta top with a clean straight fit, easy sleeve length, and everyday comfort for casual ethnic styling.',
  },
  '4': {
    name: 'Indigo Printed Co-ord Set',
    categoryName: 'Printed Co-ord Sets',
    description: 'A relaxed indigo co-ord set with a printed kurta and matching bottoms, made for travel, brunches, and comfortable festive prep.',
  },
  '5': {
    name: 'Maroon Festive Anarkali Set',
    categoryName: 'Festive Sarees',
    description: 'A maroon festive set with a graceful flare, lightweight dupatta, and subtle detailing for poojas, dinners, and family functions.',
  },
  '6': {
    name: 'Ivory Chikankari Anarkali Set',
    categoryName: 'Wedding Guest Anarkalis',
    description: 'An ivory anarkali set with chikankari-inspired texture, soft lining, and an elegant dupatta for wedding guest dressing.',
  },
  '7': {
    name: 'Charcoal Silk Blend Dupatta',
    categoryName: 'Last Chance Styles',
    description: 'A charcoal silk-blend dupatta with a refined border, designed to lift simple kurtas and festive separates.',
  },
  '9': {
    name: 'Black Cotton Straight Kurta',
    categoryName: 'Cotton Kurta Sets',
    description: 'A black straight kurta in breathable cotton with a neat neckline and versatile length for workdays and casual occasions.',
  },
  '10': {
    name: 'Noir Chanderi Kurta Set',
    categoryName: 'Low Stock Picks',
    description: 'A noir kurta set with a light Chanderi-inspired finish, tailored pants, and a polished look for intimate celebrations.',
  },
  '11': {
    name: 'Blush Printed Saree',
    categoryName: 'Sale Edit',
    description: 'A soft blush saree with delicate print work and an easy drape, selected for gifting, festive dinners, and seasonal styling.',
  },
  '12': {
    name: 'Blue Festive Anarkali Set',
    categoryName: 'Festive Offers',
    description: 'A blue anarkali set with a flattering flare, comfortable lining, and a coordinated dupatta for festive occasions.',
  },
};

const timestampSuffixPattern = /\s*\d{10,}$/;

export function cleanCatalogName(name: string): string {
  return name
    .replace(timestampSuffixPattern, '')
    .replace(/\b(Cart Check|Cart|Coupon Modes|Coupon|Inventory Check|Inventory|Orders|Status)\b/gi, '')
    .replace(/\s+Category$/i, '')
    .replace(/\s+Product$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function decorateCategory(category: Category): Category {
  const display = categoryDisplayById[category.id];
  if (display) {
    return {
      ...category,
      name: display.name,
      description: category.description && !category.description.toLowerCase().includes('category')
        ? category.description
        : display.description,
    };
  }

  return {
    ...category,
    name: cleanCatalogName(category.name) || category.name,
  };
}

export function decorateProduct(product: Product): Product {
  const display = productDisplayById[product.id];
  if (display) {
    return {
      ...product,
      name: display.name,
      description: display.description,
      categoryName: display.categoryName,
    };
  }

  return {
    ...product,
    name: cleanCatalogName(product.name) || product.name,
    categoryName: product.categoryName ? cleanCatalogName(product.categoryName) || product.categoryName : product.categoryName,
  };
}

export function getDisplayProductName(productId: string, fallbackName: string): string {
  return productDisplayById[productId]?.name ?? cleanCatalogName(fallbackName) ?? fallbackName;
}
