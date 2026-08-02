import { Schema, model, models, Model, Document, Types } from "mongoose";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface IReview extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  order: Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  images?: { url: string; publicId: string }[];
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, maxlength: 150 },
    comment: { type: String, required: true, maxlength: 2000 },
    images: [{ url: String, publicId: String }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    isVerifiedPurchase: { type: Boolean, default: true },
    adminReply: { type: String },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });
ReviewSchema.index({ status: 1, createdAt: -1 });

const Review: Model<IReview> = models.Review || model<IReview>("Review", ReviewSchema);

export default Review;
