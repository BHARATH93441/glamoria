import { Router, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "../models/Order";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

/** Returns a fresh Razorpay instance (reads env vars at call time) */
function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured on the server");
  }
  return new Razorpay({ key_id, key_secret });
}

// ── GET /api/orders — get current user's orders ──────────────────────────────
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ userEmail: req.user!.email }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/orders — place a new order (COD) ───────────────────────────────
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { items, total, payment, address } = req.body;

    if (!items?.length || !total || !payment || !address) {
      res.status(400).json({ error: "items, total, payment, and address are required" });
      return;
    }

    const order = await Order.create({
      userId: req.user!.id,
      userEmail: req.user!.email,
      items,
      total,
      payment,
      address,
      status: "Placed",
    });

    res.status(201).json({ order });
  } catch (err) {
    console.error("Place order error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/orders/create-razorpay-order ───────────────────────────────────
router.post("/create-razorpay-order", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body; // amount in INR (e.g. 1299)

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ error: "A valid amount (in INR) is required" });
      return;
    }

    // Log env var status for debugging
    console.log("[Razorpay] KEY_ID present:", !!process.env.RAZORPAY_KEY_ID);
    console.log("[Razorpay] KEY_SECRET present:", !!process.env.RAZORPAY_KEY_SECRET);

    const razorpay = getRazorpay();
    // Razorpay receipt max length = 40 chars
    const shortId = req.user!.id.slice(-8);
    const shortTs = String(Date.now()).slice(-8);
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // convert INR → paise
      currency: "INR",
      receipt: `glm_${shortId}_${shortTs}`, // max ~21 chars, well under 40
    });

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    const msg = err?.error?.description || err?.message || String(err);
    console.error("[Razorpay] Create order error:", JSON.stringify(err, null, 2));
    res.status(500).json({ error: `Could not create Razorpay order: ${msg}` });
  }
});


// ── POST /api/orders/verify-razorpay ────────────────────────────────────────
// Verifies the Razorpay payment signature (HMAC-SHA256), then creates the DB order.
router.post("/verify-razorpay", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      total,
      address,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: "Missing Razorpay payment details" });
      return;
    }

    if (!items?.length || !total || !address) {
      res.status(400).json({ error: "items, total and address are required" });
      return;
    }

    // Verify HMAC-SHA256 signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ error: "Payment verification failed — invalid signature" });
      return;
    }

    // Signature valid → create the DB order
    const order = await Order.create({
      userId: req.user!.id,
      userEmail: req.user!.email,
      items,
      total,
      payment: "Razorpay (Cards, UPI, Wallets)",
      address,
      status: "Placed",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    res.status(201).json({ order });
  } catch (err) {
    console.error("Verify Razorpay error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── PATCH /api/orders/:id/status — admin: update order status ────────────────
router.patch("/:id/status", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Placed", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json({ order });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
