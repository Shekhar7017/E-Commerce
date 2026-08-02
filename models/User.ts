import { Schema, model, models, Model, Document, Types } from "mongoose";

export type UserRole = "customer" | "admin";

export interface IAddress {
  _id?: Types.ObjectId;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  image?: string;
  provider: "credentials" | "google";
  emailVerified?: Date | null;
  phone?: string;
  addresses: Types.DocumentArray<IAddress>;
  wishlist: Types.ObjectId[];
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, select: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    image: { type: String },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    emailVerified: { type: Date, default: null },
    phone: { type: String },
    addresses: { type: [AddressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isActive: { type: Boolean, default: true },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);

export default User;
