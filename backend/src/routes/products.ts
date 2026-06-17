import { Router, Request, Response } from "express";
import { Product } from "../models/Product";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/products — get all admin-added products (public)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/products — add a product (admin only)
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, brand, category, type, tags, price, mrp, sizes, colors, images, description, stock, season } =
      req.body;

    if (!name || !brand || !category || !price || !mrp || !images?.length) {
      res.status(400).json({ error: "Name, brand, category, price, mrp and at least one image are required" });
      return;
    }

    const product = await Product.create({
      name,
      brand,
      category,
      type: type || "Other",
      tags: tags || [],
      price: Number(price),
      mrp: Number(mrp),
      sizes: sizes || [],
      colors: colors || [],
      images,
      description: description || "",
      stock: Number(stock) || 0,
      season,
      addedBy: req.user?.email || "admin",
    });

    res.status(201).json({ product });
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/:id — get a single product by ID (public)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({ product });
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/products/:id — update a product (admin only)
router.put("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, brand, category, type, tags, price, mrp, sizes, colors, images, description, stock, season } =
      req.body;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(brand && { brand }),
        ...(category && { category }),
        ...(type && { type }),
        ...(tags && { tags }),
        ...(price !== undefined && { price: Number(price) }),
        ...(mrp !== undefined && { mrp: Number(mrp) }),
        ...(sizes && { sizes }),
        ...(colors && { colors }),
        ...(images && { images }),
        ...(description !== undefined && { description }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(season !== undefined && { season }),
      },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ product: updated });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/products/:id — delete a product (admin only)
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
