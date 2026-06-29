import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, ShieldAlert } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Badge } from "../components/common/Badge";
import { Cell, Table } from "../components/common/Table";
import { inventoryService, type InventoryItem } from "../services/inventoryService";
import { operationsService } from "../services/operationsService";
import { formatCount, formatDate } from "../utils/formatters";

const expiryWindowDays = 60;

export default function Expiry() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadExpiringInventory() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await inventoryService.getExpiringInventory(expiryWindowDays);
      setItems(result.items);
    } catch (expiryError) {
      setError(expiryError instanceof Error ? expiryError.message : "Unable to load expiry inventory");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadExpiringInventory();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const expiredCount = useMemo(() => items.filter((item) => getDaysRemaining(item.expiryDate) < 0).length, [items]);
  const expiringSoonCount = useMemo(() => items.filter((item) => {
    const daysRemaining = getDaysRemaining(item.expiryDate);
    return daysRemaining >= 0 && daysRemaining <= 30;
  }).length, [items]);

  async function markStockUnusable(item: InventoryItem, status: "EXPIRED" | "BLOCKED") {
    setUpdatingId(item.id);
    setActionMessage(null);

    try {
      const updated = await inventoryService.updateInventory(item.id, { status });
      setItems((current) => current.map((row) => (row.id === item.id ? updated : row)));
      setActionMessage({ tone: "success", text: `${item.medicine.name} batch ${item.batchNumber} marked ${status.toLowerCase()}.` });
    } catch (actionError) {
      setActionMessage({ tone: "error", text: actionError instanceof Error ? actionError.message : "Unable to update expiry status" });
    } finally {
      setUpdatingId(null);
    }
  }

  async function discontinueMedicine(item: InventoryItem) {
    setUpdatingId(item.id);
    setActionMessage(null);

    try {
      await operationsService.deleteMedicine(item.medicine.id);
      setItems((current) => current.filter((row) => row.medicine.id !== item.medicine.id));
      setActionMessage({ tone: "success", text: `${item.medicine.name} discontinued and hidden from retailers.` });
    } catch (actionError) {
      setActionMessage({ tone: "error", text: actionError instanceof Error ? actionError.message : "Unable to discontinue medicine" });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Metric icon={<ShieldAlert />} label="Expiring Batches" value={formatCount(items.length)} hint={`Within next ${expiryWindowDays} days`} tone="orange" />
        <Metric icon={<ShieldAlert />} label="Expired Batches" value={formatCount(expiredCount)} hint="Already past expiry date" tone="orange" />
        <Metric icon={<ShieldAlert />} label="Expiring Soon" value={formatCount(expiringSoonCount)} hint="Within next 30 days" tone="orange" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Expiry Management</h2>
            <p className="text-sm text-muted">Batch view for expiry control. Actions are soft status changes only.</p>
          </div>
          <Button type="button" className="gap-2" onClick={() => void loadExpiringInventory()} variant="secondary">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading expiring inventory...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {actionMessage ? (
          <div className={`mb-3 rounded-lg px-4 py-3 text-sm font-bold ${actionMessage.tone === "success" ? "bg-emerald-50 text-success" : "bg-red-50 text-error"}`}>
            {actionMessage.text}
          </div>
        ) : null}
        {!isLoading && !error && items.length === 0 ? <p className="text-sm font-bold text-muted">No batches expiring in the next {expiryWindowDays} days.</p> : null}

        {!isLoading && !error && items.length > 0 ? (
          <Table headers={["Medicine", "SKU", "Batch", "Expiry", "Status", "Available Qty", "Actions"]}>
            {items.map((item) => {
              const daysRemaining = getDaysRemaining(item.expiryDate);

              return (
                <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                  <Cell strong>{item.medicine.name}</Cell>
                  <Cell>{item.medicine.sku}</Cell>
                  <Cell>{item.batchNumber}</Cell>
                  <Cell>{formatDate(item.expiryDate)}</Cell>
                  <Cell><ExpiryBadge daysRemaining={daysRemaining} status={item.status} /></Cell>
                  <Cell>{formatCount(item.availableQuantity)}</Cell>
                  <Cell>
                    <div className="grid min-w-52 gap-2">
                      <Button type="button" variant="secondary" disabled={updatingId === item.id} onClick={() => void markStockUnusable(item, daysRemaining < 0 ? "EXPIRED" : "BLOCKED")}>
                        {daysRemaining < 0 ? "Mark Expired" : "Block Stock"}
                      </Button>
                      <Button type="button" disabled={updatingId === item.id} onClick={() => void discontinueMedicine(item)}>
                        Discontinue Medicine
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

function getDaysRemaining(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(value);
  expiryDate.setHours(0, 0, 0, 0);
  return Math.ceil((expiryDate.getTime() - today.getTime()) / 86_400_000);
}

function ExpiryBadge({ daysRemaining, status }: { daysRemaining: number; status: string }) {
  if (status === "EXPIRED" || daysRemaining < 0) return <Badge tone="red">Expired</Badge>;
  if (status === "BLOCKED") return <Badge tone="red">Blocked</Badge>;
  if (daysRemaining <= 30) return <Badge tone="orange">Expiring Soon</Badge>;
  return <Badge tone="green">Safe</Badge>;
}
