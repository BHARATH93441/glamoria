import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  brand: string;
  category: "women" | "men" | "kids";
  type: string;
  tags: string[];
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  description: string;
  stock: number;
  season?: "summer" | "winter";
  addedBy: string; // user email of admin who added it
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: String, enum: ["women", "men", "kids"], required: true },
    type: { type: String, required: true },
    tags: [{ type: String }],
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    sizes: [{ type: String }],
    colors: [{ name: String, hex: String }],
    images: [{ type: String }],
    description: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    season: { type: String, enum: ["summer", "winter"] },
    addedBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
