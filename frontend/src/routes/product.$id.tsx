import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getProduct, inr, PRODUCTS, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { Heart, ShoppingBag, Star, Truck, RefreshCw, ShieldCheck, Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/glamora/ProductCard";
import { toast } from "sonner";
import { productsApi, type ApiProduct } from "@/lib/api";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  notFoundComponent: () => <div className="py-20 text-center">Product not found</div>,
});

// Convert ApiProduct (DB) to Product shape
function apiToProduct(p: ApiProduct): Product {
  return {
    id: p._id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    type: p.type,
    tags: p.tags,
    price: p.price,
    mrp: p.mrp,
    rating: p.rating ?? 4.0,
    reviews: p.reviews ?? 0,
    sizes: p.sizes,
    colors: p.colors,
    images: p.images,
    description: p.description,
    stock: p.stock,
    season: p.season,
  };
}

function ProductPage() {
  const { id } = Route.useParams();
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const nav = useNavigate();

  // Try static lookup first; fallback to DB fetch for admin-added products
  const staticProduct = getProduct(id);
  const [product, setProduct] = useState<Product | null | undefined>(staticProduct);
  const [loadingDb, setLoadingDb] = useState(!staticProduct);

  useEffect(() => {
    if (staticProduct) {
      setProduct(staticProduct);
      setLoadingDb(false);
      return;
    }
    // Not found in static list — try fetching from DB (admin-added product)
    setLoadingDb(true);
    productsApi.getById(id)
      .then(res => setProduct(apiToProduct(res.product)))
      .catch(() => setProduct(null))
      .finally(() => setLoadingDb(false));
  }, [id]);

  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [qty, setQty] = useState(1);

  // Update size/color when product loads
  useEffect(() => {
    if (product) {
      setSize(product.sizes[1] || product.sizes[0] || "");
      setColor(product.colors[0]?.name || "");
    }
  }, [product]);

  if (loadingDb) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!product) return <div className="py-20 text-center">Product not found</div>;

  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const similar = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const add = () => {
    if (!size) return toast.error("Please select a size");
    addToCart({ productId: product.id, size, color, qty });
    toast.success("Added to cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="w-[90%]">
          <motion.div key={img} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-[2/3] rounded-2xl overflow-hidden bg-secondary group">
            <img src={product.images[img]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </motion.div>
          <div className="flex gap-2 mt-3">
            {product.images.map((src, i) => (
              <button key={i} onClick={() => setImg(i)} className={`size-20 rounded-lg overflow-hidden border-2 ${i === img ? "border-primary" : "border-transparent"}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">{product.brand}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">{product.name}</h1>
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded">
              {product.rating} <Star className="size-3 fill-current" />
            </span>
            <span className="text-sm text-muted-foreground">{product.reviews} reviews</span>
          </div>
          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-bold">{inr(product.price)}</span>
            <span className="text-muted-foreground line-through">{inr(product.mrp)}</span>
            {off > 0 && <span className="text-emerald-600 font-semibold">{off}% off</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">inclusive of all taxes</p>

          <div className="mt-6">
            <p className="font-medium mb-2">Select Size</p>
            <div className="flex gap-2">
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSize(s)} className={`size-11 rounded-full border font-medium ${size === s ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary"}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="font-medium mb-2">Color: <span className="text-muted-foreground font-normal">{color}</span></p>
            <div className="flex gap-2">
              {product.colors.map(c => (
                <button key={c.name} onClick={() => setColor(c.name)} title={c.name}
                  className={`size-8 rounded-full border-2 ${color === c.name ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                  style={{ background: c.hex }} />
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <p className="font-medium">Quantity</p>
            <div className="inline-flex items-center border rounded-full">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="size-9 grid place-items-center"><Minus className="size-4" /></button>
              <span className="px-3 font-medium">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="size-9 grid place-items-center"><Plus className="size-4" /></button>
            </div>
            {product.stock === 0 && <span className="text-destructive text-sm font-medium">Out of stock</span>}
          </div>

          <div className="flex gap-3 mt-7">
            <button onClick={add} disabled={product.stock === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3 font-medium hover:opacity-90 disabled:opacity-50">
              <ShoppingBag className="size-4" /> Add to Cart
            </button>
            <button onClick={() => { add(); nav({ to: "/checkout" }); }} disabled={product.stock === 0}
              className="flex-1 bg-foreground text-background rounded-full py-3 font-medium hover:opacity-90 disabled:opacity-50">Buy Now</button>
            <button onClick={() => toggleWishlist(product.id)} className="size-12 grid place-items-center border rounded-full hover:bg-secondary">
              <Heart className={`size-5 ${inWishlist(product.id) ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-7 text-xs">
            {[{ I: Truck, t: "Free Shipping" }, { I: RefreshCw, t: "7-day Returns" }, { I: ShieldCheck, t: "Secure Checkout" }].map(({ I, t }) => (
              <div key={t} className="flex flex-col items-center gap-1 bg-secondary rounded-xl p-3"><I className="size-4 text-primary" /> {t}</div>
            ))}
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
            <h3 className="font-semibold mt-5 mb-2">Specifications</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><span className="text-foreground font-medium">Brand:</span> {product.brand}</li>
              <li><span className="text-foreground font-medium">Type:</span> {product.type}</li>
              <li><span className="text-foreground font-medium">Category:</span> {product.category}</li>
              <li><span className="text-foreground font-medium">Available Sizes:</span> {product.sizes.join(", ")}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {similar.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
      <Link to="/" className="hidden" />
    </div>
  );
}
