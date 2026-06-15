import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Heart, Leaf, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Glamora" },
      { name: "description", content: "Learn the story behind Glamora — premium fashion crafted for every occasion." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=80"
          alt="About Glamora"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-6xl font-bold"
          >
            Our Story
          </motion.h1>
          <p className="mt-3 text-white/85 max-w-xl">
            Style Beyond Trends — fashion crafted with intention, designed to last.
          </p>
        </div>
      </section>

      {/* Brand story */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-3xl font-bold">Born from a love of fashion</h2>
        <p className="mt-5 text-muted-foreground leading-relaxed">
          Glamora was founded in 2024 with a simple belief — that beautifully made clothes
          shouldn't be reserved for special occasions. From breezy summer linens to
          tailored formals, festive ethnic wear to everyday essentials, every piece in
          our collection is designed in-house and crafted from premium, responsibly
          sourced fabrics.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          We serve over a million customers across India with a single promise — style
          that feels as good as it looks, season after season.
        </p>
      </section>

      {/* Values */}
      <section className="bg-secondary py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-10">What we stand for</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { I: Sparkles, t: "Premium Quality", s: "Hand-picked fabrics and exacting craftsmanship in every stitch." },
              { I: Heart, t: "Designed with Love", s: "An in-house team obsessed with fit, feel, and finish." },
              { I: Leaf, t: "Responsibly Sourced", s: "Ethical supply chains and conscious material choices." },
              { I: Award, t: "Customer First", s: "Easy returns, fast delivery, and a team that genuinely cares." },
            ].map(({ I, t, s }) => (
              <div key={t} className="bg-card border rounded-2xl p-6 text-center">
                <div className="size-12 grid place-items-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <I className="size-6" />
                </div>
                <h3 className="font-semibold">{t}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-3xl font-bold">Find your next favourite</h2>
        <p className="mt-3 text-muted-foreground">Step into the Glamora collection today.</p>
        <Link
          to="/products"
          className="inline-block mt-7 bg-primary text-primary-foreground rounded-full px-7 py-3 font-medium hover:opacity-90"
        >
          Shop Now
        </Link>
      </section>
    </div>
  );
}
