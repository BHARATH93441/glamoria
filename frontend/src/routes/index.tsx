import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Truck, ShieldCheck, RefreshCw, Star } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] sm:h-[82vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=80"
          alt="Glamora fashion"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-white max-w-xl"
          >
            <span className="inline-flex items-center gap-1 bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Sparkles className="size-3" /> NEW SEASON DROP
            </span>
            <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight">
              Style Beyond Trends
            </h1>
            <p className="mt-4 text-white/90 text-base sm:text-lg">
              Discover Glamora — a premium fashion edit crafted for the modern
              wardrobe. Effortless, elevated, unmistakably you.
            </p>
            <div className="mt-7 flex gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-foreground hover:bg-primary hover:text-primary-foreground transition px-6 py-3 rounded-full font-medium"
              >
                Shop Now <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border border-white/60 text-white hover:bg-white hover:text-foreground transition px-6 py-3 rounded-full font-medium"
              >
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { I: Truck, t: "Free Shipping", s: "On orders above ₹999" },
            { I: RefreshCw, t: "Easy Returns", s: "7-day return policy" },
            { I: ShieldCheck, t: "Secure Payments", s: "100% safe checkout" },
            { I: Star, t: "Top Rated", s: "Loved by 1M+ customers" },
          ].map(({ I, t, s }) => (
            <div key={t} className="flex items-center gap-3">
              <div className="size-10 grid place-items-center rounded-full bg-secondary text-primary">
                <I className="size-5" />
              </div>
              <div>
                <p className="font-medium">{t}</p>
                <p className="text-xs text-muted-foreground">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand intro */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold">A wardrobe of intention</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Every Glamora piece is designed in-house and crafted from premium fabrics —
          from breezy summer linens and festive ethnic wear to tailored formals and
          everyday casuals. One destination, every occasion.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 mt-8 bg-primary text-primary-foreground hover:opacity-90 transition px-7 py-3 rounded-full font-medium"
        >
          Explore Collection <ArrowRight className="size-4" />
        </Link>
      </section>

      {/* Visual banner */}
      <section className="max-w-7xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-6">
        {[
          {
            t: "Crafted for every season",
            s: "Light layers for summer, cosy edits for winter — designed to live in.",
            img: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=1200&q=80",
          },
          {
            t: "Festive & formal",
            s: "From ethnic celebrations to boardroom polish, dress the moment.",
            img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
          },
        ].map((b) => (
          <Link
            key={b.t}
            to="/products"
            className="group relative h-72 rounded-3xl overflow-hidden"
          >
            <img
              src={b.img}
              alt={b.t}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <h3 className="font-display text-3xl font-bold">{b.t}</h3>
              <p className="opacity-90">{b.s}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium">
                Shop now <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Testimonials */}
      <section className="bg-secondary py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-10">
            Loved by our customers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "Ananya S.", t: "Stunning collection! The fabric quality is unmatched and delivery was super quick.", r: 5 },
              { n: "Rohit K.", t: "Best fashion store I've shopped from. Sizing was perfect and the kurta was gorgeous.", r: 5 },
              { n: "Priya M.", t: "Glamora is my new go-to. Love their party wear edit — got so many compliments!", r: 4 },
            ].map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border rounded-2xl p-6"
              >
                <div className="flex gap-0.5 text-primary mb-3">
                  {Array.from({ length: c.r }).map((_, j) => (
                    <Star key={j} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">"{c.t}"</p>
                <p className="mt-3 font-medium text-sm">— {c.n}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
