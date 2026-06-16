import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Minus, Plus, Trash2 } from "lucide-react";
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
import type { DefaultAddress, PaymentMethod } from "../types";

export default function Checkout() {
  const { clearCart, items, removeItem, setItemQuantity, subtotal } = useCart();
  const [step, setStep] = useState(0);
  const [defaultAddress, setDefaultAddress] = useState<DefaultAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
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
      const order = await orderService.createOrder(items, paymentMethod, deliveryAddressId);
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
      <PageWrapper title="Review Your Order">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" /> Back to inventory</Link>
        <div className="grid gap-2 sm:grid-cols-3">
          {["Review Items", "Select Address", "Payment & Confirm"].map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={`rounded-xl px-4 py-3 text-sm font-black ${
                step === index ? "bg-primary text-white" : "bg-white text-muted"
              }`}
            >
              {index + 1}. {label}
            </button>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {step === 0 ? <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-surface-soft p-5">
              <h2 className="font-bold text-navy">Line Items ({items.length})</h2>
              <Link className="text-sm font-semibold text-primary" to="/dashboard">Edit cart</Link>
            </div>
            {items.length ? (
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div key={item.sku} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-surface-strong text-primary"><CheckCircle2 className="h-6 w-6" /></div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-navy">{item.name}</h3>
                      <p className="text-sm text-muted">SKU: {item.sku} · {item.pack}</p>
                      <Badge className="mt-2" tone={item.status === "Limited" ? "orange" : "green"}>{item.qty} units</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <p className="text-lg font-bold text-navy">{currency(item.amount)}</p>
                      <div className="flex overflow-hidden rounded-xl border border-border bg-white">
                        <button
                          type="button"
                          onClick={() => setItemQuantity(item.medicineId, item.qty - 1)}
                          className="grid h-9 w-9 place-items-center text-muted"
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="grid h-9 min-w-10 place-items-center border-x border-border px-2 text-sm font-black text-navy">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setItemQuantity(item.medicineId, item.qty + 1)}
                          className="grid h-9 w-9 place-items-center text-muted"
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.medicineId)}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-error"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
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
          </Card> : null}
          {step === 1 ? (
            <Card className="p-5">
              <h2 className="mb-4 text-xl font-black text-navy">Delivery Address</h2>
              <div className="rounded-xl border border-primary bg-surface-soft p-4">
                <p className="font-black text-navy">Default Address</p>
                <p className="mt-1 text-sm text-muted">{deliveryAddressText}</p>
              </div>
            </Card>
          ) : null}
          {step === 2 ? (
            <Card className="p-5">
              <h2 className="text-xl font-black text-navy">Payment Option</h2>
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3 rounded-xl border border-primary bg-surface-soft p-4">
                  <input
                    type="radio"
                    checked={paymentMethod === "UPI"}
                    onChange={() => setPaymentMethod("UPI")}
                    className="text-primary focus:ring-primary"
                  />
                  <span>
                    <span className="block font-black text-navy">UPI</span>
                    <span className="block text-sm text-muted">Pay using any UPI app after order confirmation.</span>
                  </span>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-border p-4">
                  <input
                    type="radio"
                    checked={paymentMethod === "CASH_ON_DELIVERY"}
                    onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                    className="text-primary focus:ring-primary"
                  />
                  <span>
                    <span className="block font-black text-navy">Cash on Delivery</span>
                    <span className="block text-sm text-muted">Pay cash when the order is delivered.</span>
                  </span>
                </label>
              </div>
              <div className="mt-5 rounded-xl bg-surface-soft p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Delivering to</p>
                <p className="mt-1 font-black text-navy">Default Address</p>
                <p className="text-sm text-muted">{deliveryAddressText}</p>
              </div>
            </Card>
          ) : null}
          <aside className="space-y-4">
            <Card className="p-5">
              <h2 className="mb-4 font-bold text-navy">Order Summary</h2>
              <SummaryRow label="Subtotal" value={currency(subtotal)} />
              <SummaryRow label="GST Estimate" value={currency(gst)} />
              <SummaryRow label="Delivery" value="Free" />
              <div className="my-4 border-t border-border" />
              <SummaryRow label="Payable Amount" value={currency(subtotal + gst)} strong />
              {step < 2 ? (
                <Button className="mt-5 w-full" disabled={!items.length} onClick={() => setStep((current) => current + 1)}>
                  Continue
                </Button>
              ) : (
                <Button className="mt-5 w-full" disabled={!items.length || !hasDeliveryAddress || isCreatingOrder} onClick={confirmOrder}>
                  {isCreatingOrder ? "Placing order..." : "Confirm Order"}
                </Button>
              )}
            </Card>
          </aside>
        </div>
      </PageWrapper>
    </DashboardLayout>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex justify-between py-2 ${strong ? "text-lg font-bold text-navy" : "text-sm text-muted"}`}><span>{label}</span><span>{value}</span></div>;
}
