import { useCallback, useEffect, useMemo, useState } from "react";
import { IndianRupee, PackageCheck, Truck } from "lucide-react";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { operationsService } from "../services/operationsService";
import type { Delivery } from "../services/operationsService";
import type { ListMeta } from "../lib/api";
import { formatCount, formatCurrency, formatDate, statusLabel, statusTone } from "../utils/formatters";

export default function Deliveries() {
  const [items, setItems] = useState<Delivery[]>([]);
  const [meta, setMeta] = useState<ListMeta>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeliveries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operationsService.getDeliveries();
      setItems(result.items);
      setMeta(result.meta);
    } catch (deliveryError) {
      setError(deliveryError instanceof Error ? deliveryError.message : "Unable to load deliveries");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDeliveries();
  }, [loadDeliveries]);

  const activeCount = useMemo(() => items.filter((item) => item.status === "PACKED" || item.status === "DISPATCHED").length, [items]);
  const deliveryValue = useMemo(() => items.reduce((sum, item) => sum + item.totalAmount, 0), [items]);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Truck />} label="Deliveries" value={formatCount(meta.total ?? items.length)} hint="Backend delivery records" tone="blue" />
        <Metric icon={<PackageCheck />} label="Active" value={formatCount(activeCount)} hint="Packed or dispatched" tone="orange" />
        <Metric icon={<IndianRupee />} label="Delivery Value" value={formatCurrency(deliveryValue)} hint="Current view total" tone="green" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Deliveries</h2>
            <p className="text-sm text-muted">Live delivery status from packed, dispatched, and delivered orders.</p>
          </div>
          {error ? <Button onClick={() => void loadDeliveries()}>Retry</Button> : null}
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading deliveries...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {!isLoading && !error && items.length === 0 ? <p className="text-sm font-bold text-muted">No deliveries found.</p> : null}

        {!isLoading && !error && items.length > 0 ? (
          <Table headers={["Order", "Retailer", "Items", "Placed", "Dispatched", "Total", "Status"]}>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                <Cell strong>{item.orderNo}</Cell>
                <Cell>{item.retailer.pharmacyName}</Cell>
                <Cell>{formatCount(item.items.length)}</Cell>
                <Cell>{formatDate(item.placedAt)}</Cell>
                <Cell>{formatDate(item.dispatchedAt)}</Cell>
                <Cell>{formatCurrency(item.totalAmount)}</Cell>
                <Cell>
                  <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
                </Cell>
              </tr>
            ))}
          </Table>
        ) : null}
      </Card>
    </section>
  );
}
