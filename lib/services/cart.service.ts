import { connectDB } from "@/lib/db";
import { Cart, Product } from "@/models";
import { ApiError } from "@/lib/api-response";

async function getOrCreateCart(userId: string) {
  await connectDB();
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  const populated = await cart.populate({
    path: "items.product",
    select:
      "name slug price finalPrice discountPercent images stock isActive sku",
  });

  const items = populated.items
    .filter((item) => item.product)
    .map((item) => ({
      product: item.product,
      quantity: item.quantity,
      addedAt: item.addedAt,
    }));

  const subtotal = items.reduce((sum, item) => {
    const product = item.product as unknown as { finalPrice: number };
    return sum + product.finalPrice * item.quantity;
  }, 0);

  return { items, subtotal, couponCode: cart.couponCode ?? null };
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number
) {
  await connectDB();
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError("Product not found", 404);
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  const desiredQuantity = (existingItem?.quantity ?? 0) + quantity;

  if (desiredQuantity > product.stock) {
    throw new ApiError(
      `Only ${product.stock} unit(s) of ${product.name} are available`,
      409
    );
  }

  if (existingItem) {
    existingItem.quantity = desiredQuantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      addedAt: new Date(),
    });
  }

  await cart.save();
  return getCart(userId);
}

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number
) {
  await connectDB();
  const product = await Product.findById(productId);
  if (!product) throw new ApiError("Product not found", 404);

  if (quantity > product.stock) {
    throw new ApiError(
      `Only ${product.stock} unit(s) of ${product.name} are available`,
      409
    );
  }

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new ApiError("Item not found in cart", 404);

  item.quantity = quantity;
  await cart.save();
  return getCart(userId);
}

export async function removeFromCart(userId: string, productId: string) {
  await connectDB();
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  ) as typeof cart.items;
  await cart.save();
  return getCart(userId);
}

export async function clearCart(userId: string) {
  await connectDB();
  const cart = await getOrCreateCart(userId);
  cart.items = [] as typeof cart.items;
  cart.couponCode = undefined;
  await cart.save();
  return getCart(userId);
}

export async function applyCouponToCart(userId: string, couponCode: string) {
  await connectDB();
  const cart = await getOrCreateCart(userId);
  cart.couponCode = couponCode.toUpperCase();
  await cart.save();
  return getCart(userId);
}

export async function removeCouponFromCart(userId: string) {
  await connectDB();
  const cart = await getOrCreateCart(userId);
  cart.couponCode = undefined;
  await cart.save();
  return getCart(userId);
}
