import { Link } from "react-router-dom";
import { CheckCircle2, FileText, Truck } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { getCreatedOrder } from "../services/orderService";
import { currency } from "../utils/formatters";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OrderConfirmed() {
  const order = getCreatedOrder();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl py-10 text-center">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-success"><CheckCircle2 className="h-10 w-10" /></div>
        <h1 className="text-3xl font-black text-navy">Order Confirmed</h1>
        <p className="mt-2 text-muted">
          {order
            ? `Your order ${order.orderNo || order.id} has been received and is now queued for warehouse processing.`
            : "Order placed successfully. You can view it in Order History."}
        </p>
        {order ? (
          <Card className="mt-8 p-5 text-left">
            <div className="grid gap-3 sm:grid-cols-3">
              <Fact label="Order Number" value={order.orderNo || order.id} />
              <Fact label="Date" value={formatDate(order.createdAt)} />
              <Fact label="Total" value={currency(order.totalAmount)} />
            </div>
            {order.items.length ? (
              <div className="mt-5 overflow-hidden rounded-lg border border-border">
                <div className="hidden grid-cols-[minmax(0,1fr)_84px_92px_104px] gap-3 bg-surface-soft px-4 py-3 text-xs font-black uppercase tracking-widest text-muted sm:grid">
                  <span>Medicine</span>
                  <span>Batch</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Amount</span>
                </div>
                <div className="divide-y divide-border">
                  {order.items.map((item) => (
                    <div key={`${item.medicineId}-${item.sku}`} className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_84px_92px_104px] sm:items-center">
                      <div className="min-w-0">
                        <p className="break-words font-black text-navy">{item.name}</p>
                        <p className="mt-1 text-xs font-semibold text-muted">{item.pack}</p>
                      </div>
                      <p className="text-sm font-semibold text-muted">{item.sku}</p>
                      <p className="text-sm font-black text-navy sm:text-right">Qty {item.qty}</p>
                      <p className="font-black text-primary sm:text-right">{currency(item.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        ) : null}
        <Card className="mt-5 grid gap-4 p-5 text-left sm:grid-cols-2">
          <p className="flex gap-3 text-sm text-muted"><FileText className="h-5 w-5 text-primary" /> Order details are available in Order History.</p>
          <p className="flex gap-3 text-sm text-muted"><Truck className="h-5 w-5 text-primary" /> Our team will confirm dispatch and delivery details shortly.</p>
        </Card>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/orders"><Button>View order history</Button></Link>
          <Link to="/dashboard"><Button variant="secondary">Continue ordering</Button></Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-soft px-3 py-2.5">
      <p className="text-xs font-black uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-navy">{value}</p>
    </div>
  );
}
