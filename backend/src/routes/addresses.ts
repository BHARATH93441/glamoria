import { Router, Response } from "express";
import { User } from "../models/User";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/addresses
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select("addresses");
    res.json({ addresses: user?.addresses || [] });
  } catch (err) {
    console.error("Get addresses error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/addresses — add new address
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, mobile, email, address, city, state, pincode } = req.body;
    if (!fullName || !mobile || !address || !city || !state || !pincode) {
      res.status(400).json({ error: "All address fields are required" });
      return;
    }
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $push: { addresses: { fullName, mobile, email, address, city, state, pincode } } },
      { new: true }
    ).select("addresses");
    res.json({ addresses: user?.addresses || [] });
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/addresses/:addressId
router.delete("/:addressId", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $pull: { addresses: { _id: req.params.addressId } } },
      { new: true }
    ).select("addresses");
    res.json({ addresses: user?.addresses || [] });
  } catch (err) {
    console.error("Delete address error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
