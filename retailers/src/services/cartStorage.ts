import type { CartItem } from "../types";

const CART_STORAGE_KEY = "shweta-retailer-cart";

export function loadCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(CART_STORAGE_KEY);
    return value ? (JSON.parse(value) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function clearCartItems() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CART_STORAGE_KEY);
}
