import { Fragment, useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Download, PackageSearch, RefreshCcw, Store } from "lucide-react";
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
    () =>
      orders.filter((order) => {
        const search = query.trim().toLowerCase();
        if (!search) return true;
        const area = order.deliveryAddress?.city ?? "";
        return [order.orderNo, order.retailer.pharmacyName, area].some((value) => value.toLowerCase().includes(search));
      }),
    [orders, query],
  );

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
            onChange={(event) => setQuery(event.target.value)}
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
          <Table headers={["Order", "Retailer", "Area", "Received", "Items", "Value", "Actions"]}>
            {visibleOrders.map((order) => {
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
        ) : null}
        {!isLoading && !error && visibleOrders.length === 0 ? <p className="py-8 text-center text-sm text-muted">No orders match your search.</p> : null}
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
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_.8fr]">
      <div>
        <p className="text-sm font-bold text-navy">Items</p>
        <div className="mt-2 grid gap-2">
          {order.items.map((item) => (
            <div key={item.id} className="rounded-lg bg-white p-3 text-sm">
              <p className="font-bold text-navy">{item.medicineName}</p>
              <p className="text-muted">
                {item.quantity} units · {item.sku} · {formatCurrency(item.lineTotal)}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-navy">Delivery Address</p>
        <p className="mt-2 text-sm text-muted">
          {order.deliveryAddress
            ? [order.deliveryAddress.line1, order.deliveryAddress.line2, order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.pincode]
              .filter(Boolean)
              .join(", ")
            : "No delivery address attached."}
        </p>
      </div>
    </div>
  );
}
