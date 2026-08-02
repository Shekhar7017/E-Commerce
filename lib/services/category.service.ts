import { connectDB } from "@/lib/db";
import { Category, Product } from "@/models";
import { generateSlug } from "@/lib/utils";
import { ApiError } from "@/lib/api-response";
import type { CategoryInput } from "@/lib/validators";

export async function listCategories(includeInactive = false) {
  await connectDB();
  const filter = includeInactive ? {} : { isActive: true };
  return Category.find(filter).sort({ displayOrder: 1, name: 1 }).lean();
}

export async function getCategoryBySlug(slug: string) {
  await connectDB();
  const category = await Category.findOne({ slug, isActive: true }).lean();
  if (!category) throw new ApiError("Category not found", 404);
  return category;
}

export async function createCategory(input: CategoryInput) {
  await connectDB();
  const baseSlug = generateSlug(input.name);
  let slug = baseSlug;
  let counter = 1;
  while (await Category.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return Category.create({ ...input, slug });
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>
) {
  await connectDB();
  const category = await Category.findById(id);
  if (!category) throw new ApiError("Category not found", 404);

  if (input.name && input.name !== category.name) {
    const baseSlug = generateSlug(input.name);
    let slug = baseSlug;
    let counter = 1;
    while (await Category.exists({ slug, _id: { $ne: id } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    category.slug = slug;
  }

  Object.assign(category, input);
  await category.save();
  return category;
}

export async function deleteCategory(id: string) {
  await connectDB();
  const inUse = await Product.exists({ category: id });
  if (inUse) {
    throw new ApiError(
      "Cannot delete a category that still has products assigned to it",
      409
    );
  }
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new ApiError("Category not found", 404);
  return category;
}
