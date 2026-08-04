import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  addressSchema,
  productSchema,
  couponSchema,
  couponBaseSchema,
  checkoutSchema,
  cartItemSchema,
} from "@/lib/validators";

describe("registerSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password without an uppercase letter", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password without a number", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Password",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Pass1",
    });
    expect(result.success).toBe(false);
  });

  it("lowercases and trims the email", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "  JANE@EXAMPLE.COM  ",
      password: "Password123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("jane@example.com");
    }
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "not-an-email",
      password: "Password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("does not enforce password complexity on login (only on register)", () => {
    const result = loginSchema.safeParse({
      email: "jane@example.com",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "jane@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("addressSchema", () => {
  const validAddress = {
    fullName: "Jane Doe",
    phone: "9876543210",
    line1: "123 Marine Drive",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
  };

  it("accepts a valid address and defaults label/country/isDefault", () => {
    const result = addressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.label).toBe("Home");
      expect(result.data.country).toBe("India");
      expect(result.data.isDefault).toBe(false);
    }
  });

  it("rejects an invalid phone number", () => {
    const result = addressSchema.safeParse({ ...validAddress, phone: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects a line1 that is too short", () => {
    const result = addressSchema.safeParse({ ...validAddress, line1: "ab" });
    expect(result.success).toBe(false);
  });
});

describe("productSchema", () => {
  const validProduct = {
    name: "Wool Overcoat",
    sku: "LHB-1001",
    brand: "Atelier Standard",
    category: "507f1f77bcf86cd799439011",
    description: "A very warm and well-made overcoat for winter.",
    price: 10000,
    stock: 5,
    images: [{ url: "https://res.cloudinary.com/demo/image/upload/coat.jpg", publicId: "coat" }],
  };

  it("accepts a valid product and applies defaults", () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discountPercent).toBe(0);
      expect(result.data.isActive).toBe(true);
      expect(result.data.isNewArrival).toBe(true);
    }
  });

  it("rejects a product with no images", () => {
    const result = productSchema.safeParse({ ...validProduct, images: [] });
    expect(result.success).toBe(false);
  });

  it("rejects a negative price", () => {
    const result = productSchema.safeParse({ ...validProduct, price: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects a discount over 90%", () => {
    const result = productSchema.safeParse({ ...validProduct, discountPercent: 95 });
    expect(result.success).toBe(false);
  });

  it("rejects negative stock", () => {
    const result = productSchema.safeParse({ ...validProduct, stock: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers from form inputs", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      price: "10000",
      stock: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(10000);
      expect(typeof result.data.price).toBe("number");
    }
  });
});

describe("couponSchema (refined) vs couponBaseSchema (partial-safe)", () => {
  const baseCoupon = {
    code: "SAVE10",
    discountType: "percentage" as const,
    discountValue: 10,
    startsAt: new Date("2026-01-01"),
    expiresAt: new Date("2026-06-01"),
  };

  it("couponSchema accepts valid start/expiry ordering", () => {
    const result = couponSchema.safeParse(baseCoupon);
    expect(result.success).toBe(true);
  });

  it("couponSchema rejects expiresAt before startsAt", () => {
    const result = couponSchema.safeParse({
      ...baseCoupon,
      startsAt: new Date("2026-06-01"),
      expiresAt: new Date("2026-01-01"),
    });
    expect(result.success).toBe(false);
  });

  it("couponBaseSchema supports .partial() for admin PATCH requests", () => {
    // This is the exact bug fixed in Phase 2: couponSchema.refine() returns
    // a ZodEffects that does not support .partial(). Admin edit forms must
    // use couponBaseSchema instead.
    const partialSchema = couponBaseSchema.partial();
    const result = partialSchema.safeParse({ isActive: false });
    expect(result.success).toBe(true);
  });

  it("couponBaseSchema.partial() does not re-validate date ordering (by design - only couponSchema does)", () => {
    const partialSchema = couponBaseSchema.partial();
    const result = partialSchema.safeParse({
      startsAt: new Date("2026-06-01"),
      expiresAt: new Date("2026-01-01"),
    });
    // This documents current behavior: partial updates skip the cross-field
    // refinement. A stricter implementation might re-check this at the
    // service layer - worth flagging for anyone hardening this further.
    expect(result.success).toBe(true);
  });
});

describe("checkoutSchema", () => {
  it("accepts a valid razorpay checkout payload", () => {
    const result = checkoutSchema.safeParse({
      addressId: "507f1f77bcf86cd799439011",
      paymentMethod: "razorpay",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid payment method", () => {
    const result = checkoutSchema.safeParse({
      addressId: "507f1f77bcf86cd799439011",
      paymentMethod: "bitcoin",
    });
    expect(result.success).toBe(false);
  });

  it("requires an addressId", () => {
    const result = checkoutSchema.safeParse({ paymentMethod: "cod" });
    expect(result.success).toBe(false);
  });
});

describe("cartItemSchema", () => {
  it("rejects a quantity of 0", () => {
    const result = cartItemSchema.safeParse({ productId: "abc", quantity: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects a quantity above 20", () => {
    const result = cartItemSchema.safeParse({ productId: "abc", quantity: 21 });
    expect(result.success).toBe(false);
  });

  it("accepts a quantity of 1-20", () => {
    const result = cartItemSchema.safeParse({ productId: "abc", quantity: 5 });
    expect(result.success).toBe(true);
  });
});
