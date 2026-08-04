import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  generateSlug,
  calculateDiscountedPrice,
  generateOrderNumber,
  paginationMeta,
  truncate,
} from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats whole rupee amounts with the ₹ symbol", () => {
    expect(formatCurrency(1000)).toBe("₹1,000");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("₹0");
  });

  it("rounds to no decimal places", () => {
    expect(formatCurrency(999.6)).toBe("₹1,000");
  });

  it("formats large amounts with Indian digit grouping", () => {
    expect(formatCurrency(1234567)).toBe("₹12,34,567");
  });
});

describe("generateSlug", () => {
  it("lowercases and hyphenates", () => {
    expect(generateSlug("Wool Herringbone Overcoat")).toBe("wool-herringbone-overcoat");
  });

  it("converts ampersands to 'and' and strips other special characters", () => {
    expect(generateSlug("Men's Silk Tie & Pocket Square")).toBe("mens-silk-tie-and-pocket-square");
  });

  it("trims leading/trailing whitespace before slugifying", () => {
    expect(generateSlug("  Padded Coat  ")).toBe("padded-coat");
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(generateSlug("Extra   Wide   Belt")).toBe("extra-wide-belt");
  });
});

describe("calculateDiscountedPrice", () => {
  it("applies a percentage discount and rounds to whole rupees", () => {
    expect(calculateDiscountedPrice(1000, 10)).toBe(900);
  });

  it("returns the original price when discount is 0", () => {
    expect(calculateDiscountedPrice(2500, 0)).toBe(2500);
  });

  it("rounds fractional results correctly", () => {
    // 999 - 33.3% = 666.33 -> rounds to 666
    expect(calculateDiscountedPrice(999, 33.3)).toBe(666);
  });

  it("handles a 100% discount", () => {
    expect(calculateDiscountedPrice(500, 100)).toBe(0);
  });
});

describe("generateOrderNumber", () => {
  it("follows the LHB-YYYYMMDD-XXXXXXXX pattern", () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber).toMatch(/^LHB-\d{8}-[0-9A-Z]{8}$/);
  });

  it("generates unique values across calls", () => {
    const numbers = new Set(Array.from({ length: 50 }, () => generateOrderNumber()));
    expect(numbers.size).toBe(50);
  });
});

describe("paginationMeta", () => {
  it("computes total pages correctly", () => {
    const meta = paginationMeta(95, 1, 20);
    expect(meta.totalPages).toBe(5);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPrevPage).toBe(false);
  });

  it("reports no next page on the last page", () => {
    const meta = paginationMeta(95, 5, 20);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPrevPage).toBe(true);
  });

  it("always returns at least 1 total page even with 0 items", () => {
    const meta = paginationMeta(0, 1, 20);
    expect(meta.totalPages).toBe(1);
  });
});

describe("truncate", () => {
  it("leaves short text unchanged", () => {
    expect(truncate("Silk Scarf", 20)).toBe("Silk Scarf");
  });

  it("truncates long text and appends an ellipsis", () => {
    expect(truncate("A very long product description text", 10)).toBe("A very lon...");
  });
});
