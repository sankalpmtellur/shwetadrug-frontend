import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, PackageSearch, RefreshCcw } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { inventoryService } from "../services/inventoryService";
import type { InventoryItem, ListMeta } from "../services/inventoryService";

const pageSize = 10;

type InventoryDraft = {
  quantity: string;
  mrp: string;
  sellingPrice: string;
  gstPercent: string;
  costPrice: string;
  batchNumber: string;
  expiryDate: string;
  status: string;
};

function formatCount(value: number | null | undefined) {
  return typeof value === "number" ? new Intl.NumberFormat("en-IN").format(value) : "-";
}

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function isNeedsDecision(item: InventoryItem) {
  return item.availableQuantity <= item.medicine.reorderLevel || item.status === "LOW" || item.status === "REORDER" || item.status === "OUT_OF_STOCK";
}

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [meta, setMeta] = useState<ListMeta>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, InventoryDraft>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await inventoryService.getInventory();
      setItems(result.items);
      setMeta(result.meta);
    } catch (inventoryError) {
      setError(inventoryError instanceof Error ? inventoryError.message : "Unable to load inventory");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadInventory();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadInventory]);

  function getDraft(item: InventoryItem) {
    return drafts[item.id] ?? {
      quantity: String(item.quantityOnHand),
      mrp: String(item.medicine.mrp),
      sellingPrice: String(item.medicine.sellingPrice),
      gstPercent: String(item.medicine.gstPercent),
      costPrice: item.costPrice === null ? "" : String(item.costPrice),
      batchNumber: item.batchNumber,
      expiryDate: toDateInputValue(item.expiryDate),
      status: item.status,
    };
  }

  function updateDraft(item: InventoryItem, draft: Partial<InventoryDraft>) {
    setDrafts((current) => ({
      ...current,
        [item.id]: {
          quantity: current[item.id]?.quantity ?? String(item.quantityOnHand),
          mrp: current[item.id]?.mrp ?? String(item.medicine.mrp),
          sellingPrice: current[item.id]?.sellingPrice ?? String(item.medicine.sellingPrice),
          gstPercent: current[item.id]?.gstPercent ?? String(item.medicine.gstPercent),
          costPrice: current[item.id]?.costPrice ?? (item.costPrice === null ? "" : String(item.costPrice)),
          batchNumber: current[item.id]?.batchNumber ?? item.batchNumber,
          expiryDate: current[item.id]?.expiryDate ?? toDateInputValue(item.expiryDate),
          status: current[item.id]?.status ?? item.status,
          ...draft,
        },
    }));
  }

  async function handleInventoryUpdate(item: InventoryItem) {
    const draft = getDraft(item);
    const quantity = Number(draft.quantity);
    const mrp = Number(draft.mrp);
    const sellingPrice = Number(draft.sellingPrice);
    const gstPercent = Number(draft.gstPercent);
    const costPrice = draft.costPrice.trim() ? Number(draft.costPrice) : null;

    if (!Number.isInteger(quantity) || quantity < 0) {
      setActionError("Quantity must be a non-negative whole number");
      return;
    }
    if (!draft.batchNumber.trim()) {
      setActionError("Batch number is required");
      return;
    }
    if (!draft.expiryDate.trim()) {
      setActionError("Expiry date is required");
      return;
    }
    if ([mrp, sellingPrice].some((value) => Number.isNaN(value) || value <= 0)) {
      setActionError("MRP and selling price must be positive numbers");
      return;
    }
    if (Number.isNaN(gstPercent) || gstPercent < 0 || gstPercent > 100) {
      setActionError("GST must be between 0 and 100");
      return;
    }
    if (costPrice !== null && (Number.isNaN(costPrice) || costPrice <= 0)) {
      setActionError("Purchase price must be blank or a positive number");
      return;
    }

    setUpdatingId(item.id);
    setActionError(null);

    try {
      const updated = await inventoryService.updateInventory(item.id, {
        quantity,
        mrp,
        sellingPrice,
        gstPercent,
        costPrice,
        batchNumber: draft.batchNumber.trim(),
        expiryDate: draft.expiryDate,
        status: draft.status,
      });
      setItems((current) => current.map((row) => (row.id === item.id ? updated : row)));
      setDrafts((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
    } catch (inventoryError) {
      setActionError(inventoryError instanceof Error ? inventoryError.message : "Unable to update inventory");
    } finally {
      setUpdatingId(null);
    }
  }

  const needsDecisionCount = useMemo(() => items.filter(isNeedsDecision).length, [items]);
  const stockoutCount = useMemo(() => items.filter((item) => item.availableQuantity <= 0 || item.status === "OUT_OF_STOCK").length, [items]);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Boxes />} label="Tracked SKUs" value={formatCount(meta.total ?? items.length)} hint="Live inventory lots" tone="blue" />
        <Metric icon={<RefreshCcw />} label="Needs Decision" value={formatCount(needsDecisionCount)} hint="At or below reorder level" tone="orange" />
        <Metric icon={<PackageSearch />} label="Stockout" value={formatCount(stockoutCount)} hint="Immediate purchase required" tone="green" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Inventory Lots</h2>
            <p className="text-sm text-muted">Useful stock quantities, expiry dates, and pricing for launch operations.</p>
          </div>
          {error ? (
            <Button type="button" onClick={() => void loadInventory()}>
              Retry
            </Button>
          ) : null}
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading inventory...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {actionError ? <p className="mb-3 text-sm font-bold text-error">{actionError}</p> : null}
        {!isLoading && !error && items.length === 0 ? <p className="text-sm font-bold text-muted">No inventory lots found.</p> : null}

        {!isLoading && !error && items.length > 0 ? (
          <Table headers={["Medicine", "Batch", "Expiry", "Qty", "MRP", "Purchase", "Selling", "GST", "Status", "Actions/Edit"]}>
            {pageItems.map((item) => {
              const draft = getDraft(item);
              return (
                <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                  <Cell strong>{item.medicine.name}</Cell>
                  <Cell>
                    <input className="h-10 w-36 rounded-lg border border-border px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" value={draft.batchNumber} onChange={(event) => updateDraft(item, { batchNumber: event.target.value })} disabled={updatingId === item.id} />
                  </Cell>
                  <Cell>
                    <input className="h-10 w-36 rounded-lg border border-border px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" type="date" value={draft.expiryDate} onChange={(event) => updateDraft(item, { expiryDate: event.target.value })} disabled={updatingId === item.id} />
                  </Cell>
                  <Cell>{formatCount(item.availableQuantity)}</Cell>
                  <Cell>
                    <input className="h-10 w-24 rounded-lg border border-border px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" type="number" min="0" value={draft.mrp} onChange={(event) => updateDraft(item, { mrp: event.target.value })} disabled={updatingId === item.id} />
                  </Cell>
                  <Cell>
                    <input className="h-10 w-24 rounded-lg border border-border px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" type="number" min="0" value={draft.costPrice} onChange={(event) => updateDraft(item, { costPrice: event.target.value })} disabled={updatingId === item.id} />
                  </Cell>
                  <Cell>
                    <input className="h-10 w-24 rounded-lg border border-border px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" type="number" min="0" value={draft.sellingPrice} onChange={(event) => updateDraft(item, { sellingPrice: event.target.value })} disabled={updatingId === item.id} />
                  </Cell>
                  <Cell>
                    <input className="h-10 w-20 rounded-lg border border-border px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" type="number" min="0" max="100" value={draft.gstPercent} onChange={(event) => updateDraft(item, { gstPercent: event.target.value })} disabled={updatingId === item.id} />
                  </Cell>
                  <Cell>
                    <select className="h-10 w-36 rounded-lg border border-border px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" value={draft.status} onChange={(event) => updateDraft(item, { status: event.target.value })} disabled={updatingId === item.id}>
                      {["HEALTHY", "LOW", "REORDER", "OUT_OF_STOCK", "EXPIRED", "BLOCKED"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                    </select>
                  </Cell>
                  <Cell>
                    <div className="grid min-w-40 gap-2 sm:flex sm:items-center">
                      <input
                        className="h-10 w-full rounded-lg border border-border px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 sm:w-24"
                        type="number"
                        min="0"
                        value={draft.quantity}
                        onChange={(event) => updateDraft(item, { quantity: event.target.value })}
                        disabled={updatingId === item.id}
                      />
                      <Button type="button" onClick={() => void handleInventoryUpdate(item)} disabled={updatingId === item.id}>
                        Save
                      </Button>
                    </div>
                  </Cell>
                </tr>
              );
            })}
          </Table>
        ) : null}
        {!isLoading && !error && items.length > 0 ? <Pagination page={currentPage} totalPages={totalPages} totalItems={items.length} onPageChange={setPage} /> : null}
      </Card>
    </section>
  );
}

function Pagination({ page, totalPages, totalItems, onPageChange }: { page: number; totalPages: number; totalItems: number; onPageChange: (page: number) => void }) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-muted">{formatCount(totalItems)} lots · Page {page} of {totalPages}</p>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button className="w-full sm:w-auto" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
        <Button className="w-full sm:w-auto" variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
