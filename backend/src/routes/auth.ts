import { Router, Request, Response, CookieOptions } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// On Render, frontend (glamoria.onrender.com) and backend (glamoria-backend.onrender.com)
// are cross-origin. Browsers block cookies with sameSite:"lax" on cross-origin fetch.
// Production MUST use sameSite:"none" + secure:true so cookies are sent with credentials.
const IS_PROD = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: IS_PROD,                         // HTTPS required for sameSite:"none"
  sameSite: IS_PROD ? "none" : "lax",     // "none" required for cross-origin on Render
  maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days
  path: "/",
};

function signToken(user: { id: string; email: string; name: string; role: string }) {
  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

function userPayload(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    wishlist: user.wishlist || [],
    addresses: user.addresses || [],
  };
}

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email and password are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      wishlist: [],
      addresses: [],
    });

    const token = signToken({ id: user._id.toString(), email: user.email, name: user.name, role: user.role });
    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ user: userPayload(user) });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Grant admin role to the designated admin account
    const ADMIN_EMAIL = "bharath@gmail.com";
    if (user.email === ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const token = signToken({ id: user._id.toString(), email: user.email, name: user.name, role: user.role });
    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({ user: userPayload(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  // Must use same sameSite/secure options as set, otherwise the browser won't clear it
  res.clearCookie("token", {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "none" : "lax",
    path: "/",
  });
  res.json({ message: "Logged out" });
});

// GET /api/auth/me  — rehydrate session from cookie
router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select("-passwordHash");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user: userPayload(user) });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
