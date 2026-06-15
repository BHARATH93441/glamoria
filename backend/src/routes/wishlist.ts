import { Router, Response } from "express";
import { User } from "../models/User";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/wishlist
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select("wishlist");
    res.json({ wishlist: user?.wishlist || [] });
  } catch (err) {
    console.error("Get wishlist error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/wishlist/toggle/:productId — add if not present, remove if present
router.post("/toggle/:productId", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user!.id).select("wishlist");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const idx = user.wishlist.indexOf(productId);
    if (idx >= 0) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error("Toggle wishlist error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
