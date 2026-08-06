import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Clock, IndianRupee, Search, ShoppingBag } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { operationsService } from "../services/operationsService";
import type { Order } from "../services/operationsService";
import type { ListMeta } from "../lib/api";
import { formatCount, formatCurrency, formatDate } from "../utils/formatters";

function searchMatches(item: Order, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [item.orderNo, item.retailer.pharmacyName, item.retailer.ownerName, item.status, item.priority, ...item.items.map((orderItem) => orderItem.medicineName)]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalized));
}

export default function Orders() {
  const [items, setItems] = useState<Order[]>([]);
  const [meta, setMeta] = useState<ListMeta>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, Order>>({});
  const [detailError, setDetailError] = useState<string | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

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
  const filteredItems = useMemo(() => items.filter((item) => searchMatches(item, search)), [items, search]);

  async function handleToggleDetails(item: Order) {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(item.id);
    setDetailError(null);

    if (details[item.id]) {
      return;
    }

    setLoadingDetailId(item.id);

    try {
      const detail = await operationsService.getOrder(item.id);
      setDetails((current) => ({ ...current, [item.id]: detail }));
    } catch (orderError) {
      setDetailError(orderError instanceof Error ? orderError.message : "Unable to load order details");
    } finally {
      setLoadingDetailId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<ShoppingBag />} label="Orders" value={formatCount(meta.total ?? items.length)} hint="Backend order records" tone="blue" />
        <Metric icon={<Clock />} label="Loaded" value={formatCount(items.length)} hint="Orders in current view" tone="orange" />
        <Metric icon={<IndianRupee />} label="Loaded Value" value={formatCurrency(revenue)} hint="Current view total" tone="green" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Orders</h2>
            <p className="text-sm text-muted">Read-only order value and retailer demand from backend orders.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders"
              />
            </label>
            {error ? <Button onClick={() => void loadOrders(page)}>Retry</Button> : null}
          </div>
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading orders...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {detailError ? <p className="mb-3 text-sm font-bold text-error">{detailError}</p> : null}
        {!isLoading && !error && filteredItems.length === 0 ? <p className="text-sm font-bold text-muted">No orders found.</p> : null}

        {!isLoading && !error && filteredItems.length > 0 ? (
          <Table headers={["Order", "Retailer", "Items", "Status", "Placed", "Total", "Actions"]}>
            {filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              const detail = details[item.id] ?? item;

              return (
                <Fragment key={item.id}>
                  <tr className="border-t border-border hover:bg-surface-soft/70">
                    <Cell strong>{item.orderNo}</Cell>
                    <Cell>{item.retailer.pharmacyName}</Cell>
                    <Cell>{formatCount(item.items.length)}</Cell>
                    <Cell>{item.status.replaceAll("_", " ")}</Cell>
                    <Cell>{formatDate(item.placedAt)}</Cell>
                    <Cell>{formatCurrency(item.totalAmount)}</Cell>
                    <Cell>
                      <Button className="h-9 px-3" variant="secondary" onClick={() => void handleToggleDetails(item)} disabled={loadingDetailId === item.id}>
                        {loadingDetailId === item.id ? "Loading..." : isExpanded ? "Hide Details" : "View Details"}
                      </Button>
                    </Cell>
                  </tr>
                  {isExpanded ? (
                    <tr className="border-t border-border bg-surface-soft/60">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                          <Detail label="Order Number" value={detail.orderNo} />
                          <Detail label="Retailer" value={detail.retailer.pharmacyName} />
                          <Detail label="Owner" value={detail.retailer.ownerName} />
                          <Detail label="Status" value={detail.status.replaceAll("_", " ")} />
                          <Detail label="Priority" value={detail.priority.replaceAll("_", " ")} />
                          <Detail label="Placed" value={formatDate(detail.placedAt)} />
                          <Detail label="Delivered" value={detail.deliveredAt ? formatDate(detail.deliveredAt) : "-"} />
                          <Detail label="Total" value={formatCurrency(detail.totalAmount)} />
                        </div>
                        <div className="mt-4 border-t border-border pt-4">
                          <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted">Items</p>
                          {detail.items.length > 0 ? (
                            <div className="grid gap-2">
                              {detail.items.map((orderItem) => (
                                <div key={orderItem.id} className="flex flex-col gap-1 rounded-lg bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                                  <span className="font-bold text-navy">{orderItem.medicineName}</span>
                                  <span className="text-sm font-bold text-muted">Qty {formatCount(orderItem.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm font-bold text-muted">No order items found.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </Table>
        ) : null}
        {!isLoading && !error && filteredItems.length > 0 ? (
          <p className="mt-4 border-t border-border pt-4 text-sm font-bold text-muted">
            Average order value: {formatCurrency(averageOrderValue)}
          </p>
        ) : null}
        {!isLoading && !error && filteredItems.length > 0 && !search.trim() ? (
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 break-words font-bold text-navy">{value}</p>
    </div>
  );
}

function Pagination({ page, totalPages, totalItems, onPageChange }: { page: number; totalPages: number; totalItems: number; onPageChange: (page: number) => void }) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-muted">
        {formatCount(totalItems)} orders · Page {page} of {totalPages}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button type="button" className="w-full sm:w-auto" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button type="button" className="w-full sm:w-auto" variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
