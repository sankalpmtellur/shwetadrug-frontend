import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin, Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
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
  const [addressLoadFailed, setAddressLoadFailed] = useState(false);
  const navigate = useNavigate();
  const gst = Math.round(subtotal * 0.12);
  const discount = 0;
  const deliveryCharge = 0;
  const payableAmount = subtotal - discount + gst + deliveryCharge;
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
        setAddressLoadFailed(false);
      } catch {
        setDefaultAddress(null);
        setAddressLoadFailed(true);
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
      toast.success("Order placed successfully.");
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

        {!items.length ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-black text-navy">Your cart is empty</h2>
            <p className="mt-2 text-sm font-semibold text-muted">Add medicines from the dashboard to review and place an order.</p>
            <Link to="/dashboard" className="mt-5 inline-flex">
              <Button type="button">Browse Medicines</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <Section title="Delivery Information" icon={<MapPin className="h-5 w-5" />}>
                <div className={`rounded-lg border p-4 ${hasDeliveryAddress ? "border-border bg-surface-soft" : "border-red-100 bg-red-50"}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-navy">Default delivery address</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-muted">{deliveryAddressText}</p>
                      {addressLoadFailed ? <p className="mt-2 text-xs font-bold text-error">Could not verify the saved address. Please retry from Profile.</p> : null}
                    </div>
                    <Link to="/profile" className="shrink-0 text-sm font-black text-primary">
                      {hasDeliveryAddress ? "Edit address" : "Add address"}
                    </Link>
                  </div>
                </div>
              </Section>

              <Section title={`Order Summary (${items.length})`} icon={<CheckCircle2 className="h-5 w-5" />}>
                <div className="overflow-hidden rounded-lg border border-border">
                  <div className="hidden grid-cols-[minmax(0,1fr)_96px_98px_108px] gap-3 bg-surface-soft px-4 py-3 text-xs font-black uppercase tracking-widest text-muted md:grid">
                    <span>Medicine</span>
                    <span className="text-right">Price</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-right">Item total</span>
                  </div>
                  <div className="divide-y divide-border">
                    {items.map((item) => (
                      <div key={item.sku} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_96px_98px_108px] md:items-center">
                        <div className="min-w-0">
                          <h3 className="break-words font-bold leading-5 text-navy">{item.name}</h3>
                          <p className="mt-1 break-words text-sm font-semibold text-muted">{item.pack}</p>
                        </div>
                        <p className="text-sm font-black text-navy md:text-right">{currency(item.unitPrice)}</p>
                        <QuantityControl
                          name={item.name}
                          qty={item.qty}
                          onDecrease={() => void setItemQuantity(item.medicineId, item.qty - 1)}
                          onIncrease={() => void setItemQuantity(item.medicineId, item.qty + 1)}
                        />
                        <div className="flex items-center justify-between gap-3 md:justify-end">
                          <p className="font-black text-primary">{currency(item.amount)}</p>
                          <button type="button" onClick={() => void removeItem(item.medicineId)} className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-error" aria-label={`Remove ${item.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <Card className="p-5">
                <h2 className="mb-4 text-lg font-black text-navy">Price Summary</h2>
                <SummaryRow label="Subtotal" value={currency(subtotal)} />
                <SummaryRow label="Discount" value={discount ? currency(discount) : "-"} />
                <SummaryRow label="GST" value={currency(gst)} />
                <SummaryRow label="Delivery charge" value={deliveryCharge ? currency(deliveryCharge) : "Free"} />
                <div className="my-4 border-t border-border" />
                <SummaryRow label="Final payable" value={currency(payableAmount)} strong />
              </Card>

              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm font-semibold leading-6 text-muted">
                    By placing this order, you confirm the selected items, quantities, and delivery address are correct.
                  </p>
                </div>
                <Button className="mt-5 h-12 w-full" disabled={!items.length || !hasDeliveryAddress || isCreatingOrder} onClick={confirmOrder}>
                  {isCreatingOrder ? "Placing order..." : "Place Order"}
                </Button>
              </Card>
            </aside>
          </div>
        )}
      </PageWrapper>
    </DashboardLayout>
  );
}

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-surface-strong text-primary">{icon}</div>
        <h2 className="text-lg font-black text-navy">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function QuantityControl({ name, qty, onDecrease, onIncrease }: { name: string; qty: number; onDecrease: () => void; onIncrease: () => void }) {
  return (
    <div className="flex w-fit overflow-hidden rounded-lg border border-border bg-white md:mx-auto">
      <button type="button" onClick={onDecrease} className="grid h-9 w-9 place-items-center text-muted" aria-label={`Decrease ${name}`}>
        <Minus className="h-4 w-4" />
      </button>
      <span className="grid h-9 min-w-10 place-items-center border-x border-border px-2 text-sm font-black text-navy">{qty}</span>
      <button type="button" onClick={onIncrease} className="grid h-9 w-9 place-items-center text-muted" aria-label={`Increase ${name}`}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-2 ${strong ? "text-lg font-black text-navy" : "text-sm font-semibold text-muted"}`}>
      <span>{label}</span>
      <span className={strong ? "text-primary" : "text-navy"}>{value}</span>
    </div>
  );
}
