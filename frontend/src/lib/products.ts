export type Product = {
  id: string;
  name: string;
  brand: string;
  category: "women" | "men" | "kids";
  type: string;
  tags: string[];
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  description: string;
  stock: number;
  season?: "summer" | "winter";
};


// No static/dummy products — all products are added via the Admin Panel
export const PRODUCTS: Product[] = [];


export const CATEGORIES = [
  { slug: "all", title: "All" },
  { slug: "women", title: "Women's Wear" },
  { slug: "men", title: "Men's Wear" },
  { slug: "kids", title: "Kids' Wear" },
];

export function getProduct(id: string) {
  return PRODUCTS.find(p => p.id === id);
}

export function filterProducts(opts: {
  q?: string;
  category?: string;
  types?: string[];
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sort?: string;
  extraProducts?: Product[];
}) {
  // Merge DB products (extraProducts) at the front, deduplicated by id
  const seenIds = new Set<string>();
  const allProducts: Product[] = [];
  for (const p of (opts.extraProducts || [])) {
    if (!seenIds.has(p.id)) { seenIds.add(p.id); allProducts.push(p); }
  }
  for (const p of PRODUCTS) {
    if (!seenIds.has(p.id)) { seenIds.add(p.id); allProducts.push(p); }
  }

  let r = allProducts;
  if (opts.q) {
    const q = opts.q.toLowerCase();
    r = r.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)));
  }
  if (opts.category && opts.category !== "all") {
    r = r.filter(p => p.category === opts.category || p.tags.includes(opts.category!));
  }
  if (opts.types?.length) r = r.filter(p => opts.types!.includes(p.type));
  if (opts.sizes?.length) r = r.filter(p => p.sizes.some(s => opts.sizes!.includes(s)));
  if (opts.colors?.length) r = r.filter(p => p.colors.some(c => opts.colors!.includes(c.name)));
  if (opts.minPrice != null) r = r.filter(p => p.price >= opts.minPrice!);
  if (opts.maxPrice != null) r = r.filter(p => p.price <= opts.maxPrice!);
  if (opts.minRating) r = r.filter(p => p.rating >= opts.minRating!);
  if (opts.inStock) r = r.filter(p => p.stock > 0);
  switch (opts.sort) {
    case "price-asc": r.sort((a, b) => a.price - b.price); break;
    case "price-desc": r.sort((a, b) => b.price - a.price); break;
    case "rating": r.sort((a, b) => b.rating - a.rating); break;
    case "newest": r.sort((a, b) => b.id.localeCompare(a.id)); break;
  }
  return r;
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
