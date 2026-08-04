import { describe, it, expect, afterEach, beforeEach } from "vitest";
import mongoose from "mongoose";
import { User, Category, Product, Order, Coupon } from "@/models";
import { validateCoupon } from "@/lib/services/coupon.service";
import { decrementStock, restoreStock } from "@/lib/services/product.service";

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

async function createTestUser() {
  return User.create({
    name: "Test Customer",
    email: `test-${Date.now()}-${Math.random()}@example.com`,
    password: "hashed-irrelevant-for-this-test",
    role: "customer",
    provider: "credentials",
  });
}

async function createTestCategory() {
  return Category.create({
    name: `Category ${Date.now()}`,
    slug: `category-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    isActive: true,
  });
}

async function createTestProduct(categoryId: mongoose.Types.ObjectId, stock = 10) {
  return Product.create({
    name: "Test Product",
    slug: `test-product-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    sku: `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    brand: "Test Brand",
    category: categoryId,
    description: "A product used purely for integration testing.",
    price: 1000,
    discountPercent: 0,
    stock,
    images: [{ url: "https://res.cloudinary.com/demo/image/upload/test.jpg", publicId: "test", isPrimary: true }],
    isActive: true,
  });
}

describe("validateCoupon", () => {
  it("accepts a valid, active, in-window coupon", async () => {
    const user = await createTestUser();
    await Coupon.create({
      code: "TESTCOUPON",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 500,
      usageLimit: 0,
      perUserLimit: 1,
      isActive: true,
      startsAt: new Date(Date.now() - 1000),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    const result = await validateCoupon("TESTCOUPON", user._id.toString(), 2000);
    expect(result.discount).toBe(200); // 10% of 2000
  });

  it("rejects a coupon below the minimum order value", async () => {
    const user = await createTestUser();
    await Coupon.create({
      code: "MINORDER",
      discountType: "flat",
      discountValue: 100,
      minOrderValue: 5000,
      usageLimit: 0,
      perUserLimit: 1,
      isActive: true,
      startsAt: new Date(Date.now() - 1000),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    await expect(
      validateCoupon("MINORDER", user._id.toString(), 1000)
    ).rejects.toThrow(/minimum order value/i);
  });

  it("rejects an expired coupon", async () => {
    const user = await createTestUser();
    await Coupon.create({
      code: "EXPIRED",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 0,
      usageLimit: 0,
      perUserLimit: 1,
      isActive: true,
      startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    });

    await expect(
      validateCoupon("EXPIRED", user._id.toString(), 2000)
    ).rejects.toThrow(/expired/i);
  });

  it("rejects a coupon that has hit its total usage limit", async () => {
    const user = await createTestUser();
    await Coupon.create({
      code: "MAXEDOUT",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 0,
      usageLimit: 5,
      usedCount: 5,
      perUserLimit: 10,
      isActive: true,
      startsAt: new Date(Date.now() - 1000),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    await expect(
      validateCoupon("MAXEDOUT", user._id.toString(), 2000)
    ).rejects.toThrow(/usage limit/i);
  });

  it("caps the discount at maxDiscountAmount", async () => {
    const user = await createTestUser();
    await Coupon.create({
      code: "CAPPED",
      discountType: "percentage",
      discountValue: 50,
      maxDiscountAmount: 300,
      minOrderValue: 0,
      usageLimit: 0,
      perUserLimit: 1,
      isActive: true,
      startsAt: new Date(Date.now() - 1000),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    // 50% of 2000 = 1000, but should be capped at 300
    const result = await validateCoupon("CAPPED", user._id.toString(), 2000);
    expect(result.discount).toBe(300);
  });

  it("rejects a coupon a user has already used up to their per-user limit", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();
    const product = await createTestProduct(category._id);

    await Coupon.create({
      code: "ONCEONLY",
      discountType: "flat",
      discountValue: 100,
      minOrderValue: 0,
      usageLimit: 0,
      perUserLimit: 1,
      isActive: true,
      startsAt: new Date(Date.now() - 1000),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    await Order.create({
      orderNumber: `LHB-TEST-${Date.now()}`,
      user: user._id,
      items: [
        {
          product: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images[0].url,
          sku: product.sku,
          price: product.finalPrice,
          quantity: 1,
          subtotal: product.finalPrice,
        },
      ],
      shippingAddress: {
        fullName: "Test User",
        phone: "9876543210",
        line1: "123 Test St",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
      },
      subtotal: product.finalPrice,
      discount: 100,
      couponCode: "ONCEONLY",
      shippingFee: 0,
      tax: 0,
      total: product.finalPrice - 100,
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "paid",
    });

    await expect(
      validateCoupon("ONCEONLY", user._id.toString(), 2000)
    ).rejects.toThrow(/already used/i);
  });

  it("rejects an unknown coupon code", async () => {
    const user = await createTestUser();
    await expect(
      validateCoupon("DOESNOTEXIST", user._id.toString(), 2000)
    ).rejects.toThrow(/invalid/i);
  });
});

describe("stock management", () => {
  let categoryId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const category = await createTestCategory();
    categoryId = category._id;
  });

  it("decrements stock and increments soldCount on a successful order", async () => {
    const product = await createTestProduct(categoryId, 10);

    await decrementStock([{ product: product._id.toString(), quantity: 3 }]);

    const updated = await Product.findById(product._id);
    expect(updated?.stock).toBe(7);
    expect(updated?.soldCount).toBe(3);
  });

  it("throws and does not decrement when requested quantity exceeds stock", async () => {
    const product = await createTestProduct(categoryId, 2);

    await expect(
      decrementStock([{ product: product._id.toString(), quantity: 5 }])
    ).rejects.toThrow(/insufficient stock/i);

    const unchanged = await Product.findById(product._id);
    expect(unchanged?.stock).toBe(2);
  });

  it("restores stock and decrements soldCount on cancellation", async () => {
    const product = await createTestProduct(categoryId, 10);
    await decrementStock([{ product: product._id.toString(), quantity: 4 }]);

    await restoreStock([{ product: product._id.toString(), quantity: 4 }]);

    const restored = await Product.findById(product._id);
    expect(restored?.stock).toBe(10);
    expect(restored?.soldCount).toBe(0);
  });

  it("rolls back earlier successful decrements when a later item in the same batch fails (atomicity fix)", async () => {
    const productA = await createTestProduct(categoryId, 10);
    const productB = await createTestProduct(categoryId, 1);

    await expect(
      decrementStock([
        { product: productA._id.toString(), quantity: 2 },
        { product: productB._id.toString(), quantity: 5 },
      ])
    ).rejects.toThrow(/insufficient stock/i);

    // Product A's decrement must be rolled back since the batch as a
    // whole failed - otherwise stock would be silently understated for
    // an order that was never actually created.
    const updatedA = await Product.findById(productA._id);
    expect(updatedA?.stock).toBe(10);
    expect(updatedA?.soldCount).toBe(0);
  });

  it("prevents overselling under concurrent decrement attempts on the same product", async () => {
    const product = await createTestProduct(categoryId, 5);

    // Two "simultaneous" checkouts both trying to buy the last few units.
    const results = await Promise.allSettled([
      decrementStock([{ product: product._id.toString(), quantity: 3 }]),
      decrementStock([{ product: product._id.toString(), quantity: 3 }]),
    ]);

    const succeeded = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");

    // Only one of the two concurrent 3-unit purchases can succeed against
    // 5 units of stock; the atomic conditional update prevents both from
    // going through.
    expect(succeeded.length).toBe(1);
    expect(failed.length).toBe(1);

    const final = await Product.findById(product._id);
    expect(final?.stock).toBe(2);
  });
});
