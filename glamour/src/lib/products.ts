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

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

const SIZES = ["S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#ffffff" },
  { name: "Pink", hex: "#E91E63" },
  { name: "Blue", hex: "#1e88e5" },
  { name: "Red", hex: "#e53935" },
  { name: "Green", hex: "#43a047" },
  { name: "Yellow", hex: "#fdd835" },
];

// Unique fashion photo pools so no product gallery repeats the same picture
const WOMEN_IMAGES = [
  "1490481651871-ab68de25d43d",
  "1539109136881-3be0616acf4b",
  "1572804013309-59a88b7e92f1",
  "1566479179817-c0c5d6d3a9c3",
  "1496217590455-aa63a8350eea",
  "1469334031218-e382a71b716b",
  "1483985988355-763728e1935b",
  "1551803091-e20673f15770",
  "1554568218-0f1715e72254",
  "1564257631407-4deb1f99d992",
  "1591047139829-d91aecb6caea",
  "1612336307429-8a898d10e223",
  "1485518882345-15568b007407",
  "1539008835657-9e8e9680c956",
  "1581044777550-4cfa60707c03",
  "1521223890158-f9f7c3d5d504",
  "1487222477894-8943e31ef7b2",
  "1605086941233-32311bfa9c8b",
];

const MEN_IMAGES = [
  "1490578474895-699cd4e2cf59",
  "1516257984-b1b4d707412e",
  "1521572163474-6864f9cf17ab",
  "1503341504253-dff4815485f1",
  "1542272604-787c3835535d",
  "1551028719-00167b16eac5",
  "1556821840-3a63f95609a7",
  "1594938298603-c8148c4dae35",
  "1602810318383-e386cc2a3ccf",
  "1611312449408-fcece27cdbb7",
  "1617137968427-85924c800a22",
  "1593030761757-71fae45fa0e7",
  "1488161628813-04466f872be2",
  "1520975916090-3105956dac38",
  "1513938709626-033611b8cc03",
  "1473966968600-fa801b869a1a",
  "1507680434567-5739c80be1ac",
  "1583744946564-b52ac1c389c8",
];

const KIDS_IMAGES = [
  "1518831959646-742c3a14ebf7",
  "1503944583220-79d8926ad5e2",
  "1519278409-1f56fdda7fe5",
  "1571945153237-4929e783af4a",
  "1622290291468-a28f7a7dc6a8",
  "1604917877934-07d8d248d396",
  "1503944168849-8bf86d2c8104",
  "1564927931069-31bb6e6c2c0d",
  "1519278409-1f56fdda7fe5",
  "1503454537195-1dcabb73ffb9",
];

const ETHNIC_IMAGES = [
  "1610030469983-98e550d6193c",
  "1583391733956-3750e0ff4e8b",
  "1610030469668-8e4b2a5b2a8a",
  "1581338834647-b0fb40704e21",
  "1609921141835-710b7e75e2cf",
  "1603189343302-e603f7add05a",
];

const POOL = [
  // women
  { c: "women", t: "Dress", n: "Floral Maxi Dress", b: "Glamora", s: "summer", pool: WOMEN_IMAGES },
  { c: "women", t: "Kurti", n: "Embroidered Anarkali Kurti", b: "Aurelia", s: "summer", pool: ETHNIC_IMAGES },
  { c: "women", t: "Saree", n: "Banarasi Silk Saree", b: "Sabyasachi", s: "winter", pool: ETHNIC_IMAGES },
  { c: "women", t: "Top", n: "Ribbed Crop Top", b: "Zara", s: "summer", pool: WOMEN_IMAGES },
  { c: "women", t: "Jeans", n: "High-Waist Skinny Jeans", b: "Levi's", s: "winter", pool: WOMEN_IMAGES },
  { c: "women", t: "Jacket", n: "Quilted Puffer Jacket", b: "H&M", s: "winter", pool: WOMEN_IMAGES },
  { c: "women", t: "Dress", n: "Satin Slip Party Dress", b: "Mango", s: "summer", pool: WOMEN_IMAGES },
  { c: "women", t: "Hoodie", n: "Oversized Pullover Hoodie", b: "Nike", s: "winter", pool: WOMEN_IMAGES },
  { c: "women", t: "Blazer", n: "Tailored Formal Blazer", b: "Vero Moda", pool: WOMEN_IMAGES },
  { c: "women", t: "Shirt", n: "Linen Button-Up Shirt", b: "Uniqlo", s: "summer", pool: WOMEN_IMAGES },
  // men
  { c: "men", t: "T-Shirt", n: "Premium Cotton Tee", b: "H&M", s: "summer", pool: MEN_IMAGES },
  { c: "men", t: "Shirt", n: "Slim Fit Oxford Shirt", b: "Arrow", pool: MEN_IMAGES },
  { c: "men", t: "Jeans", n: "Distressed Slim Jeans", b: "Levi's", pool: MEN_IMAGES },
  { c: "men", t: "Hoodie", n: "Fleece Pullover Hoodie", b: "Adidas", s: "winter", pool: MEN_IMAGES },
  { c: "men", t: "Jacket", n: "Leather Biker Jacket", b: "Roadster", s: "winter", pool: MEN_IMAGES },
  { c: "men", t: "Blazer", n: "Wool Formal Blazer", b: "Van Heusen", pool: MEN_IMAGES },
  { c: "men", t: "Kurta", n: "Cotton Festive Kurta", b: "Manyavar", pool: ETHNIC_IMAGES },
  { c: "men", t: "T-Shirt", n: "Graphic Print Tee", b: "Puma", s: "summer", pool: MEN_IMAGES },
  { c: "men", t: "Shirt", n: "Casual Flannel Shirt", b: "Wrangler", s: "winter", pool: MEN_IMAGES },
  { c: "men", t: "Jacket", n: "Bomber Varsity Jacket", b: "Nike", s: "winter", pool: MEN_IMAGES },
  // kids
  { c: "kids", t: "Dress", n: "Princess Frock", b: "Mothercare", s: "summer", pool: KIDS_IMAGES },
  { c: "kids", t: "T-Shirt", n: "Cartoon Print Tee", b: "Gini & Jony", s: "summer", pool: KIDS_IMAGES },
  { c: "kids", t: "Jeans", n: "Stretch Denim Jeans", b: "U.S. Polo", pool: KIDS_IMAGES },
  { c: "kids", t: "Hoodie", n: "Hooded Sweatshirt", b: "Carter's", s: "winter", pool: KIDS_IMAGES },
  { c: "kids", t: "Kurta", n: "Festive Sherwani Set", b: "Manyavar", pool: ETHNIC_IMAGES },
];

function rand(seed: number) { return ((Math.sin(seed) * 10000) % 1 + 1) % 1; }

export const PRODUCTS: Product[] = [];
let id = 0;
for (let i = 0; i < 5; i++) {
  for (const p of POOL) {
    id++;
    const r = rand(id);
    const mrp = Math.round((499 + r * 4500) / 50) * 50 + 49;
    const disc = 0.2 + rand(id + 1) * 0.55;
    const price = Math.round((mrp * (1 - disc)) / 10) * 10 + 9;
    const colorCount = 2 + Math.floor(rand(id + 2) * 4);
    const colors = [...COLORS].sort(() => rand(id + 3) - 0.5).slice(0, colorCount);
    const tagSet = new Set<string>([p.t.toLowerCase(), p.c]);
    if (p.t === "Kurti" || p.t === "Saree" || p.t === "Kurta") tagSet.add("ethnic");
    else tagSet.add("western");
    if (p.t === "Blazer" || (p.t === "Shirt" && p.b === "Arrow") || p.t === "Kurta") tagSet.add("formal");
    else tagSet.add("casual");
    if (p.s === "summer") tagSet.add("summer");
    if (p.s === "winter") tagSet.add("winter");
    if (["Dress", "Saree", "Kurta", "Sherwani"].some(x => p.n.includes(x))) tagSet.add("party");

    // Pick 3 distinct images from the pool for this product
    const pool = p.pool;
    const start = (id * 3) % pool.length;
    const imgs = [
      pool[start % pool.length],
      pool[(start + 1) % pool.length],
      pool[(start + 2) % pool.length],
    ];

    PRODUCTS.push({
      id: `P${1000 + id}`,
      name: i > 0 ? `${p.n} ${["Classic","Premium","Luxe","Edit","Signature"][i]}` : p.n,
      brand: p.b,
      category: p.c as Product["category"],
      type: p.t,
      tags: Array.from(tagSet),
      price,
      mrp,
      rating: Math.round((3.5 + rand(id + 5) * 1.5) * 10) / 10,
      reviews: 20 + Math.floor(rand(id + 6) * 2000),
      sizes: p.c === "kids" ? ["S", "M", "L"] : SIZES,
      colors,
      images: imgs.map(img),
      description: `Crafted from premium materials, the ${p.n} from ${p.b} blends contemporary style with timeless comfort. Perfect for ${p.s || "any"} season, this piece is a wardrobe essential.`,
      stock: Math.floor(rand(id + 7) * 50) > 2 ? 25 : 0,
      season: p.s as any,
    });
  }
}

// ─── Admin-added products (persisted to localStorage) ────────────────────────
const ADMIN_KEY = "glamora.adminProducts";
let adminLoaded = false;
export function loadAdminProducts() {
  if (adminLoaded || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (raw) {
      const arr: Product[] = JSON.parse(raw);
      for (const p of arr) {
        if (!PRODUCTS.find(x => x.id === p.id)) PRODUCTS.unshift(p);
      }
    }
  } catch {}
  adminLoaded = true;
}
export function saveAdminProduct(p: Product) {
  if (typeof window === "undefined") return;
  PRODUCTS.unshift(p);
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    const arr: Product[] = raw ? JSON.parse(raw) : [];
    arr.unshift(p);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(arr));
  } catch {}
}
export function deleteAdminProduct(id: string) {
  if (typeof window === "undefined") return;
  const idx = PRODUCTS.findIndex(p => p.id === id);
  if (idx >= 0) PRODUCTS.splice(idx, 1);
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return;
    const arr: Product[] = JSON.parse(raw);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(arr.filter(p => p.id !== id)));
  } catch {}
}
export function listAdminProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export const CATEGORIES = [
  { slug: "all", title: "All" },
  { slug: "women", title: "Women's Wear" },
  { slug: "men", title: "Men's Wear" },
  { slug: "kids", title: "Kids Wear" },
  { slug: "ethnic", title: "Ethnic Wear" },
  { slug: "western", title: "Western Wear" },
  { slug: "casual", title: "Casual Wear" },
  { slug: "formal", title: "Formal Wear" },
  { slug: "party", title: "Party Wear" },
  { slug: "summer", title: "Summer Collection" },
  { slug: "winter", title: "Winter Collection" },
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
}) {
  let r = PRODUCTS.slice();
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
