import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Minus, PackageCheck, Plus, Search, ShoppingBag, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
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
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [requestedQty, setRequestedQty] = useState<Record<string, number>>({});
  const [pendingMedicineId, setPendingMedicineId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const pageSize = usePageSize();
  const pageKey = `${search}:${pageSize}`;
  const [paging, setPaging] = useState({ key: pageKey, count: pageSize });
  const visibleCount = paging.key === pageKey ? paging.count : pageSize;
  const { addItem, items, setItemQuantity } = useCart();

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
          setPaging({ key: `${query}:${pageSize}`, count: pageSize });
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
  }, [pageSize, retryKey, search]);

  const visibleMedicines = useMemo(() => medicines.slice(0, visibleCount), [medicines, visibleCount]);
  const canLoadMore = visibleCount < medicines.length;

  function cartQuantity(medicineId: string) {
    return items.find((item) => item.medicineId === medicineId)?.qty ?? 0;
  }

  function selectedQuantity(medicine: Medicine) {
    return requestedQty[medicine.id] ?? Math.min(Math.max(cartQuantity(medicine.id) || 1, 1), Math.max(medicine.stock, 1));
  }

  function setQuantity(medicine: Medicine, value: number) {
    const max = Math.max(1, medicine.stock);
    const nextQty = Number.isFinite(value) ? Math.min(Math.max(1, Math.trunc(value)), max) : 1;
    setRequestedQty((current) => ({ ...current, [medicine.id]: nextQty }));
  }

  const updateCart = async (medicine: Medicine, action: "cart" | "buy") => {
    if (medicine.status === "Out" || medicine.stock <= 0 || pendingMedicineId) return;

    const qty = selectedQuantity(medicine);
    const existingQty = cartQuantity(medicine.id);

    setPendingMedicineId(medicine.id);
    try {
      if (existingQty > 0) {
        await setItemQuantity(medicine.id, qty);
        toast.success(`${medicine.name} quantity updated to ${qty}.`);
      } else {
        await addItem(medicine, qty);
        toast.success(`${qty} units added to cart.`);
      }

      if (action === "buy") {
        navigate("/checkout");
      }
    } finally {
      setPendingMedicineId(null);
    }
  };

  const showMedicineDetails = async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    try {
      setSelectedMedicine(await medicineService.getMedicine(medicine.id));
    } catch {
      toast.error("Could not load medicine details.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="sticky top-0 z-30 -mx-3 border-b border-slate-300/80 bg-background px-3 pb-4 pt-3 md:-mx-8 md:px-8 md:pt-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-lg border border-slate-300/80 bg-white p-2 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search medicine name, SKU, or generic name"
                  className="h-12 w-full rounded-lg border-transparent bg-slate-50 py-3 pl-12 pr-4 text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400 transition-all focus:bg-white"
                />
              </label>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: pageSize }).map((_, item) => (
              <div key={item} className="h-36 animate-pulse rounded-lg bg-white shadow-sm" />
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
          <div className="grid gap-3">
            {visibleMedicines.map((medicine) => {
              const isOut = medicine.status === "Out" || medicine.stock <= 0;
              const currentCartQty = cartQuantity(medicine.id);
              const qty = selectedQuantity(medicine);
              const isPending = pendingMedicineId === medicine.id;

              return (
                <article key={medicine.id} className="rounded-lg border border-border bg-white p-4 shadow-sm transition hover:border-primary/30">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_260px] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="break-words text-base font-black leading-snug text-navy">{medicine.name}</h2>
                          <p className="mt-1 break-words text-sm font-semibold text-muted">{medicine.manufacturer} | {medicine.pack}</p>
                        </div>
                        <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-soft text-primary transition hover:bg-surface-strong" onClick={() => void showMedicineDetails(medicine)} aria-label={`View ${medicine.name} details`}>
                          <Info className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                        <span className={`rounded-full px-3 py-1 ${isOut ? "bg-red-50 text-error" : medicine.status === "Limited" ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"}`}>
                          {isOut ? "Out of stock" : `${medicine.stock} available`}
                        </span>
                        {currentCartQty > 0 ? <span className="rounded-full bg-blue-50 px-3 py-1 text-primary">{currentCartQty} in cart</span> : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                      <PriceLine label="MRP" value={currency(medicine.mrp)} />
                      <PriceLine label="Retailer price" value={currency(medicine.price)} strong />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[150px_1fr] lg:grid-cols-1">
                      <QuantitySelector
                        medicineName={medicine.name}
                        value={qty}
                        max={Math.max(1, medicine.stock)}
                        disabled={isOut || isPending}
                        onChange={(value) => setQuantity(medicine, value)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          disabled={isOut || isPending}
                          variant={isOut ? "ghost" : "secondary"}
                          className="h-11 px-2 text-sm"
                          onClick={() => void updateCart(medicine, "cart")}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {currentCartQty > 0 ? "Update" : "Add"}
                        </Button>
                        <Button
                          disabled={isOut || isPending}
                          variant={isOut ? "ghost" : "primary"}
                          className="h-11 px-2 text-sm"
                          onClick={() => void updateCart(medicine, "buy")}
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        {!isLoading && !errorMessage && canLoadMore ? (
          <div className="flex justify-center pt-2">
            <Button type="button" variant="secondary" className="min-w-48" onClick={() => setPaging({ key: pageKey, count: visibleCount + pageSize })}>
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

      <Modal open={Boolean(selectedMedicine)} title="Medicine Information" onClose={() => setSelectedMedicine(null)}>
        {selectedMedicine ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-soft p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-primary">
                <PackageCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${selectedMedicine.status === "Out" ? "bg-red-50 text-error" : selectedMedicine.status === "Limited" ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"}`}>
                  {selectedMedicine.status}
                </p>
                <h3 className="mt-2 break-words text-lg font-black leading-6 text-navy">{selectedMedicine.name}</h3>
                {selectedMedicine.genericName && selectedMedicine.genericName !== "Not available" ? (
                  <p className="mt-1 text-sm font-semibold leading-6 text-muted">{selectedMedicine.genericName}</p>
                ) : null}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Available Stock" value={`${selectedMedicine.stock} units`} />
              <Detail label="MRP" value={currency(selectedMedicine.mrp)} />
              <Detail label="PTR" value={currency(selectedMedicine.price)} />
              <Detail label="Max discount" value={`${selectedMedicine.margin}%`} />
              <Detail label="Manufacturer" value={selectedMedicine.manufacturer} />
              <Detail label="Pack Size" value={selectedMedicine.pack} />
            </div>
          </div>
        ) : null}
      </Modal>
    </DashboardLayout>
  );
}

function QuantitySelector({ medicineName, value, max, disabled, onChange }: { medicineName: string; value: number; max: number; disabled: boolean; onChange: (value: number) => void }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted" htmlFor={`qty-${medicineName}`}>
        Quantity
      </label>
      <div className="flex h-11 overflow-hidden rounded-lg border border-border bg-white">
        <button type="button" disabled={disabled || value <= 1} onClick={() => onChange(value - 1)} className="grid w-11 place-items-center text-muted transition hover:bg-surface-soft disabled:opacity-40" aria-label={`Decrease ${medicineName} quantity`}>
          <Minus className="h-4 w-4" />
        </button>
        <input
          id={`qty-${medicineName}`}
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          step={1}
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 border-x border-border text-center text-sm font-black text-navy outline-none"
          aria-label={`${medicineName} quantity`}
        />
        <button type="button" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} className="grid w-11 place-items-center text-muted transition hover:bg-surface-soft disabled:opacity-40" aria-label={`Increase ${medicineName} quantity`}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {!disabled && value >= max ? <p className="mt-1 text-xs font-bold text-orange-700">Maximum available stock selected.</p> : null}
    </div>
  );
}

function PriceLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-lg bg-surface-soft px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className={`mt-1 text-base font-black ${strong ? "text-primary" : "text-navy"}`}>{value}</p>
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
