import mongoose, { Document, Schema } from "mongoose";

interface CartItem {
  productId: string;
  size: string;
  color: string;
  qty: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  items: CartItem[];
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    userEmail: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
        qty: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>("Cart", CartSchema);
