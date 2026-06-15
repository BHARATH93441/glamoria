import mongoose, { Document, Schema } from "mongoose";

export interface IAddress {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  wishlist: string[]; // productIds
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  fullName: String,
  mobile: String,
  email: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
}, { _id: true });

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    wishlist: [{ type: String }],
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
