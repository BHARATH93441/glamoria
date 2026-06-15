import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { cart, wishlist, user, logout } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const path = useRouterState({ select: s => s.location.pathname });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/products", search: { q: q.trim() } as any });
  };

  return (
    <>
      <div className="bg-primary text-primary-foreground text-center text-xs sm:text-sm py-2 px-4">
        ✨ Free shipping on orders above ₹999 • Style Beyond Trends
      </div>
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button className="md:hidden" onClick={() => setMenu(true)} aria-label="Menu"><Menu /></button>
          <Link to="/" className="font-display text-2xl sm:text-3xl font-bold tracking-tight relative bottom-1">
            Glamor<span className="text-primary">a</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-8 text-sm">
            {NAV.map(n => (
              <Link key={n.to} to={n.to} className={`hover:text-primary transition ${path === n.to ? "text-primary font-semibold" : ""}`}>
                {n.label}
              </Link>
            ))}
          </nav>
          <form onSubmit={submit} className="hidden sm:flex flex-1 max-w-md ml-auto relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search dresses, brands…"
              className="w-full bg-secondary rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </form>
          <div className="flex items-center gap-1 sm:gap-2 ml-auto sm:ml-0">
            <div className="relative">
              <button onClick={() => setOpen(o => !o)} className="size-10 grid place-items-center hover:bg-secondary rounded-full"><User className="size-5" /></button>
              <AnimatePresence>
                {open && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-12 w-52 bg-popover border rounded-xl shadow-lg p-2 z-50">
                    {user ? (
                      <>
                        <div className="px-3 py-2 text-xs text-muted-foreground">Hi, {user.name}</div>
                        {[
                          { to: "/profile", l: "Profile" },
                          { to: "/orders", l: "My Orders" },
                          { to: "/wishlist", l: "Wishlist" },
                        ].map(i => (
                          <Link key={i.to} to={i.to} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-secondary text-sm">{i.l}</Link>
                        ))}
                        <button onClick={() => { logout(); setOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary text-sm text-destructive">Logout</button>
                      </>
                    ) : (
                      <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-secondary text-sm">Login / Sign Up</Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/wishlist" className="relative size-10 grid place-items-center hover:bg-secondary rounded-full">
              <Heart className="size-5" />
              {wishlist.length > 0 && <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] rounded-full size-4 grid place-items-center">{wishlist.length}</span>}
            </Link>
            <Link to="/cart" className="relative size-10 grid place-items-center hover:bg-secondary rounded-full">
              <ShoppingBag className="size-5" />
              {cart.length > 0 && <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] rounded-full size-4 grid place-items-center">{cart.length}</span>}
            </Link>
            <Link to="/admin" className="inline-flex relative left-3 items-center gap-2 text-sm border rounded-full px-4 py-2 hover:bg-secondary">
              🛠️ Admin Panel
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setMenu(false)}>
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween" }}
              className="bg-background h-full w-72 p-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-2xl font-bold">Glamor<span className="text-primary">a</span></span>
                <button onClick={() => setMenu(false)}><X /></button>
              </div>
              <form onSubmit={submit} className="relative mb-4">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="w-full bg-secondary rounded-full pl-10 pr-4 py-2 text-sm" />
              </form>
              <nav className="space-y-1">
                {NAV.map(n => (
                  <Link key={n.to} to={n.to} onClick={() => setMenu(false)} className="block px-3 py-2.5 rounded-lg hover:bg-secondary">{n.label}</Link>
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
