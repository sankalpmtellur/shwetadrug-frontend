import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Info, Minus, PackageCheck, Search, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { useCart } from "../hooks/useCart";
import { currency } from "../utils/formatters";
import { medicineService } from "../services/medicineService";
import type { Medicine } from "../types";

function usePageSize() {
  const [pageSize, setPageSize] = useState(() => (typeof window === "undefined" || window.innerWidth < 1024 ? 10 : 20));

  useEffect(() => {
    function updatePageSize() {
      setPageSize(window.innerWidth < 1024 ? 10 : 20);
    }

    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  return pageSize;
}

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const pageSize = usePageSize();
  const { addItem, items, removeItem } = useCart();

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize, search]);

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

  const visibleMedicines = useMemo(() => medicines.slice(0, visibleCount), [medicines, visibleCount]);
  const canLoadMore = visibleCount < medicines.length;

  const quantityFor = (id: string, isOut: boolean) => {
    if (isOut) return 0;
    return quantities[id] ?? 10;
  };

  const updateQty = (id: string, value: number) => {
    setQuantities((current) => ({ ...current, [id]: Math.max(0, Math.floor(value) || 0) }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="sticky top-0 z-30 -mx-3 bg-background/95 px-3 pb-3 pt-1 backdrop-blur md:mx-0 md:px-0">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search medicine..."
              className="h-12 w-full rounded-lg border border-border bg-white py-3 pl-12 pr-4 text-base font-semibold text-navy shadow-sm outline-none placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </label>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: pageSize }).map((_, item) => (
              <div key={item} className="h-64 animate-pulse rounded-lg bg-white shadow-sm" />
            ))}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-sm font-semibold text-error">
            <p>{errorMessage}</p>
            <Button type="button" className="mt-3" onClick={() => setRetryKey((current) => current + 1)}>
              Retry
            </Button>
          </div>
        ) : null}

        {!isLoading && !errorMessage ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleMedicines.map((medicine) => {
              const isOut = medicine.status === "Out";
              const qty = quantityFor(medicine.id, isOut);
              const cartItem = items.find((item) => item.medicineId === medicine.id);
              const isInCart = Boolean(cartItem);
              const cartQty = cartItem?.qty ?? 0;

              return (
                <article
                  key={medicine.id}
                  className="flex min-h-[280px] flex-col rounded-lg border border-border bg-white p-4 shadow-sm transition hover:border-primary/30"
                >
                  <div className="flex items-start gap-3">
                    <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setSelectedMedicine(medicine)}>
                      <h2 className="line-clamp-2 min-h-[44px] text-base font-black leading-snug text-navy">{medicine.name}</h2>
                      <p className="mt-1 truncate text-xs font-semibold text-muted">{medicine.pack}</p>
                    </button>
                    <button
                      type="button"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-soft text-primary"
                      onClick={() => setSelectedMedicine(medicine)}
                      aria-label={`View ${medicine.name} details`}
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Metric label="Shop Qty" value={String(medicine.stock)} />
                    <Metric label="MRP" value={currency(medicine.mrp)} strong />
                  </div>

                  <div className="mt-4 rounded-lg border border-border bg-surface-soft p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-muted">Order Qty</span>
                      {isInCart ? <span className="text-xs font-black text-primary">In cart: {cartQty}</span> : null}
                    </div>
                    <div className={`mt-3 flex h-11 overflow-hidden rounded-lg border border-border bg-white ${isOut ? "opacity-50" : ""}`}>
                      <button
                        type="button"
                        disabled={isOut}
                        onClick={() => updateQty(medicine.id, qty - 1)}
                        className="grid w-11 place-items-center text-muted disabled:cursor-not-allowed"
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
                        className="min-w-0 flex-1 border-x border-border text-center text-sm font-black text-navy outline-none disabled:cursor-not-allowed"
                        aria-label={`${medicine.name} quantity`}
                      />
                      <button
                        type="button"
                        disabled={isOut}
                        onClick={() => updateQty(medicine.id, qty + 10)}
                        className="grid w-14 place-items-center text-xs font-black text-primary disabled:cursor-not-allowed disabled:text-muted"
                        aria-label={`Add 10 ${medicine.name}`}
                      >
                        +10
                      </button>
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    <Button
                      disabled={isOut || qty <= 0}
                      variant={isOut ? "ghost" : "primary"}
                      className="h-11 w-full rounded-lg px-3 text-sm"
                      onClick={() => addItem(medicine, qty)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {isOut ? "Out of Stock" : isInCart ? "Update Cart" : "Add to Cart"}
                    </Button>

                    {isInCart ? (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Link to="/checkout" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-surface-strong px-3 text-sm font-black text-primary">
                          <ShoppingBag className="h-4 w-4" />
                          Buy
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(medicine.id)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 text-sm font-black text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        {!isLoading && !errorMessage && canLoadMore ? (
          <div className="flex justify-center pt-2">
            <Button type="button" variant="secondary" className="min-w-48" onClick={() => setVisibleCount((current) => current + pageSize)}>
              Load More
            </Button>
          </div>
        ) : null}

        {!isLoading && !errorMessage && medicines.length === 0 ? (
          <div className="rounded-lg border border-border bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-black text-navy">No medicine found</h2>
            <p className="mt-2 text-sm text-muted">Try another name or SKU.</p>
          </div>
        ) : null}
      </div>

      <Modal open={Boolean(selectedMedicine)} title={selectedMedicine?.name ?? "Medicine details"} onClose={() => setSelectedMedicine(null)}>
        {selectedMedicine ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-border bg-surface-soft p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-primary">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-primary">{selectedMedicine.status}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-muted">
                    {selectedMedicine.genericName} by {selectedMedicine.manufacturer}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Detail label="MRP" value={currency(selectedMedicine.mrp)} />
              <Detail label="Selling" value={currency(selectedMedicine.price)} />
              <Detail label="Available" value={String(selectedMedicine.stock)} />
              <Detail label="Pack" value={selectedMedicine.pack} />
              <Detail label="Batch" value={selectedMedicine.batch} />
              <Detail label="Expiry" value={selectedMedicine.expiry} />
              <Detail label="GST" value={`${selectedMedicine.gst}%`} />
              <Detail label="SKU" value={selectedMedicine.sku} />
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Please confirm pack size and quantity before adding to cart.
            </div>
          </div>
        ) : null}
      </Modal>
    </DashboardLayout>
  );
}

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-lg bg-surface-soft p-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className={`mt-1 text-lg font-black ${strong ? "text-primary" : "text-navy"}`}>{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-soft p-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-navy">{value}</p>
    </div>
  );
}
