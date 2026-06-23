import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, ShieldAlert } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { inventoryService, type InventoryItem } from "../services/inventoryService";
import { formatCount, formatDate } from "../utils/formatters";

const expiryWindowDays = 60;

export default function Expiry() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Metric icon={<ShieldAlert />} label="Expiring Batches" value={formatCount(items.length)} hint={`Within next ${expiryWindowDays} days`} tone="orange" />
        <Metric icon={<ShieldAlert />} label="Expired Batches" value={formatCount(expiredCount)} hint="Already past expiry date" tone="orange" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Expiry Management</h2>
            <p className="text-sm text-muted">Read-only batch view for inventory expiring soon. Backend does not expose a safe delete endpoint.</p>
          </div>
          <Button type="button" className="gap-2" onClick={() => void loadExpiringInventory()} variant="secondary">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading expiring inventory...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {!isLoading && !error && items.length === 0 ? <p className="text-sm font-bold text-muted">No batches expiring in the next {expiryWindowDays} days.</p> : null}

        {!isLoading && !error && items.length > 0 ? (
          <Table headers={["Medicine", "SKU", "Batch", "Expiry", "Days Left", "Available Qty"]}>
            {items.map((item) => {
              const daysRemaining = getDaysRemaining(item.expiryDate);

              return (
                <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                  <Cell strong>{item.medicine.name}</Cell>
                  <Cell>{item.medicine.sku}</Cell>
                  <Cell>{item.batchNumber}</Cell>
                  <Cell>{formatDate(item.expiryDate)}</Cell>
                  <Cell>{formatDaysRemaining(daysRemaining)}</Cell>
                  <Cell>{formatCount(item.availableQuantity)}</Cell>
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

function formatDaysRemaining(days: number) {
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}
