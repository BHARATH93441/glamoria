import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { setUser } = useStore();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pass || (mode === "signup" && !name)) return toast.error("Fill all fields");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Invalid email");
    setUser({ name: name || email.split("@")[0], email });
    toast.success(mode === "login" ? "Welcome back!" : "Account created!");
    nav({ to: "/" });
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md bg-card border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-center">{mode === "login" ? "Welcome Back" : "Join Glamora"}</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">{mode === "login" ? "Sign in to continue shopping" : "Create an account to start shopping"}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div><label className="text-sm font-medium">Name</label><input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full bg-secondary rounded-lg px-3 py-2.5" /></div>
          )}
          <div><label className="text-sm font-medium">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full bg-secondary rounded-lg px-3 py-2.5" /></div>
          <div><label className="text-sm font-medium">Password</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} className="mt-1 w-full bg-secondary rounded-lg px-3 py-2.5" /></div>
          <button className="w-full bg-primary text-primary-foreground rounded-full py-3 font-medium hover:opacity-90">{mode === "login" ? "Sign In" : "Create Account"}</button>
        </form>
        <p className="text-sm text-center mt-5 text-muted-foreground">
          {mode === "login" ? "New to Glamora?" : "Already have an account?"}{" "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-primary font-medium">{mode === "login" ? "Sign up" : "Sign in"}</button>
        </p>
      </div>
    </div>
  );
}
