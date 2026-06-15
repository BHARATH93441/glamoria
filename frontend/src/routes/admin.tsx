import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PRODUCTS, inr, type Product } from "@/lib/products";
import { productsApi, type ApiProduct } from "@/lib/api";
import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Plus, Trash2, Package, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Glamora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const CATS = ["women", "men", "kids"] as const;
const TYPES = ["T-Shirt","Shirt","Kurti","Saree","Jeans","Dress","Hoodie","Jacket","Blazer","Kurta","Top","Sherwani"];
const TAG_OPTIONS = ["ethnic","western","casual","formal","party","summer","winter"];
const COLOR_OPTIONS = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#ffffff" },
  { name: "Pink", hex: "#E91E63" },
  { name: "Blue", hex: "#1e88e5" },
  { name: "Red", hex: "#e53935" },
  { name: "Green", hex: "#43a047" },
  { name: "Yellow", hex: "#fdd835" },
];
const SIZE_OPTIONS = ["S","M","L","XL","XXL"];

function AdminPage() {
  const { user } = useStore();
  const [dbProducts, setDbProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "women" as (typeof CATS)[number],
    type: "Dress",
    price: "",
    mrp: "",
    image1: "",
    image2: "",
    image3: "",
    description: "",
    stock: "25",
    sizes: ["S","M","L","XL"],
    colors: ["Black","White"],
    tags: ["casual"] as string[],
  });

  // Load admin-added products from the backend on mount
  useEffect(() => {
    productsApi.list().then(res => {
      setDbProducts(res.products);
      setLoading(false);
    }).catch(() => {
      toast.error("Could not load products from server");
      setLoading(false);
    });
  }, []);

  const toggleArr = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.brand || !form.price || !form.mrp || !form.image1) {
      return toast.error("Name, brand, price, MRP and at least 1 image are required");
    }
    if (form.sizes.length === 0) return toast.error("Pick at least one size");
    if (form.colors.length === 0) return toast.error("Pick at least one color");

    setSaving(true);
    try {
      const res = await productsApi.add({
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category,
        type: form.type,
        tags: Array.from(new Set([form.type.toLowerCase(), form.category, ...form.tags])),
        price: Number(form.price),
        mrp: Number(form.mrp),
        sizes: form.sizes,
        colors: COLOR_OPTIONS.filter(c => form.colors.includes(c.name)),
        images: [form.image1, form.image2, form.image3].filter(Boolean),
        description: form.description || `${form.name} from ${form.brand}.`,
        stock: Number(form.stock) || 0,
      });

      setDbProducts(prev => [res.product, ...prev]);
      toast.success("Product added to database!");
      setForm({ ...form, name: "", brand: "", price: "", mrp: "", image1: "", image2: "", image3: "", description: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await productsApi.delete(id);
      setDbProducts(prev => prev.filter(p => p._id !== id));
      toast.success("Product removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove product");
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShieldCheck className="size-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-xl font-semibold">Please log in to access the admin panel</p>
        <Link to="/login" className="inline-block mt-4 bg-primary text-primary-foreground rounded-full px-6 py-2.5">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="size-4" /> Back to Cart
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold flex items-center gap-2">
            <ShieldCheck className="size-7 text-primary" /> Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Products are saved directly to MongoDB — they persist across all sessions.
          </p>
        </div>
        <div className="flex gap-3">
          <Stat label="Total products" value={PRODUCTS.length + dbProducts.length} />
          <Stat label="DB products" value={dbProducts.length} />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Add product form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="lg:col-span-3 bg-card border rounded-2xl p-6 space-y-5"
        >
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Plus className="size-5 text-primary" /> Add New Product
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Product Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <Input label="Brand *" value={form.brand} onChange={v => setForm({ ...form, brand: v })} />

            <Select label="Category *" value={form.category} onChange={v => setForm({ ...form, category: v as any })}
              options={CATS.map(c => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))} />
            <Select label="Type *" value={form.type} onChange={v => setForm({ ...form, type: v })}
              options={TYPES.map(t => ({ value: t, label: t }))} />

            <Input label="Selling Price (₹) *" type="number" value={form.price} onChange={v => setForm({ ...form, price: v })} />
            <Input label="MRP (₹) *" type="number" value={form.mrp} onChange={v => setForm({ ...form, mrp: v })} />

            <Input label="Stock Quantity" type="number" value={form.stock} onChange={v => setForm({ ...form, stock: v })} />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Images (paste image URLs)</p>
            <div className="space-y-2">
              <Input label="" placeholder="Image URL 1 (required)" value={form.image1} onChange={v => setForm({ ...form, image1: v })} />
              <Input label="" placeholder="Image URL 2 (optional)" value={form.image2} onChange={v => setForm({ ...form, image2: v })} />
              <Input label="" placeholder="Image URL 3 (optional)" value={form.image3} onChange={v => setForm({ ...form, image3: v })} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Available Sizes</p>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map(s => (
                <button type="button" key={s}
                  onClick={() => setForm({ ...form, sizes: toggleArr(form.sizes, s) })}
                  className={`size-10 rounded-full border text-xs font-medium ${form.sizes.includes(s) ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Colors</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button type="button" key={c.name} title={c.name}
                  onClick={() => setForm({ ...form, colors: toggleArr(form.colors, c.name) })}
                  className={`size-8 rounded-full border-2 ${form.colors.includes(c.name) ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                  style={{ background: c.hex }} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Tags / Sections</p>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map(t => (
                <button type="button" key={t}
                  onClick={() => setForm({ ...form, tags: toggleArr(form.tags, t) })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${form.tags.includes(t) ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1 w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <button disabled={saving} className="w-full bg-primary text-primary-foreground rounded-full py-3 font-medium hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? "Saving to DB…" : "Add Product"}
          </button>
        </motion.form>

        {/* DB products list */}
        <div className="lg:col-span-2 bg-card border rounded-2xl p-6">
          <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <Package className="size-5 text-primary" /> DB Products ({dbProducts.length})
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : dbProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No products in DB yet.<br />Use the form to add your first one.
            </p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {dbProducts.map(p => (
                <div key={p._id} className="flex gap-3 border rounded-xl p-3">
                  <img src={p.images[0]} alt={p.name} className="size-16 rounded-lg object-cover bg-secondary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand} · {p.category}</p>
                    <p className="text-sm font-semibold mt-0.5">{inr(p.price)}</p>
                  </div>
                  <button onClick={() => remove(p._id)} className="text-destructive hover:bg-destructive/10 rounded-lg size-8 grid place-items-center shrink-0">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border rounded-xl px-4 py-3 text-center min-w-[110px]">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`${label ? "mt-1" : ""} w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="mt-1 w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
