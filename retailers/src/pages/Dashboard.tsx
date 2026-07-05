import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, PackageCheck, Search, ShoppingBag, ShoppingCart } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const pageSize = usePageSize();
  const pageKey = `${search}:${pageSize}`;
  const [paging, setPaging] = useState({ key: pageKey, count: pageSize });
  const visibleCount = paging.key === pageKey ? paging.count : pageSize;
  const { addItem } = useCart();

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

  const confirmQuantity = async (medicine: Medicine, action: "cart" | "buy") => {
    await addItem(medicine, 1);

    if (action === "buy") {
      navigate("/checkout");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="sticky top-0 z-30 -mx-3 bg-background px-3 pb-4 pt-3 border-b border-slate-300/80 md:-mx-8 md:px-8 md:pt-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-xl border border-slate-300/80 bg-white p-2 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:shadow-md">
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
          <div className="relative z-0 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleMedicines.map((medicine) => {
              const isOut = medicine.status === "Out";

              return (
                <article key={medicine.id} className="relative z-0 flex min-h-[224px] flex-col rounded-lg border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-3 min-h-[60px] min-w-0 flex-1 text-base font-black leading-snug text-navy">{medicine.name}</h2>
                    <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-soft text-primary transition hover:bg-surface-strong" onClick={() => setSelectedMedicine(medicine)} aria-label={`View ${medicine.name} details`}>
                      <Info className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Metric label="Available Stock" value={isOut ? "Out" : `${medicine.stock} units`} tone={isOut ? "error" : medicine.status === "Limited" ? "warning" : "default"} />
                    <Metric label="MRP" value={currency(medicine.mrp)} strong />
                  </div>

                  <div className="mt-auto pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        disabled={isOut}
                        variant={isOut ? "ghost" : "secondary"}
                        className="h-11 rounded-lg px-2 text-sm"
                        onClick={() => void confirmQuantity(medicine, "cart")}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                      <Button
                        disabled={isOut}
                        variant={isOut ? "ghost" : "primary"}
                        className="h-11 rounded-lg px-2 text-sm"
                        onClick={() => void confirmQuantity(medicine, "buy")}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Buy Now
                      </Button>
                    </div>

                    {isOut ? (
                      <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-black text-error">
                        Out of Stock
                      </p>
                    ) : null}
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
              <Detail label="Selling Price" value={currency(selectedMedicine.price)} />
              <Detail label="GST" value={`${selectedMedicine.gst}%`} />
              <Detail label="Manufacturer" value={selectedMedicine.manufacturer} />
              <Detail label="Pack Size" value={selectedMedicine.pack} />
            </div>
          </div>
        ) : null}
      </Modal>
    </DashboardLayout>
  );
}

function Metric({ label, value, strong, tone = "default" }: { label: string; value: string; strong?: boolean; tone?: "default" | "warning" | "error" }) {
  const toneClass = tone === "error" ? "text-error" : tone === "warning" ? "text-orange-700" : strong ? "text-primary" : "text-navy";

  return (
    <div className="rounded-lg bg-surface-soft p-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className={`mt-1 break-words text-lg font-black ${toneClass}`}>{value}</p>
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
