import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { currency } from "../../utils/formatters";

export function BottomCartBar() {
  const { count, items, removeItem, setItemQuantity, subtotal } = useCart();
  const latestItem = items[items.length - 1];

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-5 z-50 px-3 sm:bottom-8">
      <div className="mx-auto flex w-full items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-soft sm:w-[75%] sm:max-w-[900px]">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-white">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-navy">
            {count} {count === 1 ? "medicine" : "medicines"} selected
          </p>
          <p className="truncate text-xs font-semibold text-muted">
            {currency(subtotal)} subtotal
            {latestItem ? ` · Last added: ${latestItem.name}` : ""}
          </p>
        </div>
        {latestItem ? (
          <div className="hidden shrink-0 items-center overflow-hidden rounded-xl border border-border bg-white sm:flex">
            <button
              type="button"
              onClick={() => setItemQuantity(latestItem.medicineId, latestItem.qty - 1)}
              className="grid h-11 w-10 place-items-center text-muted"
              aria-label={`Decrease ${latestItem.name}`}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-10 border-x border-border px-3 text-center text-sm font-black text-navy">
              {latestItem.qty}
            </span>
            <button
              type="button"
              onClick={() => setItemQuantity(latestItem.medicineId, latestItem.qty + 1)}
              className="grid h-11 w-10 place-items-center text-muted"
              aria-label={`Increase ${latestItem.name}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        {latestItem ? (
          <button
            type="button"
            onClick={() => removeItem(latestItem.medicineId)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-error"
            aria-label={`Remove ${latestItem.name}`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        ) : null}
        <Link
          to="/checkout"
          className="shrink-0 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white"
        >
          Buy
        </Link>
      </div>
    </div>
  );
}
