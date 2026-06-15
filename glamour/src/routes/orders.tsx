import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { getProduct, inr } from "@/lib/products";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/orders")({ component: OrdersPage });

function OrdersPage() {
  const { orders } = useStore();
  const [tab, setTab] = useState<"current" | "delivered" | "cancelled">("current");
  const filtered = orders.filter(o => tab === "current" ? o.status === "Placed" || o.status === "Shipped" : tab === "delivered" ? o.status === "Delivered" : o.status === "Cancelled");
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-6">My Orders</h1>
      <div className="flex gap-2 mb-6 border-b">
        {(["current","delivered","cancelled"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="size-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">No orders here yet.</p>
          <Link to="/products" className="inline-block bg-primary text-primary-foreground rounded-full px-6 py-2.5">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(o => (
            <div key={o.id} className="bg-card border rounded-2xl p-5">
              <div className="flex flex-wrap justify-between gap-3 mb-4 text-sm">
                <div><p className="font-semibold">Order {o.id}</p><p className="text-muted-foreground">{new Date(o.date).toLocaleDateString()}</p></div>
                <div className="text-right"><p className="font-semibold">{inr(o.total)}</p><span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{o.status}</span></div>
              </div>
              <div className="space-y-3">
                {o.items.map((it, i) => {
                  const p = getProduct(it.productId);
                  if (!p) return null;
                  return (
                    <div key={i} className="flex gap-3">
                      <img src={p.images[0]} className="size-16 rounded object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">Size {it.size} · Qty {it.qty}</p>
                      </div>
                      <p className="text-sm font-medium">{inr(p.price * it.qty)}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => toast.info("Tracking: Order in transit")} className="text-sm border rounded-full px-4 py-1.5 hover:bg-secondary">Track Order</button>
                <button onClick={() => toast.info("Reorder added to cart")} className="text-sm border rounded-full px-4 py-1.5 hover:bg-secondary">Reorder</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
