import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import type { CartItem, Medicine } from "../types";
import { cartService } from "../services/cartService";
import { clearCartItems, loadCartItems, saveCartItems } from "../services/cartStorage";
import { useAuth } from "./useAuth";

type CartContextValue = {
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

const CartContext = createContext<CartContextValue | null>(null);

function buildLocalItem(medicine: Medicine, qty: number): CartItem {
  return {
    medicineId: medicine.id,
    name: medicine.name,
    sku: medicine.sku,
    qty,
    pack: medicine.pack,
    unitPrice: medicine.price,
    amount: medicine.price * qty,
    status: medicine.status === "Limited" ? "Limited" : "In Stock",
  };
}

function mergeLocalItem(items: CartItem[], medicine: Medicine, qty: number) {
  const nextItem = buildLocalItem(medicine, qty);
  const existing = items.find((item) => item.medicineId === medicine.id);

  if (!existing) return [...items, nextItem];

  return items.map((item) =>
    item.medicineId === medicine.id
      ? { ...item, qty: item.qty + qty, amount: item.amount + nextItem.amount }
      : item,
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const isRetailerSession = isAuthenticated && user?.role === "RETAILER";
  const [items, setItems] = useState<CartItem[]>(() => loadCartItems());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const mergedLocalCartForUser = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isRetailerSession) {
      setItems(loadCartItems());
      mergedLocalCartForUser.current = null;
      return;
    }

    let isMounted = true;

    async function loadBackendCart() {
      setIsLoading(true);
      setError("");

      try {
        const localItems = loadCartItems();
        let nextItems = await cartService.getCart();

        if (localItems.length && mergedLocalCartForUser.current !== user?.id) {
          for (const item of localItems) {
            nextItems = await cartService.addItem(item.medicineId, item.qty);
          }
          clearCartItems();
          mergedLocalCartForUser.current = user?.id ?? null;
        }

        if (isMounted) {
          setItems(nextItems);
        }
      } catch {
        if (isMounted) {
          const message = "Could not load cart. Please refresh and try again.";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadBackendCart();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, isRetailerSession, user?.id]);

  useEffect(() => {
    if (!isAuthLoading && !isRetailerSession) {
      saveCartItems(items);
    }
  }, [isAuthLoading, isRetailerSession, items]);

  const runCartAction = useCallback(
    async (action: () => Promise<CartItem[]>, fallbackMessage: string) => {
      if (!isRetailerSession) return;

      setIsLoading(true);
      setError("");

      try {
        const nextItems = await action();
        setItems(nextItems);
      } catch {
        setError(fallbackMessage);
        toast.error(fallbackMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isRetailerSession],
  );

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const count = items.length;

    return {
      items,
      count,
      subtotal,
      isLoading,
      error,
      addItem: async (medicine, qty) => {
        if (medicine.status === "Out" || qty <= 0) return;

        if (!isRetailerSession) {
          setItems((current) => mergeLocalItem(current, medicine, qty));
          return;
        }

        await runCartAction(
          () => cartService.addItem(medicine.id, qty),
          "Could not add item to cart. Please try again.",
        );
      },
      setItemQuantity: async (medicineId, qty) => {
        const nextQty = Math.max(0, qty);

        if (!isRetailerSession) {
          setItems((current) =>
            current
              .map((item) =>
                item.medicineId === medicineId
                  ? { ...item, qty: nextQty, amount: item.unitPrice * nextQty }
                  : item,
              )
              .filter((item) => item.qty > 0),
          );
          return;
        }

        await runCartAction(
          () => cartService.updateItem(medicineId, nextQty),
          "Could not update cart quantity. Please try again.",
        );
      },
      removeItem: async (medicineId) => {
        if (!isRetailerSession) {
          setItems((current) => current.filter((item) => item.medicineId !== medicineId));
          return;
        }

        await runCartAction(
          () => cartService.removeItem(medicineId),
          "Could not remove item from cart. Please try again.",
        );
      },
      reorderItems: async (nextItems) => {
        if (!isRetailerSession) {
          setItems(nextItems);
          return;
        }

        await runCartAction(async () => {
          let syncedItems = await cartService.clearCart();
          for (const item of nextItems) {
            syncedItems = await cartService.addItem(item.medicineId, item.qty);
          }
          return syncedItems;
        }, "Could not reorder these items. Please try again.");
      },
      clearCart: async () => {
        if (!isRetailerSession) {
          setItems([]);
          clearCartItems();
          return;
        }

        setIsLoading(true);
        setError("");

        try {
          const nextItems = await cartService.clearCart();
          setItems(nextItems);
        } catch {
          const message = "Could not clear cart. Please try again.";
          setError(message);
          throw new Error(message);
        } finally {
          setIsLoading(false);
        }
      },
      quickReorder: () => undefined,
    };
  }, [error, isLoading, isRetailerSession, items, runCartAction]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
