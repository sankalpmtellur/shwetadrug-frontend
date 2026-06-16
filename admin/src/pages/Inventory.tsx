import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, PackageSearch, RefreshCcw } from "lucide-react";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { inventoryService } from "../services/inventoryService";
import type { InventoryItem, ListMeta } from "../services/inventoryService";

const inventoryStatuses = ["HEALTHY", "LOW", "REORDER", "OUT_OF_STOCK", "EXPIRED", "BLOCKED"];

type InventoryDraft = {
  quantity: string;
  status: string;
};

function formatCount(value: number | null | undefined) {
  return typeof value === "number" ? new Intl.NumberFormat("en-IN").format(value) : "-";
}

function formatCurrency(value: number | null | undefined) {
  return typeof value === "number"
    ? new Intl.NumberFormat("en-IN", {
        currency: "INR",
        maximumFractionDigits: 0,
        style: "currency",
      }).format(value)
    : "-";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusTone(status: string, availableQuantity: number): "green" | "orange" | "red" | "blue" {
  if (availableQuantity <= 0 || status === "OUT_OF_STOCK") return "red";
  if (status === "LOW" || status === "REORDER") return "orange";
  return "green";
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
    void loadInventory();
  }, [loadInventory]);

  function getDraft(item: InventoryItem) {
    return drafts[item.id] ?? { quantity: String(item.quantityOnHand), status: item.status };
  }

  function updateDraft(item: InventoryItem, draft: Partial<InventoryDraft>) {
    setDrafts((current) => ({
      ...current,
      [item.id]: {
        quantity: current[item.id]?.quantity ?? String(item.quantityOnHand),
        status: current[item.id]?.status ?? item.status,
        ...draft,
      },
    }));
  }

  async function handleInventoryUpdate(item: InventoryItem) {
    const draft = getDraft(item);
    const quantity = Number(draft.quantity);

    if (!Number.isInteger(quantity) || quantity < 0) {
      setActionError("Quantity must be a non-negative whole number");
      return;
    }

    setUpdatingId(item.id);
    setActionError(null);

    try {
      const updated = await inventoryService.updateInventory(item.id, {
        quantity,
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
            <p className="text-sm text-muted">Live stock, expiry, and reorder status from backend inventory.</p>
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
          <Table headers={["SKU", "Medicine", "Batch", "Available", "Stock Value", "Expiry", "Status", "Update"]}>
            {items.map((item) => {
              const draft = getDraft(item);
              return (
                <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                  <Cell strong>{item.medicine.sku}</Cell>
                  <Cell>{item.medicine.name}</Cell>
                  <Cell>{item.batchNumber}</Cell>
                  <Cell>{formatCount(item.availableQuantity)}</Cell>
                  <Cell>{formatCurrency(item.costPrice === null ? null : item.costPrice * item.quantityOnHand)}</Cell>
                  <Cell>{formatDate(item.expiryDate)}</Cell>
                  <Cell>
                    <div className="flex flex-col gap-2">
                      <Badge tone={getStatusTone(item.status, item.availableQuantity)}>{item.status.replaceAll("_", " ")}</Badge>
                      <select
                        className="h-10 rounded-lg border border-border bg-white px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        value={draft.status}
                        onChange={(event) => updateDraft(item, { status: event.target.value })}
                        disabled={updatingId === item.id}
                      >
                        {inventoryStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Cell>
                  <Cell>
                    <div className="flex min-w-40 items-center gap-2">
                      <input
                        className="h-10 w-24 rounded-lg border border-border px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
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
      </Card>
    </section>
  );
}
