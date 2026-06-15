import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { inr, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, inWishlist, addToCart } = useStore();
  const wished = inWishlist(product.id);
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="group card-hover rounded-2xl overflow-hidden bg-card border"
    >
      <Link to="/product/$id" params={{ id: product.id }} className="block relative">
        <div className="aspect-[3/4] overflow-hidden bg-secondary">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        {off > 0 && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
            {off}% OFF
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); toast.success(wished ? "Removed from wishlist" : "Added to wishlist"); }}
          className="absolute top-3 right-3 size-9 rounded-full bg-background/90 backdrop-blur grid place-items-center hover:bg-primary hover:text-primary-foreground transition"
          aria-label="Wishlist"
        >
          <Heart className={`size-4 ${wished ? "fill-primary text-primary" : ""}`} />
        </button>
      </Link>
      <div className="p-4 space-y-1.5">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.brand}</p>
        <Link to="/product/$id" params={{ id: product.id }}>
          <h3 className="font-medium line-clamp-1 hover:text-primary transition">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 text-xs">
          <span className="inline-flex items-center gap-0.5 bg-emerald-600 text-white px-1.5 py-0.5 rounded">
            {product.rating} <Star className="size-3 fill-current" />
          </span>
          <span className="text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-semibold text-lg">{inr(product.price)}</span>
          <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>
        </div>
        <button
          onClick={() => { addToCart({ productId: product.id, size: product.sizes[1] || product.sizes[0], color: product.colors[0].name, qty: 1 }); toast.success("Added to cart"); }}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground text-sm font-medium py-2 transition"
        >
          <ShoppingBag className="size-4" /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
