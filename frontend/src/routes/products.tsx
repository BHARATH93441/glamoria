import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CATEGORIES, filterProducts } from "@/lib/products";
import { ProductCard } from "@/components/glamora/ProductCard";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";

const search = z.object({
  q: fallback(z.string().optional(), undefined),
  cat: fallback(z.string().optional(), undefined),
  sort: fallback(z.enum(["popularity","newest","price-asc","price-desc","rating"]).optional(), undefined),
});

export const Route = createFileRoute("/products")({
  validateSearch: zodValidator(search),
  component: ProductsPage,
});

const TYPES = ["T-Shirt","Shirt","Kurti","Saree","Jeans","Dress","Hoodie","Jacket","Blazer","Kurta","Top"];
const SIZES = ["S","M","L","XL","XXL"];
const COLORS = ["Black","White","Blue","Pink","Red","Green","Yellow"];
const PRICE_BUCKETS = [
  { l: "Under ₹500", min: 0, max: 500 },
  { l: "₹500 – ₹1000", min: 500, max: 1000 },
  { l: "₹1000 – ₹2000", min: 1000, max: 2000 },
  { l: "₹2000 – ₹5000", min: 2000, max: 5000 },
  { l: "Above ₹5000", min: 5000, max: 1e9 },
];

function ProductsPage() {
  const { q, sort, cat } = Route.useSearch();
  const navigate = useNavigate();
  const activeCat = cat || "all";
  const [types, setTypes] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [priceIdx, setPriceIdx] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStock, setInStock] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);

  const products = useMemo(() => filterProducts({
    q,
    category: activeCat,
    types: types.length ? types : undefined,
    sizes: sizes.length ? sizes : undefined,
    colors: colors.length ? colors : undefined,
    minPrice: priceIdx != null ? PRICE_BUCKETS[priceIdx].min : undefined,
    maxPrice: priceIdx != null ? PRICE_BUCKETS[priceIdx].max : undefined,
    minRating: minRating || undefined,
    inStock: inStock || undefined,
    sort: sort === "popularity" ? undefined : sort,
  }), [activeCat, q, sort, types, sizes, colors, priceIdx, minRating, inStock]);

  const setCat = (slug: string) =>
    navigate({ to: "/products", search: (prev: any) => ({ ...prev, cat: slug === "all" ? undefined : slug }) });

  const toggle = <T,>(v: T, setter: React.Dispatch<React.SetStateAction<T[]>>) =>
    setter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const Filters = (
    <div className="space-y-6">
      <FilterGroup title="Dress Type">
        {TYPES.map(t => (
          <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={types.includes(t)} onChange={() => toggle(t, setTypes)} /> {t}
          </label>
        ))}
      </FilterGroup>
      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map(s => (
            <button key={s} onClick={() => toggle(s, setSizes)} className={`size-9 rounded-full border text-xs font-medium ${sizes.includes(s) ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary"}`}>{s}</button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button key={c} onClick={() => toggle(c, setColors)} title={c}
              className={`size-7 rounded-full border-2 ${colors.includes(c) ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
              style={{ background: c.toLowerCase() === "white" ? "#fff" : c.toLowerCase() }} />
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Price">
        {PRICE_BUCKETS.map((b, i) => (
          <label key={b.l} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="price" checked={priceIdx === i} onChange={() => setPriceIdx(i)} /> {b.l}
          </label>
        ))}
        {priceIdx != null && <button onClick={() => setPriceIdx(null)} className="text-xs text-primary mt-1">Clear</button>}
      </FilterGroup>
      <FilterGroup title="Rating">
        {[4, 3].map(r => (
          <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} /> {r}★ & Above
          </label>
        ))}
        {minRating > 0 && <button onClick={() => setMinRating(0)} className="text-xs text-primary mt-1">Clear</button>}
      </FilterGroup>
      <FilterGroup title="Availability">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} /> In Stock Only
        </label>
      </FilterGroup>
    </div>
  );

  const activeTitle = CATEGORIES.find(c => c.slug === activeCat)?.title || "All";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-5">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">{activeTitle}</h1>
        <p className="text-muted-foreground text-sm">{products.length} products{q ? ` matching "${q}"` : ""}</p>
      </div>

      {/* Category chip row — replaces per-category landing pages */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button
            key={c.slug}
            onClick={() => setCat(c.slug)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${
              activeCat === c.slug
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:border-primary"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><SlidersHorizontal className="size-4" /> Filters</h3>
          {Filters}
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <button className="lg:hidden inline-flex items-center gap-2 border rounded-full px-4 py-2 text-sm" onClick={() => setOpenFilters(true)}>
              <SlidersHorizontal className="size-4" /> Filters
            </button>
            <select
              value={sort || "popularity"}
              onChange={e => navigate({ to: "/products", search: (prev: any) => ({ ...prev, sort: e.target.value as any }) })}
              className="ml-auto bg-card border rounded-full px-4 py-2 text-sm focus:outline-none">
              <option value="popularity">Popularity</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No products match your filters.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </motion.div>
          )}
        </div>
      </div>

      {openFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setOpenFilters(false)}>
          <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} className="bg-background h-full w-80 p-5 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setOpenFilters(false)}><X /></button>
            </div>
            {Filters}
          </motion.aside>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-medium text-sm mb-2">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
