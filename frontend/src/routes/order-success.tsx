import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Download } from "lucide-react";
import { useStore } from "@/lib/store";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";

const search = z.object({ id: fallback(z.string().optional(), undefined) });

export const Route = createFileRoute("/order-success")({
  validateSearch: zodValidator(search),
  component: OrderSuccess,
});

function OrderSuccess() {
  const { id } = Route.useSearch();
  const { orders } = useStore();
  const order = orders.find(o => o.id === id) || orders[0];
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
        className="size-24 mx-auto rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mb-6">
        <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <Check className="size-12" strokeWidth={3} />
        </motion.div>
      </motion.div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold">Order Placed Successfully!</h1>
      <p className="text-muted-foreground mt-2">Thank you for shopping with Glamora.</p>
      {order && (
        <div className="bg-card border rounded-2xl p-6 mt-8 text-left">
          <Row k="Order ID" v={order.id} />
          <Row k="Order Date" v={new Date(order.date).toLocaleString()} />
          <Row k="Payment Method" v={order.payment} />
          <Row k="Expected Delivery" v={new Date(Date.now() + 5 * 86400000).toDateString()} />
          <Row k="Total" v={`₹${order.total.toLocaleString("en-IN")}`} bold />
        </div>
      )}
      <div className="flex flex-wrap gap-3 justify-center mt-8">
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 border rounded-full px-5 py-2.5 text-sm hover:bg-secondary"><Download className="size-4" /> Download Invoice</button>
        <Link to="/products" className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium">Continue Shopping</Link>
        <Link to="/orders" className="border rounded-full px-5 py-2.5 text-sm">View Orders</Link>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return <div className={`flex justify-between py-1.5 text-sm ${bold ? "font-semibold text-base" : ""}`}><span className="text-muted-foreground">{k}</span><span>{v}</span></div>;
}
