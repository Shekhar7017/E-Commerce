export { default as User } from "./User";
export { default as Category } from "./Category";
export { default as Product } from "./Product";
export { default as Order } from "./Order";
export { default as Review } from "./Review";
export { default as Coupon } from "./Coupon";
export { default as Cart } from "./Cart";

export type { IUser, IAddress, UserRole } from "./User";
export type { ICategory } from "./Category";
export type { IProduct, IProductImage, ISpecification } from "./Product";
export type {
  IOrder,
  IOrderItem,
  IShippingAddress,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "./Order";
export type { IReview, ReviewStatus } from "./Review";
export type { ICoupon, DiscountType } from "./Coupon";
export type { ICart, ICartItem } from "./Cart";
