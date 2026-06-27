import mongoose, { Document, Schema } from "mongoose";

interface CartItem {
  productId: string;
  size: string;
  color: string;
  qty: number;
}

interface Address {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  items: CartItem[];
  total: number;
  payment: string;
  address: Address;
  status: "Placed" | "Shipped" | "Delivered" | "Cancelled";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true },
    items: [
      {
        productId: String,
        size: String,
        color: String,
        qty: Number,
      },
    ],
    total: { type: Number, required: true },
    payment: { type: String, required: true },
    address: {
      fullName: String,
      mobile: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    status: {
      type: String,
      enum: ["Placed", "Shipped", "Delivered", "Cancelled"],
      default: "Placed",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
