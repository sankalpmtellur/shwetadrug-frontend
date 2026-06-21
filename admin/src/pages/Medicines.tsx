import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, PackageSearch, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { operationsService } from "../services/operationsService";
import type { Medicine } from "../services/operationsService";
import type { ListMeta } from "../lib/api";
import { formatCount, formatCurrency } from "../utils/formatters";

const pageSize = 10;

export default function Medicines() {
  const [items, setItems] = useState<Medicine[]>([]);
  const [meta, setMeta] = useState<ListMeta>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMedicines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operationsService.getMedicines();
      setItems(result.items);
      setMeta(result.meta);
    } catch (medicineError) {
      setError(medicineError instanceof Error ? medicineError.message : "Unable to load medicines");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMedicines();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadMedicines]);

  const activeCount = useMemo(() => items.filter((item) => item.status === "ACTIVE").length, [items]);
  const lowStockCount = useMemo(() => items.filter((item) => item.availableStock <= item.reorderLevel).length, [items]);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function confirmDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteMessage(null);

    try {
      await operationsService.deleteMedicine(deleteTarget.id);
      setDeleteMessage({ tone: "success", text: `${deleteTarget.name} removed from active catalog.` });
      setDeleteTarget(null);
      await loadMedicines();
      setPage(1);
    } catch (deleteError) {
      setDeleteMessage({ tone: "error", text: deleteError instanceof Error ? deleteError.message : "Unable to remove medicine" });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Boxes />} label="Medicines" value={formatCount(meta.total ?? items.length)} hint="Backend catalog records" tone="blue" />
        <Metric icon={<ShieldCheck />} label="Active" value={formatCount(activeCount)} hint="Loaded active medicines" tone="green" />
        <Metric icon={<PackageSearch />} label="Low Stock" value={formatCount(lowStockCount)} hint="At or below reorder level" tone="orange" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Medicine Catalog</h2>
            <p className="text-sm text-muted">Live medicine pricing and stock for launch operations.</p>
          </div>
          {error ? <Button onClick={() => void loadMedicines()}>Retry</Button> : null}
        </div>

        {deleteMessage ? (
          <div className={`mb-3 rounded-lg px-4 py-3 text-sm font-bold ${deleteMessage.tone === "success" ? "bg-emerald-50 text-success" : "bg-red-50 text-error"}`}>
            {deleteMessage.text}
          </div>
        ) : null}
        {isLoading ? <p className="text-sm font-bold text-muted">Loading medicines...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {!isLoading && !error && items.length === 0 ? <p className="text-sm font-bold text-muted">No medicines found.</p> : null}

        {!isLoading && !error && items.length > 0 ? (
          <Table headers={["SKU", "Medicine", "Manufacturer", "Stock", "MRP", "Selling", "Actions"]}>
            {pageItems.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                <Cell strong>{item.sku}</Cell>
                <Cell>{item.name}</Cell>
                <Cell>{item.manufacturer?.name ?? "-"}</Cell>
                <Cell>{formatCount(item.availableStock)}</Cell>
                <Cell>{formatCurrency(item.mrp)}</Cell>
                <Cell>{formatCurrency(item.sellingPrice)}</Cell>
                <Cell>
                  <Button className="h-9 gap-2 px-3" variant="secondary" onClick={() => setDeleteTarget(item)}>
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </Cell>
              </tr>
            ))}
          </Table>
        ) : null}
        {!isLoading && !error && items.length > 0 ? <Pagination page={currentPage} totalPages={totalPages} totalItems={items.length} onPageChange={setPage} /> : null}
      </Card>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4" onMouseDown={() => setDeleteTarget(null)}>
          <div className="w-full max-w-md rounded-lg border border-border bg-white p-5 shadow-lg" onMouseDown={(event) => event.stopPropagation()}>
            <h2 className="text-xl font-black text-navy">Remove medicine?</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              This will call the backend delete endpoint for <span className="font-bold text-navy">{deleteTarget.name}</span>. The backend uses soft-discontinue behavior, so the database record is not hard-deleted.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button type="button" className="gap-2" onClick={() => void confirmDelete()} disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Removing..." : "Confirm Remove"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Pagination({ page, totalPages, totalItems, onPageChange }: { page: number; totalPages: number; totalItems: number; onPageChange: (page: number) => void }) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-muted">{formatCount(totalItems)} medicines · Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
