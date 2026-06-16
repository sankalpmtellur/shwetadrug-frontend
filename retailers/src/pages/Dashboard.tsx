import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Info, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { useCart } from "../hooks/useCart";
import { currency } from "../utils/formatters";
import { medicineService } from "../services/medicineService";
import type { Medicine } from "../types";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const { addItem, items, removeItem } = useCart();

  useEffect(() => {
    const controller = new AbortController();
    const query = search.trim();

    async function loadMedicines() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const nextMedicines = query
          ? await medicineService.searchMedicines(query)
          : await medicineService.getMedicines();

        if (!controller.signal.aborted) {
          setMedicines(nextMedicines);
        }
      } catch {
        if (!controller.signal.aborted) {
          setErrorMessage("Could not load medicines. Please try again.");
          setMedicines([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    const timeoutId = window.setTimeout(loadMedicines, query ? 250 : 0);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [retryKey, search]);

  const quantityFor = (id: string, isOut: boolean) => {
    if (isOut) return 0;
    return quantities[id] ?? 10;
  };

  const updateQty = (id: string, value: number) => {
    setQuantities((current) => ({ ...current, [id]: Math.max(0, value) }));
  };

  return (
    <DashboardLayout showSidebar>
      <div className="space-y-4">
        <div className="sticky top-0 z-30 -mx-4 bg-background/95 px-4 pb-3 pt-1 backdrop-blur md:mx-0 md:px-0">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search medicine..."
              className="h-12 w-full rounded-2xl border border-border bg-white py-3 pl-12 pr-4 text-base font-semibold text-navy shadow-sm outline-none placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </label>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-error">
            <p>{errorMessage}</p>
            <Button type="button" className="mt-3" onClick={() => setRetryKey((current) => current + 1)}>
              Retry
            </Button>
          </div>
        ) : null}

        {!isLoading && !errorMessage ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {medicines.map((medicine) => {
            const isOut = medicine.status === "Out";
            const qty = quantityFor(medicine.id, isOut);
            const cartItem = items.find((item) => item.medicineId === medicine.id);
            const isInCart = Boolean(cartItem);

            return (
              <article
                key={medicine.id}
                className="rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:border-primary/30"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setSelectedMedicine(medicine)}
                  >
                    <h2 className="text-base font-black leading-snug text-navy">
                      {medicine.name}
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-muted">{medicine.pack}</p>
                  </button>
                  <button
                    type="button"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-soft text-primary"
                    onClick={() => setSelectedMedicine(medicine)}
                    aria-label={`View ${medicine.name} details`}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-surface-soft p-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                      Shop Qty
                    </p>
                    <p className="mt-1 text-lg font-black text-navy">{medicine.stock}</p>
                  </div>
                  <div className="rounded-xl bg-surface-soft p-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                      MRP
                    </p>
                    <p className="mt-1 text-lg font-black text-primary">
                      {currency(medicine.mrp)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className={`flex h-11 shrink-0 overflow-hidden rounded-xl border border-border bg-white ${isOut ? "opacity-50" : ""}`}>
                    <button
                      type="button"
                      disabled={isOut}
                      onClick={() => updateQty(medicine.id, qty - 1)}
                      className="grid w-10 place-items-center text-muted disabled:cursor-not-allowed"
                      aria-label={`Decrease ${medicine.name} quantity`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      disabled={isOut}
                      value={qty}
                      onChange={(event) => updateQty(medicine.id, Number(event.target.value))}
                      className="w-14 border-x border-border text-center text-sm font-black text-navy outline-none disabled:cursor-not-allowed"
                      aria-label={`${medicine.name} quantity`}
                    />
                    <button
                      type="button"
                      disabled={isOut}
                      onClick={() => updateQty(medicine.id, qty + 1)}
                      className="grid w-10 place-items-center text-muted disabled:cursor-not-allowed"
                      aria-label={`Increase ${medicine.name} quantity`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <Button
                    disabled={isOut || qty <= 0}
                    variant={isOut ? "ghost" : "primary"}
                    className="h-11 flex-1 rounded-xl px-3 text-sm"
                    onClick={() => addItem(medicine, qty)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isOut ? "Out" : isInCart ? "Update" : "Add"}
                  </Button>
                </div>

                {isInCart ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      to="/checkout"
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-surface-strong px-3 text-sm font-black text-primary"
                    >
                      Buy
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(medicine.id)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-50 px-3 text-sm font-black text-error"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
          </div>
        ) : null}

        {!isLoading && !errorMessage && medicines.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-black text-navy">No medicine found</h2>
            <p className="mt-2 text-sm text-muted">Try another name or SKU.</p>
          </div>
        ) : null}
      </div>

      <Modal
        open={Boolean(selectedMedicine)}
        title={selectedMedicine?.name ?? "Medicine details"}
        onClose={() => setSelectedMedicine(null)}
      >
        {selectedMedicine ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Detail label="Generic" value={selectedMedicine.genericName} />
              <Detail label="Manufacturer" value={selectedMedicine.manufacturer} />
              <Detail label="Batch" value={selectedMedicine.batch} />
              <Detail label="Expiry" value={selectedMedicine.expiry} />
              <Detail label="GST" value={`${selectedMedicine.gst}%`} />
              <Detail label="Margin" value={`${selectedMedicine.margin}%`} />
              <Detail label="Pack" value={selectedMedicine.pack} />
              <Detail label="SKU" value={selectedMedicine.sku} />
            </div>
          </div>
        ) : null}
      </Modal>
    </DashboardLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-soft p-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-sm font-black text-navy">{value}</p>
    </div>
  );
}
