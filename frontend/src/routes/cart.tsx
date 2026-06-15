import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { cartTotals, useStore } from "@/lib/store";
import { inr, PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/glamora/ProductCard";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { cart, updateQty, removeFromCart } = useStore();
  const totals = cartTotals(cart);
  const [coupon, setCoupon] = useState("");
  const [extra, setExtra] = useState(0);
  const nav = useNavigate();

  const apply = () => {
    if (coupon.toUpperCase() === "GLAM10") { setExtra(Math.round(totals.total * 0.1)); toast.success("Coupon applied: 10% off"); }
    else toast.error("Invalid coupon. Try GLAM10");
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="size-12 mx-auto text-muted-foreground mb-3" />
        <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-5">Add a few favourites to get started.</p>
        <Link to="/products" className="inline-block bg-primary text-primary-foreground rounded-full px-6 py-2.5">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="font-display text-3xl font-bold">Shopping Cart ({cart.length})</h1>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {totals.items.map((it, idx) => (
            <div key={idx} className="flex gap-4 bg-card border rounded-2xl p-4">
              <Link to="/product/$id" params={{ id: it.product.id }} className="size-28 rounded-xl overflow-hidden bg-secondary shrink-0">
                <img src={it.product.images[0]} alt={it.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase">{it.product.brand}</p>
                <Link to="/product/$id" params={{ id: it.product.id }} className="font-medium hover:text-primary">{it.product.name}</Link>
                <p className="text-xs text-muted-foreground mt-1">Size: {it.size} · Color: {it.color}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="inline-flex items-center border rounded-full">
                    <button onClick={() => updateQty(idx, it.qty - 1)} className="size-8 grid place-items-center"><Minus className="size-3.5" /></button>
                    <span className="px-3 text-sm">{it.qty}</span>
                    <button onClick={() => updateQty(idx, it.qty + 1)} className="size-8 grid place-items-center"><Plus className="size-3.5" /></button>
                  </div>
                  <button onClick={() => removeFromCart(idx)} className="text-sm text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
                    <Trash2 className="size-4" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{inr(it.product.price * it.qty)}</p>
                <p className="text-xs text-muted-foreground line-through">{inr(it.product.mrp * it.qty)}</p>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="bg-card border rounded-2xl p-5">
            <h3 className="font-semibold mb-3">Apply Coupon</h3>
            <div className="flex gap-2">
              <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="GLAM10" className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm" />
              <button onClick={apply} className="bg-primary text-primary-foreground rounded-lg px-4 text-sm font-medium">Apply</button>
            </div>
          </div>
          <div className="bg-card border rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Price Details</h3>
            <dl className="space-y-2 text-sm">
              <Row k="Subtotal" v={inr(totals.subtotal)} />
              <Row k="Discount" v={`− ${inr(totals.discount)}`} c="text-emerald-600" />
              <Row k="Shipping" v={totals.shipping === 0 ? "FREE" : inr(totals.shipping)} />
              <Row k="GST (5%)" v={inr(totals.gst)} />
              {extra > 0 && <Row k="Coupon (GLAM10)" v={`− ${inr(extra)}`} c="text-emerald-600" />}
              <div className="border-t pt-3 mt-3 flex justify-between font-semibold text-base">
                <span>Total</span><span>{inr(totals.total - extra)}</span>
              </div>
            </dl>
            <button onClick={() => nav({ to: "/checkout" })} className="mt-4 w-full bg-primary text-primary-foreground rounded-full py-3 font-medium hover:opacity-90">Proceed to Checkout</button>
          </div>
        </aside>
      </div>

      <div className="mt-14">
        <h2 className="font-display text-2xl font-bold mb-5">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {PRODUCTS.slice(10, 14).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, c }: { k: string; v: string; c?: string }) {
  return <div className="flex justify-between"><dt className="text-muted-foreground">{k}</dt><dd className={c}>{v}</dd></div>;
}
