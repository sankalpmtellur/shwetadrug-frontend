import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, IndianRupee, ShoppingBag } from "lucide-react";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { operationsService } from "../services/operationsService";
import type { Order } from "../services/operationsService";
import type { ListMeta } from "../lib/api";
import { formatCount, formatCurrency, formatDate, statusLabel, statusTone } from "../utils/formatters";

const orderTransitions: Record<string, string[]> = {
  PENDING: ["VERIFIED", "CANCELLED"],
  VERIFIED: ["PACKED", "CANCELLED"],
  PACKED: ["DISPATCHED"],
  DISPATCHED: ["DELIVERED"],
};

export default function Orders() {
  const [items, setItems] = useState<Order[]>([]);
  const [meta, setMeta] = useState<ListMeta>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftStatuses, setDraftStatuses] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    void loadOrders();
  }, [loadOrders]);

  async function handleOrderStatusUpdate(order: Order) {
    const status = draftStatuses[order.id];
    if (!status) return;

    setUpdatingId(order.id);
    setActionError(null);

    try {
      const result = await operationsService.updateOrderStatus(order.id, status);
      setItems((current) => current.map((item) => (item.id === order.id ? result.data : item)));
      setDraftStatuses((current) => {
        const next = { ...current };
        delete next[order.id];
        return next;
      });
    } catch (orderError) {
      setActionError(orderError instanceof Error ? orderError.message : "Unable to update order status");
    } finally {
      setUpdatingId(null);
    }
  }

  const revenue = useMemo(() => items.reduce((sum, item) => sum + item.totalAmount, 0), [items]);
  const pendingCount = useMemo(() => items.filter((item) => item.status === "PENDING").length, [items]);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<ShoppingBag />} label="Orders" value={formatCount(meta.total ?? items.length)} hint="Backend order records" tone="blue" />
        <Metric icon={<Clock />} label="Pending" value={formatCount(pendingCount)} hint="Awaiting processing" tone="orange" />
        <Metric icon={<IndianRupee />} label="Loaded Value" value={formatCurrency(revenue)} hint="Current view total" tone="green" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Orders</h2>
            <p className="text-sm text-muted">Live order status and value from backend orders.</p>
          </div>
          {error ? <Button onClick={() => void loadOrders()}>Retry</Button> : null}
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading orders...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {actionError ? <p className="mb-3 text-sm font-bold text-error">{actionError}</p> : null}
        {!isLoading && !error && items.length === 0 ? <p className="text-sm font-bold text-muted">No orders found.</p> : null}

        {!isLoading && !error && items.length > 0 ? (
          <Table headers={["Order", "Retailer", "Items", "Placed", "Total", "Priority", "Status", "Update"]}>
            {items.map((item) => {
              const nextStatuses = orderTransitions[item.status] ?? [];
              return (
                <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                  <Cell strong>{item.orderNo}</Cell>
                  <Cell>{item.retailer.pharmacyName}</Cell>
                  <Cell>{formatCount(item.items.length)}</Cell>
                  <Cell>{formatDate(item.placedAt)}</Cell>
                  <Cell>{formatCurrency(item.totalAmount)}</Cell>
                  <Cell>{statusLabel(item.priority)}</Cell>
                  <Cell>
                    <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
                  </Cell>
                  <Cell>
                    <div className="flex min-w-48 items-center gap-2">
                      <select
                        className="h-10 rounded-lg border border-border bg-white px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        value={draftStatuses[item.id] ?? ""}
                        onChange={(event) =>
                          setDraftStatuses((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                        disabled={updatingId === item.id || nextStatuses.length === 0}
                      >
                        <option value="">{nextStatuses.length === 0 ? "Final" : "Next status"}</option>
                        {nextStatuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        onClick={() => void handleOrderStatusUpdate(item)}
                        disabled={updatingId === item.id || !draftStatuses[item.id]}
                      >
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
