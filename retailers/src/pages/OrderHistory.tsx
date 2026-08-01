import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, X } from "lucide-react";
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
        stock: item.quantity,
        status: "In Stock",
      }));
  };

  function handleReorder(order: RetailerOrder) {
    const nextItems = buildReorderItems(order);
    if (!nextItems.length) {
      toast.error("Reorder is not available for this order yet.");
      return;
    }

    void reorderItems(nextItems);
    toast.success("Order items added to cart.");
  }

  function closeBill() {
    setSelectedOrderId(null);
    setInvoice(null);
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
              <div key={item} className="h-32 animate-pulse rounded-lg bg-white shadow-sm" />
            ))}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-sm font-semibold text-error">
            <p>{errorMessage}</p>
            <Button type="button" className="mt-3" onClick={() => void loadOrders()}>
              Retry
            </Button>
          </div>
        ) : null}

        {!isLoading && !errorMessage && orders.length === 0 ? (
          <div className="rounded-lg border border-border bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-black text-navy">No orders yet</h2>
            <p className="mt-2 text-sm text-muted">Start by adding medicines to your cart.</p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && orders.length ? (
          <div className="grid gap-3">
            {visibleOrders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-black text-primary">{order.orderNo}</h2>
                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                      <OrderFact label="Date" value={formatDate(order.placedAt)} />
                      <OrderFact label="Total" value={currency(order.totalAmount)} />
                      <OrderFact label="Status" value={order.status} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="secondary" onClick={() => void openBill(order.id)}>
                      View Details
                    </Button>
                    <Button type="button" onClick={() => handleReorder(order)}>
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

        <Modal open={Boolean(selectedOrder)} title="Order Details" onClose={closeBill}>
          {selectedOrder ? (
            <div className="space-y-4">
              <InvoiceHeader selectedOrder={selectedOrder} invoice={invoice} />

              {isInvoiceLoading ? <p className="rounded-lg bg-surface-soft px-4 py-3 text-sm font-semibold text-muted">Loading invoice details...</p> : null}

              <RetailerDetails selectedOrder={selectedOrder} invoice={invoice} />
              <InvoiceItems selectedOrder={selectedOrder} invoice={invoice} />
              <InvoiceTotals selectedOrder={selectedOrder} invoice={invoice} />

              <div className="sticky bottom-0 -mx-3 border-t border-border bg-white p-3 sm:-mx-4 sm:p-4">
                <Button type="button" variant="ghost" onClick={closeBill}>
                  <X className="h-4 w-4" />
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </Modal>
      </PageWrapper>
    </DashboardLayout>
  );
}

function OrderFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-soft px-3 py-2">
      <p className="text-[11px] font-black uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 break-words font-black text-navy">{value}</p>
    </div>
  );
}

function InvoiceHeader({ selectedOrder, invoice }: { selectedOrder: RetailerOrder; invoice: OrderInvoice | null }) {
  return (
    <div className="rounded-lg border border-border bg-surface-soft p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <BillFact label="Invoice number" value={invoice?.invoice.invoiceNo ?? selectedOrder.invoice?.invoiceNo ?? "Loading..."} />
          <BillFact label="Order number" value={selectedOrder.orderNo} />
          <BillFact label="Order date" value={formatDate(selectedOrder.placedAt)} />
          <BillFact label="Order status" value={invoice?.order.status ?? selectedOrder.status} />
        </div>
      </div>
    </div>
  );
}

function RetailerDetails({ selectedOrder, invoice }: { selectedOrder: RetailerOrder; invoice: OrderInvoice | null }) {
  const address = invoice?.retailer.addresses.find((item) => item.isDefault) ?? invoice?.retailer.addresses[0] ?? null;
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs font-black uppercase tracking-widest text-muted">Retailer details</p>
      <h3 className="mt-2 break-words text-base font-black text-navy">{invoice?.retailer.pharmacyName ?? "Retailer pharmacy"}</h3>
      <p className="mt-1 break-words text-sm font-semibold leading-6 text-muted">{formatInvoiceAddress(address)}</p>
      {invoice?.retailer.mobile ? <p className="mt-1 text-sm font-semibold text-muted">Phone: {invoice.retailer.mobile}</p> : null}
      {!invoice && <p className="mt-1 text-sm font-semibold text-muted">{selectedOrder.items.length} items in this order.</p>}
    </div>
  );
}

function InvoiceItems({ selectedOrder, invoice }: { selectedOrder: RetailerOrder; invoice: OrderInvoice | null }) {
  const rows = invoice?.items ?? selectedOrder.items;
  if (!rows.length) {
    return <p className="rounded-lg bg-surface-soft px-4 py-3 text-sm font-semibold text-muted">No invoice items available.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="hidden grid-cols-[minmax(0,1fr)_88px_52px_74px_52px_86px] gap-3 bg-surface-soft px-4 py-3 text-xs font-black uppercase tracking-widest text-muted md:grid">
        <span>Medicine</span>
        <span>Batch</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Rate</span>
        <span className="text-right">GST</span>
        <span className="text-right">Amount</span>
      </div>
      <div className="divide-y divide-border">
        {rows.map((item) => {
          const isInvoiceItem = "medicine" in item;
          const name = isInvoiceItem ? item.medicine.name : item.medicineName;
          const pack = isInvoiceItem ? item.medicine.packSize : item.packSize;
          const batch = isInvoiceItem ? item.batchNumber ?? "-" : "-";
          const quantity = item.quantity;
          const unitPrice = item.unitPrice;
          const gstPercent = isInvoiceItem ? item.gstPercent : 0;
          const amount = item.lineTotal;

          return (
            <div key={item.id} className="grid gap-2 p-4 md:grid-cols-[minmax(0,1fr)_88px_52px_74px_52px_86px] md:items-center md:gap-3">
              <div className="min-w-0">
                <p className="break-words font-bold leading-5 text-navy">{name}</p>
                <p className="mt-1 text-xs font-semibold text-muted">{pack}</p>
              </div>
              <p className="text-sm font-semibold text-muted">{batch}</p>
              <p className="text-sm font-black text-navy md:text-right">Qty {quantity}</p>
              <p className="text-sm font-semibold text-navy md:text-right">{currency(unitPrice)}</p>
              <p className="text-sm font-semibold text-navy md:text-right">{gstPercent}%</p>
              <p className="font-black text-primary md:text-right">{currency(amount)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InvoiceTotals({ selectedOrder, invoice }: { selectedOrder: RetailerOrder; invoice: OrderInvoice | null }) {
  const subtotal = invoice?.order.subtotal ?? selectedOrder.totalAmount;
  const gst = invoice?.order.gstAmount ?? 0;
  const delivery = invoice?.order.deliveryCharge ?? 0;
  const total = invoice?.order.totalAmount ?? selectedOrder.totalAmount;
  return (
    <div className="ml-auto max-w-sm rounded-lg border border-border bg-white p-4">
      <SummaryRow label="Subtotal" value={currency(subtotal)} />
      <SummaryRow label="Discount" value="-" />
      <SummaryRow label="GST" value={currency(gst)} />
      <SummaryRow label="Delivery" value={delivery ? currency(delivery) : "Free"} />
      <div className="mt-3 border-t border-border pt-3">
        <SummaryRow label="Grand total" value={currency(total)} strong />
      </div>
    </div>
  );
}

function BillFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-black uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-navy">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-1 ${strong ? "text-base font-black text-navy" : "text-sm font-semibold text-muted"}`}>
      <span>{label}</span>
      <span className={strong ? "text-primary" : "text-navy"}>{value}</span>
    </div>
  );
}

function formatInvoiceAddress(address?: { line1: string; line2: string | null; city: string; state: string; pincode: string } | null) {
  if (!address) return "Address not available.";
  return [address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(", ");
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
