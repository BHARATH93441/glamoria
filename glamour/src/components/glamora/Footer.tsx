import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  return (
    <footer className="bg-secondary mt-20 border-t">
      <div className="max-w-7xl mx-auto px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl font-bold mb-3">Glamor<span className="text-primary">a</span></h3>
          <p className="text-sm text-muted-foreground mb-4">Style Beyond Trends. Premium fashion for every occasion.</p>
          <div className="flex gap-2">
            {[Instagram, Facebook, Twitter].map((I, i) => (
              <a key={i} href="#" className="size-9 grid place-items-center rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition"><I className="size-4" /></a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/products" className="hover:text-primary">Products</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Shipping Info</li>
            <li>Return Policy</li>
            <li>Privacy Policy</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Newsletter</h4>
          <form onSubmit={(e) => { e.preventDefault(); if (email) { toast.success("Subscribed! Welcome to Glamora"); setEmail(""); } }} className="flex gap-2 mb-4">
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Your email" className="flex-1 bg-background rounded-lg px-3 py-2 text-sm border" />
            <button className="bg-primary text-primary-foreground rounded-lg px-4 text-sm font-medium hover:opacity-90">Join</button>
          </form>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2 items-center"><Mail className="size-4" /> hello@glamora.com</li>
            <li className="flex gap-2 items-center"><Phone className="size-4" /> +91 98765 43210</li>
            <li className="flex gap-2 items-center"><MapPin className="size-4" /> Mumbai, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Glamora. All rights reserved.</div>
    </footer>
  );
}
