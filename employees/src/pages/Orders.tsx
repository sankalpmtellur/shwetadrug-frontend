import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ClipboardCheck, Download, MapPin, PackageSearch, RefreshCcw, Store } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { getApiErrorMessage, orderService, type EmployeeOrder } from "../services/orderService";

export default function Orders() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<EmployeeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<EmployeeOrder | null>(null);
  const [detailsLoadingId, setDetailsLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  async function loadOrders() {
    setIsLoading(true);
    setError("");

    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    orderService
      .getOrders()
      .then((data) => {
        if (isMounted) setOrders(data);
      })
      .catch((loadError) => {
        if (isMounted) setError(getApiErrorMessage(loadError));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleOrders = useMemo(
    () => {
      const filtered = orders.filter((order) => {
        const search = query.trim().toLowerCase();
        if (!search) return true;
        const area = order.deliveryAddress?.city ?? "";
        return [order.orderNo, order.retailer.pharmacyName, area].some((value) => value.toLowerCase().includes(search));
      });

      return filtered.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
    },
    [orders, query],
  );
  const totalPages = Math.max(1, Math.ceil(visibleOrders.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = visibleOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalItems = visibleOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  async function showDetails(order: EmployeeOrder) {
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null);
      return;
    }

    setDetailsLoadingId(order.id);

    try {
      const details = await orderService.getOrderById(order.id);
      setSelectedOrder(details);
    } catch (detailsError) {
      setMessage({ tone: "error", text: getApiErrorMessage(detailsError) });
    } finally {
      setDetailsLoadingId(null);
    }
  }

  async function downloadInvoice(order: EmployeeOrder) {
    setDownloadingInvoiceId(order.id);

    try {
      const blob = await orderService.downloadInvoicePdf(order.id);
      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `${order.orderNo}-invoice.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileUrl);
      setMessage({ tone: "success", text: `Invoice downloaded for ${order.orderNo}.` });
    } catch (downloadError) {
      setMessage({ tone: "error", text: getApiErrorMessage(downloadError) });
    } finally {
      setDownloadingInvoiceId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy md:text-3xl">Retailer Orders</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">Check who has ordered, where the order is from, and how many items need to be prepared.</p>
      </div>

      {message ? (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-semibold ${message.tone === "success" ? "bg-emerald-50 text-success" : "bg-red-50 text-error"
            }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<ClipboardCheck />} label="Orders" value={String(visibleOrders.length)} tone="text-primary" />
        <Metric icon={<PackageSearch />} label="Items To Prepare" value={String(totalItems)} tone="text-warning" />
        <Metric icon={<Store />} label="Retailers" value={String(new Set(visibleOrders.map((order) => order.retailer.id)).size)} tone="text-success" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy">Order List</h2>
            <p className="text-sm text-muted">Search by order number, retailer, or area.</p>
          </div>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 sm:w-72"
            placeholder="Search orders..."
          />
        </div>

        {isLoading ? <p className="py-8 text-center text-sm font-semibold text-muted">Loading orders...</p> : null}

        {error ? (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-error">{error}</p>
            <Button className="gap-2" onClick={() => void loadOrders()} variant="secondary">
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : null}

        {!isLoading && !error ? (
          <div className="md:hidden">
            <div className="grid gap-3">
              {pageOrders.map((order) => {
                const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                return (
                  <div key={order.id} className="rounded-lg border border-border bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-primary">{order.orderNo}</p>
                        <p className="mt-1 text-sm font-bold text-navy">{order.retailer.pharmacyName}</p>
                      </div>
                      <p className="text-right text-sm font-black text-navy">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted">
                      <span>{formatArea(order)}</span>
                      <span className="text-right">{itemCount} items</span>
                      <span className="col-span-2">{formatDateTime(order.placedAt)}</span>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <Button className="h-9 px-3" disabled={detailsLoadingId === order.id} onClick={() => void showDetails(order)} variant="secondary">
                        {selectedOrder?.id === order.id ? "Hide" : detailsLoadingId === order.id ? "Loading..." : "Details"}
                      </Button>
                      <Button className="h-9 gap-2 px-3" disabled={downloadingInvoiceId === order.id} onClick={() => void downloadInvoice(order)} variant="secondary">
                        <Download className="h-4 w-4" />
                        {downloadingInvoiceId === order.id ? "Downloading..." : "Download Invoice"}
                      </Button>
                    </div>
                    {selectedOrder?.id === order.id ? <OrderDetails order={selectedOrder} /> : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {!isLoading && !error ? (
          <div className="hidden md:block">
          <Table headers={["Order", "Retailer", "Area", "Received", "Items", "Value", "Actions"]}>
            {pageOrders.map((order) => {
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <Fragment key={order.id}>
                  <tr className="border-t border-border hover:bg-surface-soft/70">
                    <Cell strong>{order.orderNo}</Cell>
                    <Cell>{order.retailer.pharmacyName}</Cell>
                    <Cell>{formatArea(order)}</Cell>
                    <Cell>{formatDateTime(order.placedAt)}</Cell>
                    <Cell>{itemCount}</Cell>
                    <Cell>{formatCurrency(order.totalAmount)}</Cell>
                    <Cell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="h-9 px-3"
                          disabled={detailsLoadingId === order.id}
                          onClick={() => void showDetails(order)}
                          variant="secondary"
                        >
                          {selectedOrder?.id === order.id ? "Hide" : detailsLoadingId === order.id ? "Loading..." : "Details"}
                        </Button>
                        <Button
                          className="h-9 gap-2 px-3"
                          disabled={downloadingInvoiceId === order.id}
                          onClick={() => void downloadInvoice(order)}
                          variant="secondary"
                        >
                          <Download className="h-4 w-4" />
                          {downloadingInvoiceId === order.id ? "Downloading..." : "Download Invoice"}
                        </Button>
                      </div>
                    </Cell>
                  </tr>
                  {selectedOrder?.id === order.id ? (
                    <tr className="border-t border-border bg-surface-soft/60">
                      <td colSpan={7} className="px-4 py-4">
                        <OrderDetails order={selectedOrder} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </Table>
          </div>
        ) : null}
        {!isLoading && !error && visibleOrders.length === 0 ? <p className="py-8 text-center text-sm text-muted">No orders match your search.</p> : null}
        {!isLoading && !error && visibleOrders.length > 0 ? (
          <Pagination page={currentPage} totalPages={totalPages} totalItems={visibleOrders.length} onPageChange={setPage} />
        ) : null}
      </Card>
    </section>
  );
}

function formatArea(order: EmployeeOrder) {
  return order.deliveryAddress?.city ?? order.deliveryAddress?.state ?? "Not available";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function OrderDetails({ order }: { order: EmployeeOrder }) {
  const subtotal = order.items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <div className="mt-4 grid gap-4 rounded-lg border border-border bg-white p-4 lg:grid-cols-[1.3fr_.9fr]">
      <div className="min-w-0">
        <p className="text-sm font-black uppercase tracking-widest text-muted">Order Items</p>
        <div className="mt-3 grid gap-2">
          {order.items.map((item) => (
            <div key={item.id} className="grid gap-2 rounded-lg bg-surface-soft p-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <p className="break-words font-bold text-navy">{item.medicineName}</p>
                <p className="text-muted">{item.quantity} units · {item.sku}</p>
              </div>
              <p className="font-black text-primary">{formatCurrency(item.lineTotal)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-lg bg-surface-soft p-3">
          <p className="text-sm font-black text-navy">Retailer</p>
          <p className="mt-1 text-sm font-semibold text-muted">{order.retailer.pharmacyName}</p>
          <p className="text-sm text-muted">{order.retailer.ownerName}</p>
        </div>
        <div className="rounded-lg bg-surface-soft p-3">
          <div className="flex items-center gap-2 text-sm font-black text-navy">
            <MapPin className="h-4 w-4 text-primary" />
            Delivery Address
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            {order.deliveryAddress
              ? [order.deliveryAddress.line1, order.deliveryAddress.line2, order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.pincode]
                .filter(Boolean)
                .join(", ")
              : "No delivery address attached."}
          </p>
        </div>
        <div className="rounded-lg bg-primary px-4 py-3 text-white">
          <div className="flex justify-between gap-3 text-sm">
            <span>Items total</span>
            <span className="font-black">{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between gap-3 text-base font-black">
            <span>Order value</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, totalItems, onPageChange }: { page: number; totalPages: number; totalItems: number; onPageChange: (page: number) => void }) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-muted">{totalItems} orders · Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <Button className="h-9 gap-2 px-3" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button className="h-9 gap-2 px-3" variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
