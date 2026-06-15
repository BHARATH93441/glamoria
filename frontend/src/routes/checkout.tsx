import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cartTotals, useStore, type Address } from "@/lib/store";
import { inr } from "@/lib/products";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Truck, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

const PAYMENTS = [
  { id: "razorpay", label: "Razorpay (Cards, UPI, Wallets)", I: CreditCard },
  { id: "cod", label: "Cash on Delivery", I: Truck },
];

function CheckoutPage() {
  const { cart, placeOrder, clearCart, user, loading, addresses, saveAddress } = useStore();
  const totals = cartTotals(cart);
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [address, setAddress] = useState<Address>({ fullName: "", mobile: "", email: "", address: "", city: "", state: "", pincode: "" });
  const [payment, setPayment] = useState("razorpay");
  const [processing, setProcessing] = useState(false);
  const [saveThisAddress, setSaveThisAddress] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please log in to proceed to checkout");
      nav({ to: "/login", search: { redirect: "/checkout" } as any });
    }
  }, [user, loading, nav]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary animate-spin"></div>
        <p className="text-muted-foreground text-sm">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (cart.length === 0) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center">Your cart is empty.</div>;
  }

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof Address)[] = ["fullName","mobile","email","address","city","state","pincode"];
    for (const k of required) if (!address[k]) return toast.error("Please complete all fields");
    if (!/^\d{10}$/.test(address.mobile)) return toast.error("Enter a valid 10-digit mobile");
    if (!/^\d{6}$/.test(address.pincode)) return toast.error("Enter a valid 6-digit pincode");

    if (saveThisAddress) {
      const exists = addresses.some(a => 
        a.fullName === address.fullName &&
        a.mobile === address.mobile &&
        a.address === address.address &&
        a.pincode === address.pincode
      );
      if (!exists) {
        try {
          await saveAddress({
            fullName: address.fullName,
            mobile: address.mobile,
            email: address.email,
            address: address.address,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
          });
          toast.success("Address saved successfully");
        } catch (err: any) {
          console.error("Failed to save address:", err);
        }
      }
    }
    setStep(2);
  };

  const pay = async () => {
    setProcessing(true);
    const delay = payment === "razorpay" ? 2000 : 1200;
    try {
      await new Promise(r => setTimeout(r, delay));
      const order = await placeOrder({
        items: cart,
        total: totals.total,
        payment: PAYMENTS.find(p => p.id === payment)!.label,
        address,
      });
      clearCart();
      nav({ to: "/order-success", search: { id: order.id } as any });
    } catch (err: any) {
      toast.error(err.message || "Payment failed, please try again");
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-center gap-2 sm:gap-6 mb-10">
        {["Address","Review","Payment"].map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const active = step >= n;
          return (
            <div key={label} className="flex items-center gap-2">
              <motion.div animate={{ scale: step === n ? 1.1 : 1 }} className={`size-9 rounded-full grid place-items-center text-sm font-semibold ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {step > n ? <Check className="size-4" /> : n}
              </motion.div>
              <span className={`text-sm ${active ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
              {i < 2 && <div className={`w-8 sm:w-16 h-0.5 ${step > n ? "bg-primary" : "bg-border"}`} />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form key="1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} onSubmit={submitAddress} className="bg-card border rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
            {addresses.length > 0 && (
              <div className="sm:col-span-2 space-y-3 mb-4">
                <label className="text-sm font-medium">Select a Saved Address</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {addresses.map((addr, idx) => (
                    <div
                      key={(addr as any)._id || idx}
                      onClick={() => setAddress(addr)}
                      className={`border rounded-xl p-4 cursor-pointer hover:border-primary transition-all text-left ${
                        address.fullName === addr.fullName && address.mobile === addr.mobile && address.address === addr.address
                          ? "border-primary bg-secondary/50 ring-2 ring-primary/20"
                          : "border-border hover:bg-secondary/20"
                      }`}
                    >
                      <p className="font-semibold text-sm">{addr.fullName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{addr.mobile} · {addr.email}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {[
              ["fullName","Full Name"],["mobile","Mobile Number"],["email","Email"],["pincode","Pincode"],
              ["address","Address","full"],["city","City"],["state","State"],
            ].map(([k, l, span]) => (
              <div key={k} className={span === "full" ? "sm:col-span-2" : ""}>
                <label className="text-sm font-medium">{l}</label>
                <input value={(address as any)[k]} onChange={e => setAddress({ ...address, [k]: e.target.value })}
                  className="mt-1 w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            ))}
            <div className="sm:col-span-2 flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="saveAddress"
                checked={saveThisAddress}
                onChange={e => setSaveThisAddress(e.target.checked)}
                className="rounded text-primary focus:ring-ring"
              />
              <label htmlFor="saveAddress" className="text-sm font-medium select-none cursor-pointer">
                Save this address for future purchases
              </label>
            </div>
            <div className="sm:col-span-2 flex justify-end mt-4">
              <button className="bg-primary text-primary-foreground rounded-full px-8 py-3 font-medium">Continue</button>
            </div>
          </motion.form>
        )}

        {step === 2 && (
          <motion.div key="2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
            <div className="bg-card border rounded-2xl p-6">
              <h3 className="font-semibold mb-3">Deliver to</h3>
              <p className="text-sm">{address.fullName} · {address.mobile}</p>
              <p className="text-sm text-muted-foreground">{address.address}, {address.city}, {address.state} - {address.pincode}</p>
            </div>
            <div className="bg-card border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                {totals.items.map((it, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <img src={it.product.images[0]} className="size-14 rounded object-cover" />
                    <div className="flex-1">
                      <p className="font-medium">{it.product.name}</p>
                      <p className="text-muted-foreground text-xs">Size {it.size} · {it.color} · Qty {it.qty}</p>
                    </div>
                    <p className="font-medium">{inr(it.product.price * it.qty)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-3 flex justify-between font-semibold">
                <span>Total</span><span>{inr(totals.total)}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="text-sm text-muted-foreground">← Back</button>
              <button onClick={() => setStep(3)} className="bg-primary text-primary-foreground rounded-full px-8 py-3 font-medium">Continue to Payment</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Choose Payment Method</h3>
              <div className="space-y-3">
                {PAYMENTS.map(p => (
                  <label key={p.id} className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer ${payment === p.id ? "border-primary bg-secondary" : ""}`}>
                    <input type="radio" name="pay" checked={payment === p.id} onChange={() => setPayment(p.id)} />
                    <p.I className="size-5 text-primary" />
                    <span className="text-sm font-medium">{p.label}</span>
                  </label>
                ))}
              </div>

              {payment === "razorpay" && (
                <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-9 grid place-items-center rounded-lg bg-[#072654] text-white font-bold text-sm">R</div>
                    <div>
                      <p className="font-semibold text-sm">Razorpay Secure Checkout</p>
                      <p className="text-xs text-muted-foreground">Cards · UPI · Net Banking · Wallets</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="size-3" /> 256-bit encrypted payment
                    <ShieldCheck className="size-3 ml-auto text-emerald-600" />
                  </div>
                </div>
              )}
              {payment === "cod" && (
                <div className="mt-5 text-sm text-muted-foreground bg-secondary rounded-xl p-4">
                  Pay {inr(totals.total)} in cash when your order is delivered to your doorstep.
                </div>
              )}
            </div>

            <div className="bg-card border rounded-2xl p-6 h-fit">
              <h3 className="font-semibold mb-3">Payable</h3>
              <div className="text-3xl font-bold mb-4">{inr(totals.total)}</div>
              <button disabled={processing} onClick={pay}
                className="w-full bg-primary text-primary-foreground rounded-full py-3 font-medium hover:opacity-90 disabled:opacity-60">
                {processing
                  ? "Processing payment…"
                  : payment === "razorpay"
                    ? `Pay ${inr(totals.total)} with Razorpay`
                    : `Place Order · ${inr(totals.total)}`}
              </button>
              <button onClick={() => setStep(2)} className="w-full mt-3 text-sm text-muted-foreground">← Back</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
