import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { PageWrapper } from "../components/layout/PageWrapper";
import { currency } from "../utils/formatters";
import { useCart } from "../hooks/useCart";
import { orderService, saveCreatedOrder } from "../services/orderService";
import { formatDefaultAddress, profileService } from "../services/profileService";
import type { DefaultAddress } from "../types";

export default function Checkout() {
  const { clearCart, items, removeItem, setItemQuantity, subtotal } = useCart();
  const [defaultAddress, setDefaultAddress] = useState<DefaultAddress | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const navigate = useNavigate();
  const gst = Math.round(subtotal * 0.12);
  const hasDeliveryAddress = Boolean(defaultAddress?.id);
  const deliveryAddressText = hasDeliveryAddress
    ? formatDefaultAddress(defaultAddress)
    : "Please update your delivery address in Profile before placing an order.";
  const deliveryAddressId = defaultAddress?.id;

  useEffect(() => {
    async function loadAddress() {
      try {
        const profile = await profileService.getProfile();
        setDefaultAddress(profile.retailer?.defaultAddress ?? null);
      } catch {
        setDefaultAddress(null);
      }
    }

    void loadAddress();
  }, []);

  async function confirmOrder() {
    if (!items.length || isCreatingOrder) return;
    if (!hasDeliveryAddress) {
      toast.error("Please update your delivery address in Profile before placing an order.");
      return;
    }

    setIsCreatingOrder(true);

    try {
      const order = await orderService.createOrder(items, deliveryAddressId);
      saveCreatedOrder(order);
      try {
        await clearCart();
      } catch {
        toast.error("Order placed, but cart could not be cleared. Please refresh and clear the cart before ordering again.");
        return;
      }
      toast.success("Order placed successfully");
      navigate("/confirmed");
    } catch {
      toast.error("Could not place order. Please try again.");
    } finally {
      setIsCreatingOrder(false);
    }
  }

  return (
    <DashboardLayout>
      <PageWrapper title="Checkout">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to inventory
        </Link>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-surface-strong text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-navy">Delivery Address</h2>
                  <p className="text-sm font-semibold text-muted">This address will be used for dispatch.</p>
                </div>
              </div>
              <div className={`rounded-lg border p-4 ${hasDeliveryAddress ? "border-primary bg-surface-soft" : "border-red-100 bg-red-50"}`}>
                <p className="font-black text-navy">Default Address</p>
                <p className="mt-1 text-sm font-semibold text-muted">{deliveryAddressText}</p>
                {!hasDeliveryAddress ? (
                  <Link to="/profile" className="mt-3 inline-flex text-sm font-black text-primary">
                    Update address
                  </Link>
                ) : null}
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-surface-soft p-5">
                <h2 className="font-bold text-navy">Review Items ({items.length})</h2>
                <Link className="text-sm font-semibold text-primary" to="/dashboard">Edit cart</Link>
              </div>
              {items.length ? (
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <div key={item.sku} className="grid gap-4 p-4 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center sm:p-5">
                      <div className="grid h-14 w-14 place-items-center rounded-lg bg-surface-strong text-primary"><CheckCircle2 className="h-6 w-6" /></div>
                      <div className="min-w-0">
                        <h3 className="break-words font-semibold text-navy">{item.name}</h3>
                        <p className="break-words text-sm text-muted">SKU: {item.sku} | {item.pack}</p>
                        <Badge className="mt-2" tone={item.status === "Limited" ? "orange" : "green"}>{item.qty} units</Badge>
                      </div>
                      <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
                        <p className="text-lg font-bold text-navy sm:mr-2">{currency(item.amount)}</p>
                        <div className="flex overflow-hidden rounded-lg border border-border bg-white">
                          <button type="button" onClick={() => setItemQuantity(item.medicineId, item.qty - 1)} className="grid h-9 w-9 place-items-center text-muted" aria-label={`Decrease ${item.name}`}>
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="grid h-9 min-w-10 place-items-center border-x border-border px-2 text-sm font-black text-navy">{item.qty}</span>
                          <button type="button" onClick={() => setItemQuantity(item.medicineId, item.qty + 1)} className="grid h-9 w-9 place-items-center text-muted" aria-label={`Increase ${item.name}`}>
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button type="button" onClick={() => removeItem(item.medicineId)} className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-error" aria-label={`Remove ${item.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <h3 className="text-xl font-black text-navy">Your cart is empty</h3>
                  <p className="mt-2 text-sm text-muted">Add medicines from the dashboard to continue checkout.</p>
                </div>
              )}
            </Card>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="p-5">
              <h2 className="mb-4 font-bold text-navy">Order Summary</h2>
              <SummaryRow label="Subtotal" value={currency(subtotal)} />
              <SummaryRow label="GST Estimate" value={currency(gst)} />
              <SummaryRow label="Delivery" value="Free" />
              <div className="my-4 border-t border-border" />
              <SummaryRow label="Payable Amount" value={currency(subtotal + gst)} strong />
              <Button className="mt-5 h-12 w-full" disabled={!items.length || !hasDeliveryAddress || isCreatingOrder} onClick={confirmOrder}>
                {isCreatingOrder ? "Placing order..." : "Confirm Order"}
              </Button>
            </Card>
          </aside>
        </div>
      </PageWrapper>
    </DashboardLayout>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex justify-between gap-4 py-2 ${strong ? "text-lg font-bold text-navy" : "text-sm text-muted"}`}><span>{label}</span><span className="text-right">{value}</span></div>;
}
