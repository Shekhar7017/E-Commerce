import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[0-9]/, "Password must include a number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(40).default("Home"),
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
  line1: z.string().trim().min(3).max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(3).max(12),
  country: z.string().trim().min(2).max(100).default("India"),
  isDefault: z.boolean().default(false),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const specificationSchema = z.object({
  key: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(300),
});

export const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().max(200).optional(),
  isPrimary: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().trim().min(3).max(200),
  sku: z.string().trim().min(2).max(50),
  brand: z.string().trim().min(1).max(100),
  category: z.string().min(1, "Category is required"),
  description: z.string().trim().min(20),
  shortDescription: z.string().trim().max(300).optional(),
  specifications: z.array(specificationSchema).default([]),
  price: z.coerce.number().positive("Price must be greater than 0"),
  discountPercent: z.coerce.number().min(0).max(90).default(0),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  images: z.array(productImageSchema).min(1, "At least one image is required"),
  tags: z.array(z.string().trim().min(1)).default([]),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNewArrival: z.boolean().default(true),
  isActive: z.boolean().default(true),
  metaTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(300).optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  parent: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
  image: z
    .object({ url: z.string().url(), publicId: z.string() })
    .optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const couponSchema = z
  .object({
    code: z.string().trim().min(3).max(30),
    description: z.string().trim().max(300).optional(),
    discountType: z.enum(["percentage", "flat"]),
    discountValue: z.coerce.number().positive(),
    maxDiscountAmount: z.coerce.number().positive().optional(),
    minOrderValue: z.coerce.number().min(0).default(0),
    usageLimit: z.coerce.number().int().min(0).default(0),
    perUserLimit: z.coerce.number().int().min(1).default(1),
    isActive: z.boolean().default(true),
    startsAt: z.coerce.date(),
    expiresAt: z.coerce.date(),
  })
  .refine((data) => data.expiresAt > data.startsAt, {
    message: "Expiry date must be after the start date",
    path: ["expiresAt"],
  });
export type CouponInput = z.infer<typeof couponSchema>;

export const reviewSchema = z.object({
  product: z.string().min(1),
  order: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(150),
  comment: z.string().trim().min(10).max(2000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Select a delivery address"),
  paymentMethod: z.enum(["razorpay", "cod"]),
  couponCode: z.string().trim().optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});
export type CartItemInput = z.infer<typeof cartItemSchema>;

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  note: z.string().max(500).optional(),
  trackingNumber: z.string().max(100).optional(),
  carrier: z.string().max(100).optional(),
});
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
