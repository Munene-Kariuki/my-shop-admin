import { createSeededRandom, randomInt } from '@/lib/seededRandom'
import type { Product } from '@/types/domain'

interface CategoryCatalog {
  shopId: string
  shopCode: string
  category: string
  priceRange: [number, number]
  names: string[]
}

const CATALOGS: CategoryCatalog[] = [
  {
    shopId: 'shop-1',
    shopCode: 'UT',
    category: 'Apparel',
    priceRange: [15, 120],
    names: [
      'Classic Crewneck Tee',
      'Slim Fit Denim Jeans',
      'Oversized Hoodie',
      'Bomber Jacket',
      'Cargo Joggers',
      'Graphic Print Tee',
      'Wool Beanie',
      'Canvas Tote Bag',
      'Flannel Shirt',
      'Chino Shorts',
      'Puffer Vest',
      'Ribbed Tank Top',
    ],
  },
  {
    shopId: 'shop-2',
    shopCode: 'KC',
    category: 'Home & Kitchen',
    priceRange: [12, 250],
    names: [
      'Cast Iron Skillet',
      'Stainless Steel Kettle',
      '12-Piece Knife Set',
      'Non-Stick Frying Pan',
      'Ceramic Dinner Plate Set',
      'Glass Food Storage Set',
      'Electric Hand Mixer',
      'Bamboo Cutting Board',
      'Espresso Machine',
      'Air Fryer',
      'Silicone Baking Mat',
      'Copper Saucepan',
    ],
  },
  {
    shopId: 'shop-3',
    shopCode: 'BB',
    category: 'Electronics',
    priceRange: [9, 399],
    names: [
      'Wireless Earbuds',
      'Bluetooth Speaker',
      'USB-C Fast Charger',
      '4K Action Camera',
      'Mechanical Keyboard',
      'Wireless Mouse',
      'Portable Power Bank',
      'Smart Watch',
      'Noise-Cancelling Headphones',
      'HDMI Cable 2m',
      'Webcam 1080p',
      'Laptop Stand',
    ],
  },
  {
    shopId: 'shop-4',
    shopCode: 'GB',
    category: 'Beauty',
    priceRange: [8, 65],
    names: [
      'Vitamin C Serum',
      'Hyaluronic Acid Moisturizer',
      'Matte Liquid Lipstick',
      'Charcoal Face Mask',
      'SPF 50 Sunscreen',
      'Rose Gold Makeup Brush Set',
      'Micellar Cleansing Water',
      'Argan Oil Hair Serum',
      'Retinol Night Cream',
      'Eyeshadow Palette',
    ],
  },
  {
    shopId: 'shop-5',
    shopCode: 'TO',
    category: 'Outdoors',
    priceRange: [14, 320],
    names: [
      '2-Person Tent',
      'Sleeping Bag -10C',
      'Trekking Poles',
      'Insulated Water Bottle',
      'Hiking Backpack 40L',
      'Camping Lantern',
      'Portable Camp Stove',
      'Rain Shell Jacket',
      'Hydration Pack',
      'Multi-Tool Knife',
    ],
  },
  {
    shopId: 'shop-6',
    shopCode: 'TT',
    category: 'Toys',
    priceRange: [6, 90],
    names: [
      'Wooden Building Blocks',
      'Remote Control Car',
      'Plush Teddy Bear',
      '1000-Piece Jigsaw Puzzle',
      'Board Game: Family Night',
      'Toy Kitchen Set',
      'Building Bricks Mega Set',
      "Kids Art Easel",
      'Bouncy Ball Set',
      'Dinosaur Figure Collection',
    ],
  },
  {
    shopId: 'shop-7',
    shopCode: 'CB',
    category: 'Books',
    priceRange: [9, 32],
    names: [
      'The Midnight Library',
      'Atomic Habits',
      'Project Hail Mary',
      'A Brief History of Time',
      'The Hobbit',
      'Sapiens',
      'The Silent Patient',
      'Educated: A Memoir',
      'Dune',
      'The Alchemist',
    ],
  },
  {
    shopId: 'shop-8',
    shopCode: 'PF',
    category: 'Grocery',
    priceRange: [3, 28],
    names: [
      'Organic Rolled Oats',
      'Extra Virgin Olive Oil',
      'Dark Roast Coffee Beans',
      'Raw Honey Jar',
      'Almond Butter',
      'Sea Salt Pasta',
      'Herbal Tea Sampler',
      'Sourdough Bread Mix',
      'Trail Mix Snack Pack',
      'Sparkling Water 12-Pack',
    ],
  },
]

/** Fixed points in the past so "Last Updated" sorting has a real spread. */
const BASE_DATE = new Date('2025-09-01T00:00:00.000Z').getTime()
const DAY_MS = 24 * 60 * 60 * 1000

function imageFor(sku: string) {
  return `https://picsum.photos/seed/${sku}/400/300`
}

function buildProducts(): Product[] {
  const random = createSeededRandom(42)
  const products: Product[] = []

  for (const catalog of CATALOGS) {
    catalog.names.forEach((name, index) => {
      const sku = `${catalog.shopCode}-${String(index + 1).padStart(4, '0')}`
      const isLast = index === catalog.names.length - 1
      const isSecondLast = index === catalog.names.length - 2
      // Guarantee at least one out-of-stock and one low-stock product per shop
      // so dashboard counts and stock-status filters always have data to show.
      const stock = isLast ? 0 : isSecondLast ? randomInt(random, 1, 5) : randomInt(random, 6, 200)

      const [minPrice, maxPrice] = catalog.priceRange
      const price = Number((minPrice + random() * (maxPrice - minPrice)).toFixed(2))

      const createdOffsetDays = randomInt(random, 30, 300)
      const updatedOffsetDays = randomInt(random, 0, Math.min(29, createdOffsetDays))
      const createdAt = new Date(BASE_DATE - createdOffsetDays * DAY_MS).toISOString()
      const updatedAt = new Date(BASE_DATE - updatedOffsetDays * DAY_MS).toISOString()

      products.push({
        id: `product-${sku}`,
        name,
        sku,
        shopId: catalog.shopId,
        category: catalog.category,
        price,
        stock,
        description: `${name} from our ${catalog.category.toLowerCase()} collection.`,
        imageUrl: imageFor(sku),
        status: random() > 0.1 ? 'active' : 'inactive',
        createdAt,
        updatedAt,
      })
    })
  }

  // Deliberately broken image URL to exercise the broken-image fallback UI.
  const brokenImageProduct = products.find((p) => p.sku === 'BB-0001')
  if (brokenImageProduct) {
    brokenImageProduct.imageUrl = 'https://invalid.example.test/not-found.jpg'
  }

  return products
}

export const seedProducts: Product[] = buildProducts()
