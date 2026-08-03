"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

export interface CartProductSnapshot {
  _id: string;
  name: string;
  slug: string;
  finalPrice: number;
  price: number;
  images: { url: string; isPrimary: boolean }[];
  stock: number;
  sku: string;
}

export interface CartItem {
  product: CartProductSnapshot;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  couponCode: string | null;
  discount: number;
  isLoading: boolean;
  itemCount: number;
}

interface CartContextValue extends CartState {
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error ?? "Something went wrong");
  }
  return json.data;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchJson("/api/cart");
      setItems(data.items ?? []);
      setSubtotal(data.subtotal ?? 0);
      setCouponCode(data.couponCode ?? null);
    } catch {
      setItems([]);
      setSubtotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      try {
        const data = await fetchJson("/api/cart", {
          method: "POST",
          body: JSON.stringify({ productId, quantity }),
        });
        setItems(data.items ?? []);
        setSubtotal(data.subtotal ?? 0);
        toast.success("Added to your bag");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not add to bag");
        throw err;
      }
    },
    []
  );

  const updateItem = useCallback(async (productId: string, quantity: number) => {
    try {
      const data = await fetchJson(`/api/cart/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      setItems(data.items ?? []);
      setSubtotal(data.subtotal ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update quantity");
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    try {
      const data = await fetchJson(`/api/cart/${productId}`, { method: "DELETE" });
      setItems(data.items ?? []);
      setSubtotal(data.subtotal ?? 0);
      toast("Removed from bag");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove item");
    }
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    try {
      const data = await fetchJson("/api/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      setCouponCode(data.code);
      setDiscount(data.discount);
      toast.success(`Coupon ${data.code} applied`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid coupon");
      throw err;
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    setCouponCode(null);
    setDiscount(0);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    subtotal,
    couponCode,
    discount,
    isLoading,
    itemCount,
    refresh,
    addItem,
    updateItem,
    removeItem,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
