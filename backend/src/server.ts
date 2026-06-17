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
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,   // Required for cookies to work cross-origin
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
