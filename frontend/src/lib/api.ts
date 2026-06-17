// All requests include cookies automatically (httpOnly JWT set by backend)
// No token ever stored in localStorage

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include", // sends the httpOnly cookie automatically
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  wishlist: string[];
  addresses: Address[];
}

export interface Address {
  _id?: string;
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CartItem {
  productId: string;
  size: string;
  color: string;
  qty: number;
}

export interface ApiProduct {
  _id: string;
  name: string;
  brand: string;
  category: "women" | "men" | "kids";
  type: string;
  tags: string[];
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  description: string;
  stock: number;
  season?: "summer" | "winter";
  addedBy: string;
}

export interface ApiOrder {
  _id: string;
  userEmail: string;
  items: CartItem[];
  total: number;
  payment: string;
  address: Address;
  status: "Placed" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () =>
    request<{ message: string }>("/api/auth/logout", { method: "POST" }),

  me: () => request<{ user: AuthUser }>("/api/auth/me"),
};

// ── Cart ────────────────────────────────────────────────────────────────────

export const cartApi = {
  get: () => request<{ items: CartItem[] }>("/api/cart"),

  sync: (items: CartItem[]) =>
    request<{ items: CartItem[] }>("/api/cart", {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),

  addItem: (item: CartItem) =>
    request<{ items: CartItem[] }>("/api/cart/item", {
      method: "POST",
      body: JSON.stringify(item),
    }),

  updateQty: (index: number, qty: number) =>
    request<{ items: CartItem[] }>(`/api/cart/item/${index}`, {
      method: "PATCH",
      body: JSON.stringify({ qty }),
    }),

  removeItem: (index: number) =>
    request<{ items: CartItem[] }>(`/api/cart/item/${index}`, {
      method: "DELETE",
    }),

  clear: () => request<{ items: CartItem[] }>("/api/cart", { method: "DELETE" }),
};

// ── Wishlist ─────────────────────────────────────────────────────────────────

export const wishlistApi = {
  get: () => request<{ wishlist: string[] }>("/api/wishlist"),

  toggle: (productId: string) =>
    request<{ wishlist: string[] }>(`/api/wishlist/toggle/${productId}`, {
      method: "POST",
    }),
};

// ── Addresses ────────────────────────────────────────────────────────────────

export const addressesApi = {
  get: () => request<{ addresses: Address[] }>("/api/addresses"),

  add: (address: Omit<Address, "_id">) =>
    request<{ addresses: Address[] }>("/api/addresses", {
      method: "POST",
      body: JSON.stringify(address),
    }),

  remove: (addressId: string) =>
    request<{ addresses: Address[] }>(`/api/addresses/${addressId}`, {
      method: "DELETE",
    }),
};

// ── Products ────────────────────────────────────────────────────────────────

export const productsApi = {
  list: () => request<{ products: ApiProduct[] }>("/api/products"),

  getById: (id: string) => request<{ product: ApiProduct }>(`/api/products/${id}`),

  add: (body: Omit<ApiProduct, "_id" | "addedBy" | "rating" | "reviews">) =>
    request<{ product: ApiProduct }>("/api/products", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/api/products/${id}`, { method: "DELETE" }),

  update: (id: string, body: Partial<Omit<ApiProduct, "_id" | "addedBy" | "rating" | "reviews">>) =>
    request<{ product: ApiProduct }>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

// ── Orders ──────────────────────────────────────────────────────────────────

export const ordersApi = {
  list: () => request<{ orders: ApiOrder[] }>("/api/orders"),

  place: (body: { items: CartItem[]; total: number; payment: string; address: Address }) =>
    request<{ order: ApiOrder }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
