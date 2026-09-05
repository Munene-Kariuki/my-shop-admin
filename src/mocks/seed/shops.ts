import type { Shop } from '@/types/domain'

/**
 * Logos point at DiceBear's hosted SVG API (no local asset bloat) so the UI
 * has real images to render, broken-image fallbacks, etc.
 */
function logoFor(seed: string) {
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(seed)}`
}

export const seedShops: Shop[] = [
  {
    id: 'shop-1',
    name: 'Urban Threads',
    description: 'Streetwear and everyday apparel for the modern city dweller.',
    logoUrl: logoFor('urban-threads'),
    contactEmail: 'hello@urbanthreads.test',
    status: 'active',
    createdAt: '2024-11-02T09:15:00.000Z',
  },
  {
    id: 'shop-2',
    name: 'Kitchen & Co.',
    description: 'Kitchenware, cookware, and small appliances for home cooks.',
    logoUrl: logoFor('kitchen-and-co'),
    contactEmail: 'support@kitchenandco.test',
    status: 'active',
    createdAt: '2024-12-18T14:30:00.000Z',
  },
  {
    id: 'shop-3',
    name: 'Byte & Bolt Electronics',
    description: 'Consumer electronics, gadgets, and accessories.',
    logoUrl: logoFor('byte-and-bolt'),
    contactEmail: 'sales@byteandbolt.test',
    status: 'active',
    createdAt: '2025-01-05T11:00:00.000Z',
  },
  {
    id: 'shop-4',
    name: 'Glow Beauty Bar',
    description: 'Skincare, cosmetics, and beauty essentials.',
    logoUrl: logoFor('glow-beauty-bar'),
    contactEmail: 'care@glowbeautybar.test',
    status: 'active',
    createdAt: '2025-02-14T08:45:00.000Z',
  },
  {
    id: 'shop-5',
    name: 'Trailhead Outdoors',
    description: 'Hiking, camping, and outdoor sports gear.',
    logoUrl: logoFor('trailhead-outdoors'),
    contactEmail: 'info@trailheadoutdoors.test',
    status: 'inactive',
    createdAt: '2025-03-01T16:20:00.000Z',
  },
  {
    id: 'shop-6',
    name: 'Tiny Tots Toys',
    description: "Toys, games, and children's learning products.",
    logoUrl: logoFor('tiny-tots-toys'),
    contactEmail: 'orders@tinytotstoys.test',
    status: 'active',
    createdAt: '2025-04-20T10:10:00.000Z',
  },
  {
    id: 'shop-7',
    name: 'Chapter One Books',
    description: 'New releases, classics, and independent press titles.',
    logoUrl: logoFor('chapter-one-books'),
    contactEmail: 'books@chapterone.test',
    status: 'active',
    createdAt: '2025-05-11T13:00:00.000Z',
  },
  {
    id: 'shop-8',
    name: 'Pantry Fresh Market',
    description: 'Grocery staples, snacks, and specialty foods.',
    logoUrl: logoFor('pantry-fresh-market'),
    contactEmail: 'hello@pantryfresh.test',
    status: 'active',
    createdAt: '2025-06-30T09:00:00.000Z',
  },
  {
    id: 'shop-9',
    name: 'The Empty Shelf',
    description: 'A brand-new shop that has not listed any products yet.',
    logoUrl: logoFor('the-empty-shelf'),
    contactEmail: 'new@theemptyshelf.test',
    status: 'inactive',
    createdAt: '2025-08-01T09:00:00.000Z',
  },
]
