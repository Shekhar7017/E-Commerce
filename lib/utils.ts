import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";
import { customAlphabet } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function generateSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}

const orderNumberAlphabet = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const nanoidOrderSuffix = customAlphabet(orderNumberAlphabet, 8);

export function generateOrderNumber(): string {
  const datePart = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  return `LHB-${datePart}-${nanoidOrderSuffix()}`;
}

export function calculateDiscountedPrice(
  price: number,
  discountPercent: number
): number {
  return Math.round(price - (price * discountPercent) / 100);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function paginationMeta(
  totalItems: number,
  page: number,
  limit: number
) {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
