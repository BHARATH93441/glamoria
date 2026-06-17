import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PRODUCTS, inr, type Product } from "@/lib/products";
import { productsApi, type ApiProduct } from "@/lib/api";
import { useStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Package, ShieldCheck, ArrowLeft, Loader2, Pencil, X, Check } from "lucide-react";
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
const TYPES = ["Topwear", "Bottomwear", "Saree", "Kids"];
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

const emptyForm = {
  name: "",
  brand: "",
  category: "women" as (typeof CATS)[number],
  type: "Topwear",
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
};

function productToForm(p: ApiProduct) {
  const imgs = [...p.images, "", "", ""];
  return {
    name: p.name,
    brand: p.brand,
    category: p.category,
    type: p.type,
    price: String(p.price),
    mrp: String(p.mrp),
    image1: imgs[0] || "",
    image2: imgs[1] || "",
    image3: imgs[2] || "",
    description: p.description,
    stock: String(p.stock),
    sizes: p.sizes,
    colors: p.colors.map(c => c.name),
    tags: p.tags,
  };
}

function AdminPage() {
  const { user } = useStore();
  const [dbProducts, setDbProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSaving, setEditSaving] = useState(false);

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

  // ── Add product ────>
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
      setForm({ ...emptyForm });
    } catch (err: any) {
      toast.error(err.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete product ──────────────────────────────────────────────────────────
  const remove = async (id: string) => {
    try {
      await productsApi.delete(id);
      setDbProducts(prev => prev.filter(p => p._id !== id));
      if (editId === id) setEditId(null);
      toast.success("Product removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove product");
    }
  };

  // ── Edit product ────────────────────────────────────────────────────────────
  const startEdit = (p: ApiProduct) => {
    setEditId(p._id);
    setEditForm(productToForm(p));
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const saveEdit = async (id: string) => {
    if (!editForm.name || !editForm.brand || !editForm.price || !editForm.mrp || !editForm.image1) {
      return toast.error("Name, brand, price, MRP and at least 1 image are required");
    }
    if (editForm.sizes.length === 0) return toast.error("Pick at least one size");
    if (editForm.colors.length === 0) return toast.error("Pick at least one color");

    setEditSaving(true);
    try {
      const res = await productsApi.update(id, {
        name: editForm.name.trim(),
        brand: editForm.brand.trim(),
        category: editForm.category,
        type: editForm.type,
        tags: Array.from(new Set([editForm.type.toLowerCase(), editForm.category, ...editForm.tags])),
        price: Number(editForm.price),
        mrp: Number(editForm.mrp),
        sizes: editForm.sizes,
        colors: COLOR_OPTIONS.filter(c => editForm.colors.includes(c.name)),
        images: [editForm.image1, editForm.image2, editForm.image3].filter(Boolean),
        description: editForm.description || `${editForm.name} from ${editForm.brand}.`,
        stock: Number(editForm.stock) || 0,
      });

      setDbProducts(prev => prev.map(p => p._id === id ? res.product : p));
      setEditId(null);
      toast.success("Product updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update product");
    } finally {
      setEditSaving(false);
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

          <SizesPicker sizes={form.sizes} toggle={s => setForm({ ...form, sizes: toggleArr(form.sizes, s) })} />
          <ColorsPicker colors={form.colors} toggle={c => setForm({ ...form, colors: toggleArr(form.colors, c) })} />
          <TagsPicker tags={form.tags} toggle={t => setForm({ ...form, tags: toggleArr(form.tags, t) })} />

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
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {dbProducts.map(p => (
                <div key={p._id}>
                  {/* Product card */}
                  <div className={`border rounded-xl p-3 transition-all ${editId === p._id ? "border-primary ring-2 ring-primary/20 bg-secondary/30" : ""}`}>
                    <div className="flex gap-3">
                      <img src={p.images[0]} alt={p.name} className="size-16 rounded-lg object-cover bg-secondary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand} · {p.category}</p>
                        <p className="text-sm font-semibold mt-0.5">{inr(p.price)}</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => editId === p._id ? cancelEdit() : startEdit(p)}
                          title={editId === p._id ? "Cancel edit" : "Edit product"}
                          className={`size-8 rounded-lg grid place-items-center transition-colors ${editId === p._id ? "bg-secondary text-muted-foreground" : "text-primary hover:bg-primary/10"}`}
                        >
                          {editId === p._id ? <X className="size-4" /> : <Pencil className="size-4" />}
                        </button>
                        <button onClick={() => remove(p._id)} title="Delete product" className="text-destructive hover:bg-destructive/10 rounded-lg size-8 grid place-items-center">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inline edit form */}
                    <AnimatePresence>
                      {editId === p._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <Input label="Name *" value={editForm.name} onChange={v => setEditForm({ ...editForm, name: v })} />
                              <Input label="Brand *" value={editForm.brand} onChange={v => setEditForm({ ...editForm, brand: v })} />
                              <Select label="Category" value={editForm.category} onChange={v => setEditForm({ ...editForm, category: v as any })}
                                options={CATS.map(c => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))} />
                              <Select label="Type" value={editForm.type} onChange={v => setEditForm({ ...editForm, type: v })}
                                options={TYPES.map(t => ({ value: t, label: t }))} />
                              <Input label="Price (₹) *" type="number" value={editForm.price} onChange={v => setEditForm({ ...editForm, price: v })} />
                              <Input label="MRP (₹) *" type="number" value={editForm.mrp} onChange={v => setEditForm({ ...editForm, mrp: v })} />
                              <Input label="Stock" type="number" value={editForm.stock} onChange={v => setEditForm({ ...editForm, stock: v })} />
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">Image URLs</p>
                              <Input label="" placeholder="Image URL 1 (required)" value={editForm.image1} onChange={v => setEditForm({ ...editForm, image1: v })} />
                              <Input label="" placeholder="Image URL 2 (optional)" value={editForm.image2} onChange={v => setEditForm({ ...editForm, image2: v })} />
                              <Input label="" placeholder="Image URL 3 (optional)" value={editForm.image3} onChange={v => setEditForm({ ...editForm, image3: v })} />
                            </div>

                            <SizesPicker sizes={editForm.sizes} toggle={s => setEditForm({ ...editForm, sizes: toggleArr(editForm.sizes, s) })} />
                            <ColorsPicker colors={editForm.colors} toggle={c => setEditForm({ ...editForm, colors: toggleArr(editForm.colors, c) })} />
                            <TagsPicker tags={editForm.tags} toggle={t => setEditForm({ ...editForm, tags: toggleArr(editForm.tags, t) })} />

                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Description</label>
                              <textarea
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                rows={2}
                                className="mt-1 w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEdit(p._id)}
                                disabled={editSaving}
                                className="flex-1 bg-primary text-primary-foreground rounded-full py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                              >
                                {editSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                                {editSaving ? "Saving…" : "Save Changes"}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-4 py-2 rounded-full border text-sm font-medium hover:bg-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function SizesPicker({ sizes, toggle }: { sizes: string[]; toggle: (s: string) => void }) {
  return (
    <div>
      <p className="text-sm font-medium mb-2">Available Sizes</p>
      <div className="flex flex-wrap gap-2">
        {SIZE_OPTIONS.map(s => (
          <button type="button" key={s}
            onClick={() => toggle(s)}
            className={`size-10 rounded-full border text-xs font-medium ${sizes.includes(s) ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary"}`}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorsPicker({ colors, toggle }: { colors: string[]; toggle: (c: string) => void }) {
  return (
    <div>
      <p className="text-sm font-medium mb-2">Colors</p>
      <div className="flex flex-wrap gap-2">
        {COLOR_OPTIONS.map(c => (
          <button type="button" key={c.name} title={c.name}
            onClick={() => toggle(c.name)}
            className={`size-8 rounded-full border-2 ${colors.includes(c.name) ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
            style={{ background: c.hex }} />
        ))}
      </div>
    </div>
  );
}

function TagsPicker({ tags, toggle }: { tags: string[]; toggle: (t: string) => void }) {
  return (
    <div>
      <p className="text-sm font-medium mb-2">Tags / Sections</p>
      <div className="flex flex-wrap gap-2">
        {TAG_OPTIONS.map(t => (
          <button type="button" key={t}
            onClick={() => toggle(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${tags.includes(t) ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary"}`}>
            {t}
          </button>
        ))}
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
