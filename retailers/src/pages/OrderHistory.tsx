import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { PageWrapper } from "../components/layout/PageWrapper";
import { useCart } from "../hooks/useCart";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { currency } from "../utils/formatters";
import { orderService } from "../services/orderService";
import type { BackendOrderStatus, CartItem, OrderInvoice, RetailerOrder } from "../types";

const statusLabels: Record<BackendOrderStatus, "Processing" | "Dispatched" | "Delivered" | "Cancelled" | "Returned"> = {
  PENDING: "Processing",
  VERIFIED: "Processing",
  PICKING: "Processing",
  PACKED: "Processing",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OrderHistory() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<RetailerOrder[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [invoice, setInvoice] = useState<OrderInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { reorderItems } = useCart();
  const selectedOrder = orders.find((order) => order.id === selectedOrderId);
  const pageSize = useResponsivePageSize();
  const visibleOrders = useMemo(() => orders.slice(0, visibleCount), [orders, visibleCount]);
  const canLoadMore = visibleCount < orders.length;

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize]);

  async function loadOrders() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const nextOrders = await orderService.getOrders();
      setOrders(nextOrders);
    } catch {
      setErrorMessage("Could not load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function openBill(orderId: string) {
    setSelectedOrderId(orderId);
    setInvoice(null);
    setIsInvoiceLoading(true);

    try {
      const nextInvoice = await orderService.getOrderInvoice(orderId);
      setInvoice(nextInvoice);
    } catch {
      toast.error("Could not load invoice details. Showing order details.");
    } finally {
      setIsInvoiceLoading(false);
    }
  }

  const buildReorderItems = (order: RetailerOrder): CartItem[] => {
    return order.items
      .filter((item) => item.medicineId && item.quantity > 0)
      .map((item) => ({
        medicineId: item.medicineId,
        name: item.medicineName,
        sku: item.sku,
        qty: item.quantity,
        pack: item.packSize,
        unitPrice: item.unitPrice,
        amount: item.unitPrice * item.quantity,
        status: "In Stock",
      }));
  };

  const downloadInvoice = () => {
    if (!selectedOrder) return;
    const items = invoice?.items.map((item) => ({
      name: item.medicine.name,
      qty: item.quantity,
      price: item.lineTotal,
    })) ?? selectedOrder.items.map((item) => ({
      name: item.medicineName,
      qty: item.quantity,
      price: item.lineTotal,
    }));
    const lines = items
      .map((item) => `${item.name} | Qty: ${item.qty} | Price: ${currency(item.price)}`)
      .join("\n");
    const invoiceNo = invoice?.invoice.invoiceNo ?? selectedOrder.invoice?.invoiceNo ?? selectedOrder.orderNo;
    const content = `Invoice ${invoiceNo}\nDate: ${formatDate(selectedOrder.placedAt)}\n\n${lines}\n\nTotal: ${currency(selectedOrder.totalAmount)}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedOrder.orderNo}-invoice.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareInvoice = () => {
    if (!selectedOrder) return;
    const message = encodeURIComponent(
      `Invoice ${invoice?.invoice.invoiceNo ?? selectedOrder.invoice?.invoiceNo ?? selectedOrder.orderNo} (${formatDate(selectedOrder.placedAt)}) total ${currency(selectedOrder.totalAmount)}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
  };

  function handleReorder(order: RetailerOrder) {
    const nextItems = buildReorderItems(order);
    if (!nextItems.length) {
      toast.error("Reorder is not available for this order yet.");
      return;
    }

    reorderItems(nextItems);
    toast.success("Order items added to cart");
  }

  return (
    <DashboardLayout>
      <PageWrapper title="Order History">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-error">
            <p>{errorMessage}</p>
            <Button type="button" className="mt-3" onClick={loadOrders}>
              Retry
            </Button>
          </div>
        ) : null}

        {!isLoading && !errorMessage && orders.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-black text-navy">No orders yet</h2>
            <p className="mt-2 text-sm text-muted">No orders yet. Start by adding medicines to your cart.</p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && orders.length ? (
          <div className="grid gap-3">
            {visibleOrders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">
                      {formatDate(order.placedAt)} · {statusLabels[order.status]}
                    </p>
                    <h2 className="mt-1 text-lg font-black text-primary">{order.orderNo}</h2>
                    <p className="mt-1 text-sm font-semibold text-muted">
                      {order.items.length} items · {currency(order.totalAmount)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="secondary"
                      className="rounded-xl"
                      onClick={() => openBill(order.id)}
                    >
                      View Bill
                    </Button>
                    <Button
                      type="button"
                      className="rounded-xl"
                      onClick={() => handleReorder(order)}
                    >
                      Reorder
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        {!isLoading && !errorMessage && canLoadMore ? (
          <div className="flex justify-center">
            <Button type="button" variant="secondary" className="min-w-48" onClick={() => setVisibleCount((current) => current + pageSize)}>
              Load More
            </Button>
          </div>
        ) : null}

        <Modal
          open={Boolean(selectedOrder)}
          title={selectedOrder ? `Bill ${selectedOrder.orderNo}` : "Bill"}
          onClose={() => setSelectedOrderId(null)}
        >
          {selectedOrder ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-surface-soft p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted">
                  Order Date
                </p>
                <p className="mt-1 font-black text-navy">{formatDate(selectedOrder.placedAt)}</p>
                <p className="mt-1 text-sm font-semibold text-muted">
                  Status: {statusLabels[selectedOrder.status]}
                </p>
              </div>

              <div className="divide-y divide-border rounded-xl border border-border">
                {(invoice?.items ?? selectedOrder.items).map((item) => {
                  const name = "medicine" in item ? item.medicine.name : item.medicineName;
                  const quantity = "medicine" in item ? item.quantity : item.quantity;
                  const price = "medicine" in item ? item.lineTotal : item.lineTotal;

                  return <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 p-4">
                    <div>
                      <p className="font-bold text-navy">{name}</p>
                      <p className="text-sm text-muted">Quantity: {quantity}</p>
                    </div>
                    <p className="font-black text-primary">{currency(price)}</p>
                  </div>;
                })}
              </div>

              {isInvoiceLoading ? <p className="text-sm font-semibold text-muted">Loading invoice details...</p> : null}

              <div className="flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-white">
                <span className="font-bold">Total</span>
                <span className="text-lg font-black">{currency(invoice?.order.totalAmount ?? selectedOrder.totalAmount)}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="secondary" onClick={downloadInvoice}>
                  Download Invoice
                </Button>
                <Button type="button" onClick={shareInvoice}>
                  Share on WhatsApp
                </Button>
              </div>
            </div>
          ) : null}
        </Modal>
      </PageWrapper>
    </DashboardLayout>
  );
}

function useResponsivePageSize() {
  const [pageSize, setPageSize] = useState(() => (typeof window === "undefined" || window.innerWidth < 1024 ? 10 : 20));

  useEffect(() => {
    function updatePageSize() {
      setPageSize(window.innerWidth < 1024 ? 10 : 20);
    }

    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  return pageSize;
}
