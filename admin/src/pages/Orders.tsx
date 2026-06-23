import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, IndianRupee, ShoppingBag } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { operationsService } from "../services/operationsService";
import type { Order } from "../services/operationsService";
import type { ListMeta } from "../lib/api";
import { formatCount, formatCurrency, formatDate } from "../utils/formatters";

export default function Orders() {
  const [items, setItems] = useState<Order[]>([]);
  const [meta, setMeta] = useState<ListMeta>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operationsService.getOrders();
      setItems(result.items);
      setMeta(result.meta);
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : "Unable to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOrders]);

  const revenue = useMemo(() => items.reduce((sum, item) => sum + item.totalAmount, 0), [items]);
  const averageOrderValue = items.length ? revenue / items.length : 0;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<ShoppingBag />} label="Orders" value={formatCount(meta.total ?? items.length)} hint="Backend order records" tone="blue" />
        <Metric icon={<Clock />} label="Loaded" value={formatCount(items.length)} hint="Orders in current view" tone="orange" />
        <Metric icon={<IndianRupee />} label="Loaded Value" value={formatCurrency(revenue)} hint="Current view total" tone="green" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Orders</h2>
            <p className="text-sm text-muted">Read-only order value and retailer demand from backend orders.</p>
          </div>
          {error ? <Button onClick={() => void loadOrders()}>Retry</Button> : null}
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading orders...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {!isLoading && !error && items.length === 0 ? <p className="text-sm font-bold text-muted">No orders found.</p> : null}

        {!isLoading && !error && items.length > 0 ? (
          <Table headers={["Order", "Retailer", "Items", "Placed", "Total", "Priority"]}>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                <Cell strong>{item.orderNo}</Cell>
                <Cell>{item.retailer.pharmacyName}</Cell>
                <Cell>{formatCount(item.items.length)}</Cell>
                <Cell>{formatDate(item.placedAt)}</Cell>
                <Cell>{formatCurrency(item.totalAmount)}</Cell>
                <Cell>{item.priority.replaceAll("_", " ")}</Cell>
              </tr>
            ))}
          </Table>
        ) : null}
        {!isLoading && !error && items.length > 0 ? (
          <p className="mt-4 border-t border-border pt-4 text-sm font-bold text-muted">
            Average order value: {formatCurrency(averageOrderValue)}
          </p>
        ) : null}
      </Card>
    </section>
  );
}
