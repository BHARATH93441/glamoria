import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, type Address } from "@/lib/store";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user, setUser, addresses, saveAddress, removeAddress, orders, wishlist, logout } = useStore();
  const [form, setForm] = useState<Address>({ fullName: "", mobile: "", email: "", address: "", city: "", state: "", pincode: "" });
  const [showAdd, setShowAdd] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-3">Please log in</h1>
        <Link to="/login" className="inline-block bg-primary text-primary-foreground rounded-full px-6 py-2.5">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <h1 className="font-display text-3xl font-bold">My Profile</h1>

      <section className="bg-card border rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><label className="text-muted-foreground">Name</label><input defaultValue={user.name} onBlur={e => setUser({ ...user, name: e.target.value })} className="mt-1 w-full bg-secondary rounded-lg px-3 py-2" /></div>
          <div><label className="text-muted-foreground">Email</label><input defaultValue={user.email} onBlur={e => setUser({ ...user, email: e.target.value })} className="mt-1 w-full bg-secondary rounded-lg px-3 py-2" /></div>
        </div>
      </section>

      <section className="bg-card border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Saved Addresses</h3>
          <button onClick={() => setShowAdd(s => !s)} className="text-sm inline-flex items-center gap-1 text-primary"><Plus className="size-4" /> Add Address</button>
        </div>
        {showAdd && (
          <div className="grid sm:grid-cols-2 gap-3 mb-4 p-4 bg-secondary rounded-xl">
            {(["fullName","mobile","address","city","state","pincode"] as const).map(k => (
              <input key={k} placeholder={k} value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="bg-background rounded px-3 py-2 text-sm" />
            ))}
            <button onClick={() => { if (!form.fullName) return toast.error("Fill the form"); saveAddress({ ...form, email: user.email }); setShowAdd(false); toast.success("Address saved"); }} className="sm:col-span-2 bg-primary text-primary-foreground rounded-lg py-2 text-sm">Save</button>
          </div>
        )}
        {addresses.length === 0 ? <p className="text-sm text-muted-foreground">No saved addresses yet.</p> : (
          <div className="space-y-3">
            {addresses.map((a, i) => (
              <div key={i} className="flex justify-between gap-3 border rounded-xl p-3 text-sm">
                <div><p className="font-medium">{a.fullName} · {a.mobile}</p><p className="text-muted-foreground">{a.address}, {a.city}, {a.state} - {a.pincode}</p></div>
                <button onClick={() => a._id && removeAddress(a._id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        <Link to="/orders" className="bg-card border rounded-2xl p-5 hover:border-primary"><p className="text-2xl font-bold">{orders.length}</p><p className="text-sm text-muted-foreground">Orders</p></Link>
        <Link to="/wishlist" className="bg-card border rounded-2xl p-5 hover:border-primary"><p className="text-2xl font-bold">{wishlist.length}</p><p className="text-sm text-muted-foreground">Wishlist Items</p></Link>
        <button onClick={() => { logout(); toast.success("Logged out"); }} className="bg-card border rounded-2xl p-5 hover:border-destructive text-left"><p className="font-medium text-destructive">Logout</p><p className="text-sm text-muted-foreground">Sign out of your account</p></button>
      </section>
    </div>
  );
}
