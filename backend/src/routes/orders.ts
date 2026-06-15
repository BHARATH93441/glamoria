import { Router, Response } from "express";
import { Order } from "../models/Order";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/orders — get current user's orders
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ userEmail: req.user!.email }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/orders — place a new order
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

// PATCH /api/orders/:id/status — admin: update order status
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
