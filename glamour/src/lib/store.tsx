import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PRODUCTS, loadAdminProducts, type Product } from "./products";

export type CartItem = { productId: string; size: string; color: string; qty: number };
export type Address = {
  fullName: string; mobile: string; email: string;
  address: string; city: string; state: string; pincode: string;
};
export type Order = {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  payment: string;
  address: Address;
  status: "Placed" | "Shipped" | "Delivered" | "Cancelled";
};

type StoreCtx = {
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  user: { name: string; email: string } | null;
  addresses: Address[];
  addToCart: (i: CartItem) => void;
  updateQty: (idx: number, qty: number) => void;
  removeFromCart: (idx: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  inWishlist: (id: string) => boolean;
  placeOrder: (o: Omit<Order, "id" | "date" | "status">) => Order;
  setUser: (u: { name: string; email: string } | null) => void;
  saveAddress: (a: Address) => void;
  removeAddress: (idx: number) => void;
};

const Ctx = createContext<StoreCtx | null>(null);

function load<T>(k: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; }
}
function save<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUserState] = useState<{ name: string; email: string } | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadAdminProducts();
    setCart(load("glamora.cart", []));
    setWishlist(load("glamora.wishlist", []));
    setOrders(load("glamora.orders", []));
    setUserState(load("glamora.user", null));
    setAddresses(load("glamora.addresses", []));
    setReady(true);
  }, []);

  useEffect(() => { if (ready) save("glamora.cart", cart); }, [cart, ready]);
  useEffect(() => { if (ready) save("glamora.wishlist", wishlist); }, [wishlist, ready]);
  useEffect(() => { if (ready) save("glamora.orders", orders); }, [orders, ready]);
  useEffect(() => { if (ready) save("glamora.user", user); }, [user, ready]);
  useEffect(() => { if (ready) save("glamora.addresses", addresses); }, [addresses, ready]);

  const value: StoreCtx = {
    cart, wishlist, orders, user, addresses,
    addToCart: (i) => setCart(prev => {
      const idx = prev.findIndex(x => x.productId === i.productId && x.size === i.size && x.color === i.color);
      if (idx >= 0) { const n = [...prev]; n[idx] = { ...n[idx], qty: n[idx].qty + i.qty }; return n; }
      return [...prev, i];
    }),
    updateQty: (idx, qty) => setCart(prev => prev.map((it, i) => i === idx ? { ...it, qty: Math.max(1, qty) } : it)),
    removeFromCart: (idx) => setCart(prev => prev.filter((_, i) => i !== idx)),
    clearCart: () => setCart([]),
    toggleWishlist: (id) => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]),
    inWishlist: (id) => wishlist.includes(id),
    placeOrder: (o) => {
      const order: Order = { ...o, id: "GLM" + Math.floor(Math.random() * 9_000_000 + 1_000_000), date: new Date().toISOString(), status: "Placed" };
      setOrders(prev => [order, ...prev]);
      return order;
    },
    setUser: (u) => setUserState(u),
    saveAddress: (a) => setAddresses(prev => [...prev, a]),
    removeAddress: (idx) => setAddresses(prev => prev.filter((_, i) => i !== idx)),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used within StoreProvider");
  return v;
}

export function cartTotals(cart: CartItem[]) {
  const items = cart.map(i => ({ ...i, product: PRODUCTS.find(p => p.id === i.productId)! })).filter(i => i.product);
  const subtotal = items.reduce((s, i) => s + i.product.mrp * i.qty, 0);
  const discount = items.reduce((s, i) => s + (i.product.mrp - i.product.price) * i.qty, 0);
  const afterDisc = subtotal - discount;
  const shipping = afterDisc > 999 || afterDisc === 0 ? 0 : 49;
  const gst = Math.round(afterDisc * 0.05);
  const total = afterDisc + shipping + gst;
  return { items, subtotal, discount, shipping, gst, total };
}

export type CartLine = ReturnType<typeof cartTotals>["items"][number];
export type { Product };
