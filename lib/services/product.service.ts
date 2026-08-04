import { connectDB } from "@/lib/db";
import { Product, Category } from "@/models";
import { generateSlug, paginationMeta } from "@/lib/utils";
import { ApiError } from "@/lib/api-response";
import type { ProductInput } from "@/lib/validators";
import type { FilterQuery } from "mongoose";
import type { IProduct } from "@/models";

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  sort?:
    | "newest"
    | "price_asc"
    | "price_desc"
    | "rating"
    | "bestselling"
    | "relevance";
  includeInactive?: boolean;
}

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  price_asc: { finalPrice: 1 },
  price_desc: { finalPrice: -1 },
  rating: { ratingAverage: -1, ratingCount: -1 },
  bestselling: { soldCount: -1 },
};

export async function listProducts(params: ProductQueryParams) {
  await connectDB();

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(60, Math.max(1, params.limit ?? 20));

  const filter: FilterQuery<IProduct> = params.includeInactive
    ? {}
    : { isActive: true };

  if (params.category) filter.category = params.category;
  if (params.brand) filter.brand = params.brand;
  if (params.featured) filter.isFeatured = true;
  if (params.bestseller) filter.isBestseller = true;
  if (params.newArrival) filter.isNewArrival = true;
  if (params.tags?.length) filter.tags = { $in: params.tags };

  if (params.minPrice != null || params.maxPrice != null) {
    filter.finalPrice = {};
    if (params.minPrice != null) filter.finalPrice.$gte = params.minPrice;
    if (params.maxPrice != null) filter.finalPrice.$lte = params.maxPrice;
  }

  if (params.search) {
    filter.$text = { $search: params.search };
  }

  let query = Product.find(filter);

  if (params.search) {
    query = query
      .select({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } });
  } else {
    const sortKey = params.sort ?? "newest";
    query = query.sort(SORT_MAP[sortKey] ?? SORT_MAP.newest);
  }

  const [items, totalItems] = await Promise.all([
    query
      .populate("category", "name slug")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { items, meta: paginationMeta(totalItems, page, limit) };
}

export async function getProductBySlug(slug: string) {
  await connectDB();
  const product = await Product.findOne({ slug, isActive: true })
    .populate("category", "name slug")
    .lean();
  if (!product) throw new ApiError("Product not found", 404);
  return product;
}

export async function getProductById(id: string) {
  await connectDB();
  const product = await Product.findById(id).populate("category", "name slug");
  if (!product) throw new ApiError("Product not found", 404);
  return product;
}

export async function getRelatedProducts(productId: string, categoryId: string) {
  await connectDB();
  return Product.find({
    _id: { $ne: productId },
    category: categoryId,
    isActive: true,
  })
    .limit(8)
    .lean();
}

export async function createProduct(input: ProductInput) {
  await connectDB();

  const category = await Category.findById(input.category);
  if (!category) throw new ApiError("Selected category does not exist", 422);

  const existingSku = await Product.exists({ sku: input.sku.toUpperCase() });
  if (existingSku) throw new ApiError("A product with this SKU already exists", 409);

  const baseSlug = generateSlug(input.name);
  let slug = baseSlug;
  let counter = 1;
  while (await Product.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return Product.create({ ...input, slug });
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  await connectDB();
  const product = await Product.findById(id);
  if (!product) throw new ApiError("Product not found", 404);

  if (input.category) {
    const category = await Category.findById(input.category);
    if (!category) throw new ApiError("Selected category does not exist", 422);
  }

  if (input.sku && input.sku.toUpperCase() !== product.sku) {
    const existingSku = await Product.exists({
      sku: input.sku.toUpperCase(),
      _id: { $ne: id },
    });
    if (existingSku) throw new ApiError("A product with this SKU already exists", 409);
  }

  if (input.name && input.name !== product.name) {
    const baseSlug = generateSlug(input.name);
    let slug = baseSlug;
    let counter = 1;
    while (await Product.exists({ slug, _id: { $ne: id } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    product.slug = slug;
  }

  Object.assign(product, input);
  await product.save();
  return product;
}

export async function deleteProduct(id: string) {
  await connectDB();
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new ApiError("Product not found", 404);
  return product;
}

export async function getLowStockProducts(threshold?: number) {
  await connectDB();
  const products = await Product.find({ isActive: true }).lean();
  return products.filter(
    (p) => p.stock <= (threshold ?? p.lowStockThreshold)
  );
}

export async function decrementStock(
  items: { product: string; quantity: number }[]
) {
  await connectDB();

  const applied: { product: string; quantity: number }[] = [];

  for (const item of items) {
    // Atomic conditional decrement: only succeeds if stock is currently
    // sufficient, so concurrent checkouts can't both succeed against the
    // same last unit (classic oversell race).
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, soldCount: item.quantity } },
      { new: true }
    );

    if (!updated) {
      // Roll back everything already decremented in this batch before
      // failing, so a partial failure never leaves stock silently
      // understated for products that succeeded earlier in the loop.
      if (applied.length > 0) {
        await restoreStock(applied);
      }

      const product = await Product.findById(item.product);
      const label = product?.name ?? "This item";
      const available = product?.stock ?? 0;
      throw new ApiError(
        `${label} has insufficient stock. Only ${available} left.`,
        409
      );
    }

    applied.push(item);
  }
}

export async function restoreStock(
  items: { product: string; quantity: number }[]
) {
  await connectDB();
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }
}

export async function getDistinctBrands() {
  await connectDB();
  return Product.distinct("brand", { isActive: true });
}
