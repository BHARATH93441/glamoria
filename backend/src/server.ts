import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import cartRoutes from "./routes/cart";
import wishlistRoutes from "./routes/wishlist";
import addressRoutes from "./routes/addresses";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
// Allowed origins — add FRONTEND_URL in Render env vars if your frontend URL differs
const ALLOWED_ORIGINS = [
  "https://glamoria.onrender.com",
  process.env.FRONTEND_URL, // set this in Render dashboard if needed
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any localhost port in development (Vite can pick 5173, 5174, etc.)
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,   // REQUIRED: allows cookies to be sent cross-origin
  })
);
app.use(express.json());
app.use(cookieParser()); // Parse httpOnly cookies

// ── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);

// ── 404 catch-all ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Start ───────────────────────────────────────────────────────────────────
async function main() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Glamora backend running on http://localhost:${PORT}`);
  });
}

main();
