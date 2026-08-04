import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Category, Product, Coupon } from "../models";
import { generateSlug } from "../lib/utils";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Copy .env.example to .env.local and configure it first.");
  process.exit(1);
}

function placeholderImage(seed: string, primary = true) {
  return {
    url: `https://picsum.photos/seed/${seed}/900/1125`,
    publicId: `seed/${seed}`,
    isPrimary: primary,
  };
}

const CATEGORY_SEED = [
  { name: "Outerwear", description: "Coats, jackets, and layers built to last." },
  { name: "Tailoring", description: "Structured pieces cut with precision." },
  { name: "Accessories", description: "The details that finish the look." },
  { name: "Leather Goods", description: "Bags and small leather goods, hand-finished." },
  { name: "Footwear", description: "Considered shoes for every occasion." },
];

const PRODUCT_SEED: Array<{
  name: string;
  brand: string;
  category: string;
  price: number;
  discountPercent: number;
  stock: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  tags: string[];
  description: string;
}> = [
  {
    name: "Wool Herringbone Overcoat",
    brand: "Atelier Standard",
    category: "Outerwear",
    price: 24500,
    discountPercent: 10,
    stock: 12,
    isFeatured: true,
    tags: ["wool", "coat", "winter"],
    description:
      "Cut from a heavyweight herringbone wool, this overcoat is lined in Bemberg cupro and finished with horn buttons. Designed to layer over tailoring or knitwear alike.",
  },
  {
    name: "Quilted Field Jacket",
    brand: "Atelier Standard",
    category: "Outerwear",
    price: 16800,
    discountPercent: 0,
    stock: 18,
    isNewArrival: true,
    tags: ["jacket", "quilted"],
    description:
      "A diamond-quilted field jacket in water-resistant cotton, finished with brass hardware and a corduroy collar.",
  },
  {
    name: "Single-Breasted Wool Blazer",
    brand: "Maison Ferro",
    category: "Tailoring",
    price: 21000,
    discountPercent: 15,
    stock: 9,
    isBestseller: true,
    tags: ["blazer", "tailoring", "wool"],
    description:
      "A half-canvas construction blazer in Italian wool twill, cut for a soft shoulder and a clean, close silhouette.",
  },
  {
    name: "Pleated Wool Trousers",
    brand: "Maison Ferro",
    category: "Tailoring",
    price: 8900,
    discountPercent: 0,
    stock: 25,
    isNewArrival: true,
    tags: ["trousers", "wool"],
    description:
      "Double-pleated trousers with a relaxed leg, cut from the same wool twill as our tailored jackets.",
  },
  {
    name: "Silk Twill Pocket Square",
    brand: "Atelier Standard",
    category: "Accessories",
    price: 3200,
    discountPercent: 0,
    stock: 40,
    tags: ["silk", "accessory"],
    description: "Hand-rolled edges on a printed silk twill square, woven in Como, Italy.",
  },
  {
    name: "Cashmere Scarf",
    brand: "Maison Ferro",
    category: "Accessories",
    price: 9800,
    discountPercent: 20,
    stock: 22,
    isBestseller: true,
    tags: ["cashmere", "scarf", "winter"],
    description: "A generously sized scarf in pure cashmere, finished with hand-twisted fringe.",
  },
  {
    name: "Full-Grain Leather Tote",
    brand: "Atelier Standard",
    category: "Leather Goods",
    price: 32000,
    discountPercent: 0,
    stock: 7,
    isFeatured: true,
    tags: ["leather", "bag"],
    description:
      "A structured tote in vegetable-tanned full-grain leather, built on a solid brass frame with a detachable pouch.",
  },
  {
    name: "Bifold Cardholder",
    brand: "Maison Ferro",
    category: "Leather Goods",
    price: 4500,
    discountPercent: 0,
    stock: 35,
    isNewArrival: true,
    tags: ["leather", "wallet"],
    description: "A slim bifold cardholder in saffiano leather with six card slots and a center pocket.",
  },
  {
    name: "Suede Chelsea Boot",
    brand: "Atelier Standard",
    category: "Footwear",
    price: 18500,
    discountPercent: 12,
    stock: 15,
    isBestseller: true,
    tags: ["boots", "suede"],
    description: "A Goodyear-welted Chelsea boot in Italian suede with an elasticated side panel.",
  },
  {
    name: "Leather Derby Shoe",
    brand: "Maison Ferro",
    category: "Footwear",
    price: 19800,
    discountPercent: 0,
    stock: 11,
    isFeatured: true,
    tags: ["shoes", "leather", "formal"],
    description: "A five-eyelet derby in box-calf leather, hand-finished with a burnished toe.",
  },
  {
    name: "Merino Crewneck Sweater",
    brand: "Atelier Standard",
    category: "Tailoring",
    price: 7400,
    discountPercent: 0,
    stock: 30,
    isNewArrival: true,
    tags: ["knitwear", "merino"],
    description: "A fine-gauge merino crewneck, fully fashioned for a clean seam finish.",
  },
  {
    name: "Leather Belt",
    brand: "Maison Ferro",
    category: "Accessories",
    price: 5200,
    discountPercent: 0,
    stock: 28,
    tags: ["leather", "belt"],
    description: "A 3.5cm leather belt with a solid brass buckle, hand-cut and edge-painted.",
  },
];

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI as string);

  console.log("Clearing existing catalog data...");
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  console.log("Seeding admin user...");
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@latelier.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "Atelier Admin",
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
      role: "admin",
      provider: "credentials",
      emailVerified: new Date(),
    });
    console.log(`  Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log("  Admin already exists, skipping.");
  }

  console.log("Seeding demo customer...");
  const demoEmail = "customer@latelier.com";
  const existingCustomer = await User.findOne({ email: demoEmail });
  if (!existingCustomer) {
    await User.create({
      name: "Demo Customer",
      email: demoEmail,
      password: await bcrypt.hash("Password123!", 12),
      role: "customer",
      provider: "credentials",
      emailVerified: new Date(),
      addresses: [
        {
          label: "Home",
          fullName: "Demo Customer",
          phone: "9876543210",
          line1: "123 Marine Drive",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "India",
          isDefault: true,
        },
      ],
    });
    console.log(`  Demo customer created: ${demoEmail} / Password123!`);
  }

  console.log("Seeding categories...");
  const categoryDocs = await Category.insertMany(
    CATEGORY_SEED.map((cat, i) => ({
      name: cat.name,
      slug: generateSlug(cat.name),
      description: cat.description,
      displayOrder: i,
      isActive: true,
      image: placeholderImage(`category-${generateSlug(cat.name)}`),
    }))
  );
  const categoryBySlugName = new Map(categoryDocs.map((c) => [c.name, c._id]));

  console.log("Seeding products...");
  let skuCounter = 1000;
  for (const p of PRODUCT_SEED) {
    const slug = generateSlug(p.name);
    await Product.create({
      name: p.name,
      slug,
      sku: `LHB-${skuCounter++}`,
      brand: p.brand,
      category: categoryBySlugName.get(p.category),
      description: p.description,
      shortDescription: p.description.slice(0, 120),
      specifications: [
        { key: "Material", value: p.tags.includes("wool") ? "100% Wool" : p.tags.includes("leather") ? "Full-Grain Leather" : "Premium Fabric" },
        { key: "Origin", value: "Made in Italy" },
        { key: "Care", value: "Dry clean only" },
      ],
      price: p.price,
      discountPercent: p.discountPercent,
      stock: p.stock,
      lowStockThreshold: 5,
      images: [placeholderImage(slug, true), placeholderImage(`${slug}-alt`, false)],
      tags: p.tags,
      isFeatured: p.isFeatured ?? false,
      isBestseller: p.isBestseller ?? false,
      isNewArrival: p.isNewArrival ?? false,
      isActive: true,
    });
  }

  console.log("Seeding coupons...");
  await Coupon.insertMany([
    {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "percentage",
      discountValue: 10,
      maxDiscountAmount: 3000,
      minOrderValue: 2000,
      usageLimit: 0,
      perUserLimit: 1,
      isActive: true,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      code: "FLAT500",
      description: "Flat ₹500 off orders above ₹5000",
      discountType: "flat",
      discountValue: 500,
      minOrderValue: 5000,
      usageLimit: 100,
      perUserLimit: 2,
      isActive: true,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log("\nSeed complete.");
  console.log(`  ${categoryDocs.length} categories`);
  console.log(`  ${PRODUCT_SEED.length} products`);
  console.log("  2 coupons: WELCOME10, FLAT500");
  console.log(`\nAdmin login: ${adminEmail} / ${adminPassword}`);
  console.log("Customer login: customer@latelier.com / Password123!");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
