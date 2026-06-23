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
  const [page, setPage] = useState(1);

  const loadOrders = useCallback(async (nextPage = page) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operationsService.getOrders(nextPage, 10);
      setItems(result.items);
      setMeta(result.meta);
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : "Unable to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrders(page);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOrders, page]);

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
          {error ? <Button onClick={() => void loadOrders(page)}>Retry</Button> : null}
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading orders...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {!isLoading && !error && items.length === 0 ? <p className="text-sm font-bold text-muted">No orders found.</p> : null}

        {!isLoading && !error && items.length > 0 ? (
          <Table headers={["Order", "Retailer", "Items", "Placed", "Total"]}>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                <Cell strong>{item.orderNo}</Cell>
                <Cell>{item.retailer.pharmacyName}</Cell>
                <Cell>{formatCount(item.items.length)}</Cell>
                <Cell>{formatDate(item.placedAt)}</Cell>
                <Cell>{formatCurrency(item.totalAmount)}</Cell>
              </tr>
            ))}
          </Table>
        ) : null}
        {!isLoading && !error && items.length > 0 ? (
          <p className="mt-4 border-t border-border pt-4 text-sm font-bold text-muted">
            Average order value: {formatCurrency(averageOrderValue)}
          </p>
        ) : null}
        {!isLoading && !error && items.length > 0 ? (
          <Pagination
            page={meta.page ?? page}
            totalPages={meta.totalPages ?? 1}
            totalItems={meta.total ?? items.length}
            onPageChange={setPage}
          />
        ) : null}
      </Card>
    </section>
  );
}

function Pagination({ page, totalPages, totalItems, onPageChange }: { page: number; totalPages: number; totalItems: number; onPageChange: (page: number) => void }) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-muted">
        {formatCount(totalItems)} orders · Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button type="button" variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
