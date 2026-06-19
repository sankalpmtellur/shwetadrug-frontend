import { createContext } from "react";
import type { CartItem, Medicine } from "../types";

export type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isLoading: boolean;
  error: string;
  addItem: (medicine: Medicine, qty: number) => Promise<void>;
  setItemQuantity: (medicineId: string, qty: number) => Promise<void>;
  removeItem: (medicineId: string) => Promise<void>;
  reorderItems: (items: CartItem[]) => Promise<void>;
  clearCart: () => Promise<void>;
  quickReorder: () => void;
};

export const CartContext = createContext<CartContextValue | null>(null);
