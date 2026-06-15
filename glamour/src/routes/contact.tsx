import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Glamora" },
      { name: "description", content: "Get in touch with the Glamora team for support, orders, or partnerships." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error("Please fill all required fields");
    setSending(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you shortly.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setSending(false);
    }, 900);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Get in Touch</h1>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Questions about an order, sizing, or just want to say hi? We'd love to hear from you.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { I: Mail, t: "Email Us", s: "hello@glamora.com", sub: "We reply within 24 hours" },
            { I: Phone, t: "Call Us", s: "+91 98765 43210", sub: "Mon – Sat, 10am – 7pm IST" },
            { I: MapPin, t: "Visit Us", s: "Bandra West, Mumbai", sub: "Maharashtra, India 400050" },
          ].map(({ I, t, s, sub }) => (
            <div key={t} className="bg-card border rounded-2xl p-5 flex gap-4">
              <div className="size-11 grid place-items-center rounded-full bg-primary/10 text-primary shrink-0">
                <I className="size-5" />
              </div>
              <div>
                <p className="font-semibold">{t}</p>
                <p className="text-sm">{s}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="lg:col-span-2 bg-card border rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Your Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <Field label="Email *" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
          </div>
          <Field label="Subject" value={form.subject} onChange={v => setForm({ ...form, subject: v })} />
          <div>
            <label className="text-sm font-medium">Message *</label>
            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              rows={6}
              className="mt-1 w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <button
            disabled={sending}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-7 py-3 font-medium hover:opacity-90 disabled:opacity-60"
          >
            {sending ? "Sending…" : (<>Send Message <Send className="size-4" /></>)}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
