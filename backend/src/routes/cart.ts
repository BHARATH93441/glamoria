import { Router, Response } from "express";
import { Cart } from "../models/Cart";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/cart — get user's cart
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.user!.id });
    res.json({ items: cart?.items || [] });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/cart — replace entire cart (sync from client)
router.put("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user!.id },
      { userId: req.user!.id, userEmail: req.user!.email, items: items || [] },
      { upsert: true, new: true }
    );
    res.json({ items: cart.items });
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/cart/item — add or update a single item
router.post("/item", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, size, color, qty } = req.body;
    if (!productId || !size || !color || !qty) {
      res.status(400).json({ error: "productId, size, color, qty are required" });
      return;
    }

    let cart = await Cart.findOne({ userId: req.user!.id });
    if (!cart) {
      cart = await Cart.create({
        userId: req.user!.id,
        userEmail: req.user!.email,
        items: [],
      });
    }

    const existing = cart.items.find(
      (i) => i.productId === productId && i.size === size && i.color === color
    );
    if (existing) {
      existing.qty += qty;
    } else {
      cart.items.push({ productId, size, color, qty });
    }

    await cart.save();
    res.json({ items: cart.items });
  } catch (err) {
    console.error("Add cart item error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/cart/item/:index — update quantity at index
router.patch("/item/:index", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const index = Number(req.params.index);
    const { qty } = req.body;
    const cart = await Cart.findOne({ userId: req.user!.id });
    if (!cart || !cart.items[index]) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }
    cart.items[index].qty = Math.max(1, qty);
    await cart.save();
    res.json({ items: cart.items });
  } catch (err) {
    console.error("Update cart item error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/cart/item/:index — remove item at index
router.delete("/item/:index", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const index = Number(req.params.index);
    const cart = await Cart.findOne({ userId: req.user!.id });
    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }
    cart.items.splice(index, 1);
    await cart.save();
    res.json({ items: cart.items });
  } catch (err) {
    console.error("Remove cart item error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/cart — clear all items
router.delete("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user!.id }, { items: [] });
    res.json({ items: [] });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
