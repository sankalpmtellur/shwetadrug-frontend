import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, FileText, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { PageWrapper } from "../components/layout/PageWrapper";
import { useCart } from "../hooks/useCart";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { currency } from "../utils/formatters";
import { orderService } from "../services/orderService";
import type { CartItem, OrderInvoice, RetailerOrder } from "../types";

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
  const [invoice, setInvoice] = useState<OrderInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [isSharingInvoice, setIsSharingInvoice] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { reorderItems } = useCart();
  const selectedOrder = orders.find((order) => order.id === selectedOrderId);
  const pageSize = useResponsivePageSize();
  const [paging, setPaging] = useState({ pageSize, count: pageSize });
  const visibleCount = paging.pageSize === pageSize ? paging.count : pageSize;
  const visibleOrders = useMemo(() => orders.slice(0, visibleCount), [orders, visibleCount]);
  const canLoadMore = visibleCount < orders.length;

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
    const timeoutId = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(timeoutId);
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

  const downloadInvoice = async () => {
    if (!selectedOrder) return;

    setIsDownloadingInvoice(true);
    try {
      const blob = await orderService.downloadOrderInvoicePdf(selectedOrder.id);
      saveInvoiceBlob(blob, selectedOrder);
      toast.success("Invoice PDF downloaded.");
    } catch (error) {
      toast.error(getInvoiceErrorMessage(error, "Could not download invoice PDF."));
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const shareInvoice = async () => {
    if (!selectedOrder) return;

    setIsSharingInvoice(true);
    try {
      const blob = await orderService.downloadOrderInvoicePdf(selectedOrder.id);
      const invoiceNo = invoice?.invoice.invoiceNo ?? selectedOrder.invoice?.invoiceNo ?? selectedOrder.orderNo;
      const file = new File([blob], getInvoiceFileName(selectedOrder), { type: "application/pdf" });
      const shareData: ShareData = {
        files: [file],
        title: `Invoice ${invoiceNo}`,
        text: `Invoice ${invoiceNo} for ${currency(selectedOrder.totalAmount)}`,
      };

      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }

      saveInvoiceBlob(blob, selectedOrder);
      toast.success("Invoice PDF downloaded. Share it from your device.");
    } catch (error) {
      toast.error(getInvoiceErrorMessage(error, "Could not share invoice PDF."));
    } finally {
      setIsSharingInvoice(false);
    }
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
                      {formatDate(order.placedAt)}
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
            <Button type="button" variant="secondary" className="min-w-48" onClick={() => setPaging({ pageSize, count: visibleCount + pageSize })}>
              Load More
            </Button>
          </div>
        ) : null}

        <Modal
          open={Boolean(selectedOrder)}
          title="Invoice Preview"
          onClose={() => setSelectedOrderId(null)}
        >
          {selectedOrder ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-surface-soft p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-muted">Order Number</p>
                      <h3 className="mt-1 text-xl font-black text-navy">{selectedOrder.orderNo}</h3>
                      <p className="mt-1 text-sm font-semibold text-muted">{formatDate(selectedOrder.placedAt)} · {selectedOrder.items.length} items</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white px-4 py-3 text-left sm:text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-muted">Invoice</p>
                    <p className="mt-1 font-black text-primary">{invoice?.invoice.invoiceNo ?? selectedOrder.invoice?.invoiceNo ?? "Loading..."}</p>
                    <p className="mt-1 text-xs font-semibold text-muted">{invoice?.invoice.status ?? selectedOrder.invoice?.status ?? selectedOrder.status}</p>
                  </div>
                </div>
              </div>

              {isInvoiceLoading ? <p className="rounded-lg bg-surface-soft px-4 py-3 text-sm font-semibold text-muted">Loading invoice details...</p> : null}

              <div className="overflow-hidden rounded-lg border border-border">
                <div className="hidden grid-cols-[minmax(0,1fr)_80px_110px] gap-3 bg-surface-soft px-4 py-3 text-xs font-black uppercase tracking-widest text-muted sm:grid">
                  <span>Medicine</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Amount</span>
                </div>
                <div className="divide-y divide-border">
                {(invoice?.items ?? selectedOrder.items).map((item) => {
                  const name = "medicine" in item ? item.medicine.name : item.medicineName;
                  const sku = "medicine" in item ? item.medicine.sku : item.sku;
                  const quantity = "medicine" in item ? item.quantity : item.quantity;
                  const price = "medicine" in item ? item.lineTotal : item.lineTotal;

                  return (
                    <div key={item.id} className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_80px_110px] sm:items-center sm:gap-3">
                      <div className="min-w-0">
                        <p className="break-words font-bold leading-5 text-navy">{name}</p>
                        <p className="mt-1 text-xs font-semibold text-muted">SKU: {sku}</p>
                      </div>
                      <p className="text-sm font-black text-muted sm:text-right">Qty {quantity}</p>
                      <p className="font-black text-primary sm:text-right">{currency(price)}</p>
                    </div>
                  );
                })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_280px]">
                <div className="rounded-lg border border-border bg-surface-soft p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-muted">Payment Status</p>
                  <p className="mt-2 text-sm font-bold text-navy">{selectedOrder.status.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-muted">Download the official invoice PDF for tax and accounting records.</p>
                </div>
                <div className="rounded-lg border border-primary/20 bg-white p-4">
                  <SummaryRow label="Subtotal" value={currency(invoice?.order.subtotal ?? selectedOrder.totalAmount)} />
                  <SummaryRow label="GST" value={currency(invoice?.order.gstAmount ?? 0)} />
                  <div className="mt-3 border-t border-border pt-3">
                    <SummaryRow label="Total" value={currency(invoice?.order.totalAmount ?? selectedOrder.totalAmount)} strong />
                  </div>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="secondary" onClick={downloadInvoice} disabled={isDownloadingInvoice || isSharingInvoice}>
                  <Download className="h-4 w-4" />
                  {isDownloadingInvoice ? "Downloading..." : "Download Invoice"}
                </Button>
                <Button type="button" onClick={shareInvoice} disabled={isDownloadingInvoice || isSharingInvoice}>
                  <Share2 className="h-4 w-4" />
                  {isSharingInvoice ? "Preparing..." : "Share PDF"}
                </Button>
              </div>
            </div>
          ) : null}
        </Modal>
      </PageWrapper>
    </DashboardLayout>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? "text-base font-black text-navy" : "text-sm font-semibold text-muted"}`}>
      <span>{label}</span>
      <span className={strong ? "text-primary" : "text-navy"}>{value}</span>
    </div>
  );
}

function saveInvoiceBlob(blob: Blob, order: RetailerOrder) {
  const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = getInvoiceFileName(order);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getInvoiceFileName(order: RetailerOrder) {
  return `${order.orderNo}-invoice.pdf`.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getInvoiceErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
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
