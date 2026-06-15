import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { getProduct } from "@/lib/products";
import { ProductCard } from "@/components/glamora/ProductCard";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/wishlist")({ component: WishlistPage });

function WishlistPage() {
  const { wishlist } = useStore();
  const products = wishlist.map(getProduct).filter(Boolean) as ReturnType<typeof getProduct>[] as any[];
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-6">My Wishlist</h1>
      {products.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="size-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
          <Link to="/products" className="inline-block bg-primary text-primary-foreground rounded-full px-6 py-2.5">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
