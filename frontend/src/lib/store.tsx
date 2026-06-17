import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PRODUCTS, type Product } from "./products";
import {
  authApi, cartApi, wishlistApi, addressesApi, ordersApi, productsApi, type ApiProduct,
  type AuthUser, type CartItem as ApiCartItem, type Address as ApiAddress, type ApiOrder,
} from "./api";

// ── Types ───────────────────────────────────────────────────────────────────

export type CartItem = ApiCartItem;
export type Address = ApiAddress;

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
  user: AuthUser | null;
  addresses: Address[];
  loading: boolean;
  productCache: Map<string, Product>;
  addToCart: (i: CartItem) => Promise<void>;
  updateQty: (idx: number, qty: number) => Promise<void>;
  removeFromCart: (idx: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (id: string) => Promise<void>;
  inWishlist: (id: string) => boolean;
  placeOrder: (o: Omit<Order, "id" | "date" | "status">) => Promise<Order>;
  setUser: (u: AuthUser | null) => void;
  logout: () => Promise<void>;
  saveAddress: (a: Omit<Address, "_id">) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
};

const Ctx = createContext<StoreCtx | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [productCache, setProductCache] = useState<Map<string, Product>>(new Map());

  // ── Load from DB on mount (if cookie is valid) ──────────────────────────
  useEffect(() => {
    // Always load product cache regardless of auth
    productsApi.list().then(res => {
      const map = new Map<string, Product>();
      res.products.forEach((p: ApiProduct) => {
        map.set(p._id, {
          id: p._id, name: p.name, brand: p.brand, category: p.category,
          type: p.type, tags: p.tags, price: p.price, mrp: p.mrp,
          rating: p.rating ?? 4.0, reviews: p.reviews ?? 0,
          sizes: p.sizes, colors: p.colors, images: p.images,
          description: p.description, stock: p.stock, season: p.season,
        });
      });
      setProductCache(map);
    }).catch(() => {});

    (async () => {
      try {
        const { user: me } = await authApi.me();
        setUserState(me);

        // Load all user data from DB in parallel
        const [cartRes, ordersRes] = await Promise.all([
          cartApi.get(),
          ordersApi.list(),
        ]);

        setCart(cartRes.items);
        setWishlist(me.wishlist || []);
        setAddresses(me.addresses || []);
        setOrders(ordersRes.orders.map(mapOrder));
      } catch {
        // No valid session — user not logged in, start fresh
        setCart([]);
        setWishlist([]);
        setAddresses([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function mapOrder(o: ApiOrder): Order {
    return {
      id: o._id,
      date: o.createdAt,
      items: o.items,
      total: o.total,
      payment: o.payment,
      address: o.address,
      status: o.status,
    };
  }

  const setUser = (u: AuthUser | null) => setUserState(u);

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    setUserState(null);
    setCart([]);
    setWishlist([]);
    setAddresses([]);
    setOrders([]);
  };

  // ── Cart operations ───────────────────────────────────────────────────────

  const addToCart = async (item: CartItem) => {
    if (!user) {
      // Guest: just update local state (won't persist across refresh)
      setCart(prev => {
        const idx = prev.findIndex(x => x.productId === item.productId && x.size === item.size && x.color === item.color);
        if (idx >= 0) { const n = [...prev]; n[idx] = { ...n[idx], qty: n[idx].qty + item.qty }; return n; }
        return [...prev, item];
      });
      return;
    }
    const res = await cartApi.addItem(item);
    setCart(res.items);
  };

  const updateQty = async (idx: number, qty: number) => {
    if (!user) {
      setCart(prev => prev.map((it, i) => i === idx ? { ...it, qty: Math.max(1, qty) } : it));
      return;
    }
    const res = await cartApi.updateQty(idx, qty);
    setCart(res.items);
  };

  const removeFromCart = async (idx: number) => {
    if (!user) {
      setCart(prev => prev.filter((_, i) => i !== idx));
      return;
    }
    const res = await cartApi.removeItem(idx);
    setCart(res.items);
  };

  const clearCart = async () => {
    if (!user) { setCart([]); return; }
    await cartApi.clear();
    setCart([]);
  };

  // ── Wishlist ──────────────────────────────────────────────────────────────

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      // Guest: local toggle only
      setWishlist(prev => prev.includes(productId) ? prev.filter(x => x !== productId) : [...prev, productId]);
      return;
    }
    const res = await wishlistApi.toggle(productId);
    setWishlist(res.wishlist);
  };

  const inWishlist = (id: string) => wishlist.includes(id);

  // ── Orders ────────────────────────────────────────────────────────────────

  const placeOrder = async (o: Omit<Order, "id" | "date" | "status">): Promise<Order> => {
    if (!user) {
      throw new Error("Please log in to place an order");
    }
    const res = await ordersApi.place({
      items: o.items,
      total: o.total,
      payment: o.payment,
      address: o.address,
    });
    const order = mapOrder(res.order);
    setOrders(prev => [order, ...prev]);
    return order;
  };

  // ── Addresses ─────────────────────────────────────────────────────────────

  const saveAddress = async (a: Omit<Address, "_id">) => {
    if (!user) return;
    const res = await addressesApi.add(a);
    setAddresses(res.addresses);
  };

  const removeAddress = async (addressId: string) => {
    if (!user) return;
    const res = await addressesApi.remove(addressId);
    setAddresses(res.addresses);
  };

  const value: StoreCtx = {
    cart, wishlist, orders, user, addresses, loading, productCache,
    addToCart, updateQty, removeFromCart, clearCart,
    toggleWishlist, inWishlist,
    placeOrder,
    setUser, logout,
    saveAddress, removeAddress,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used within StoreProvider");
  return v;
}

// ── Cart totals helper ────────────────────────────────────────────────────────

export function cartTotals(cart: CartItem[], productCache?: Map<string, Product>) {
  const items = cart.map(i => {
    const product = productCache?.get(i.productId) || PRODUCTS.find(p => p.id === i.productId);
    return product ? { ...i, product } : null;
  }).filter(Boolean) as Array<CartItem & { product: Product }>;
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
