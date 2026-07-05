import { Link } from "react-router-dom";
import { CheckCircle2, FileText, Truck } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { getCreatedOrder } from "../services/orderService";

export default function OrderConfirmed() {
  const order = getCreatedOrder();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl py-10 text-center">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-success"><CheckCircle2 className="h-10 w-10" /></div>
        <h1 className="text-3xl font-black text-navy">Order Confirmed</h1>
        <p className="mt-2 text-muted">
          {order
            ? `Your order ${order.orderNo || order.id} has been received and is now queued for warehouse processing.`
            : "Order placed successfully. You can view it in Order History."}
        </p>
        <Card className="mt-8 grid gap-4 p-5 text-left sm:grid-cols-2">
          <p className="flex gap-3 text-sm text-muted"><FileText className="h-5 w-5 text-primary" /> GST invoice is available in Order History for download.</p>
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
