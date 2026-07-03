import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Boxes, ClipboardCheck, PackagePlus, RefreshCcw, RotateCcw, ShieldAlert, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { dashboardService, type EmployeeDashboard } from "../services/dashboardService";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<EmployeeDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setIsLoading(true);
    setError("");

    try {
      const data = await dashboardService.getEmployeeDashboard();
      setDashboard(data);
    } catch {
      setError("Could not load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    dashboardService
      .getEmployeeDashboard()
      .then((data) => {
        if (isMounted) setDashboard(data);
      })
      .catch(() => {
        if (isMounted) setError("Could not load dashboard data.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const priorityQueue = useMemo(() => {
    if (!dashboard) return [];

    return [
      {
        label: "Orders awaiting processing",
        value: dashboard.pendingOrders,
        detail: "Verify stock and move eligible orders to packing.",
        to: "/orders",
      },
      {
        label: "Stock lots needing attention",
        value: dashboard.lowStockItems,
        detail: "Review low, reorder, and out-of-stock batches before accepting dispatch work.",
        to: "/inventory",
      },
      {
        label: "Batches nearing expiry",
        value: dashboard.expiringInventory,
        detail: "Check expiry control before allocating these lots to retailer orders.",
        to: "/expiry",
      },
    ].filter((item) => item.value > 0);
  }, [dashboard]);

  return (
    <>
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-navy md:text-3xl">Employee Dashboard</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              Daily operations view for order processing, dispatch readiness, stock exceptions, and expiry checks.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="gap-2" onClick={() => void loadDashboard()} variant="secondary">
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
            <Link className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90" to="/orders">
              Open orders
            </Link>
          </div>
        </div>
      </section>

      {isLoading ? (
        <Card>
          <p className="text-sm font-semibold text-muted">Loading dashboard data...</p>
        </Card>
      ) : null}

      {error ? (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-error">{error}</p>
            <Button className="gap-2" onClick={() => void loadDashboard()} variant="secondary">
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </Card>
      ) : null}

      {dashboard ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard icon={<ClipboardCheck />} label="Pending Orders" value={dashboard.pendingOrders} detail="Orders waiting for employee review" tone={dashboard.pendingOrders > 0 ? "primary" : "neutral"} />
            <SummaryCard icon={<Truck />} label="Packed / Dispatched" value={dashboard.packedShippedOrders} detail="Orders currently moving through fulfillment" tone="neutral" />
            <SummaryCard icon={<Boxes />} label="Low Stock Lots" value={dashboard.lowStockItems} detail="Lots marked low, reorder, or out of stock" tone={dashboard.lowStockItems > 0 ? "warning" : "neutral"} />
            <SummaryCard icon={<ShieldAlert />} label="Expiring Lots" value={dashboard.expiringInventory} detail="Inventory expiring within 60 days" tone={dashboard.expiringInventory > 0 ? "warning" : "neutral"} />
            <SummaryCard icon={<RotateCcw />} label="Pending Claims" value={dashboard.pendingClaims} detail="Return requests waiting for action" tone={dashboard.pendingClaims > 0 ? "warning" : "neutral"} />
            <SummaryCard icon={<Truck />} label="Active Deliveries" value={dashboard.activeDeliveries} detail="Packed or dispatched orders not yet delivered" tone="neutral" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-navy">Work Queue</h2>
                  <p className="mt-1 text-sm text-muted">Handle items in this order to keep fulfillment moving.</p>
                </div>
                {priorityQueue.length > 0 ? (
                  <span className="inline-flex rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-warning">
                    {priorityQueue.length} active priorities
                  </span>
                ) : null}
              </div>

              <div className="mt-5 divide-y divide-border rounded-lg border border-border">
                {priorityQueue.length > 0 ? (
                  priorityQueue.map((item) => (
                    <Link key={item.label} to={item.to} className="grid gap-2 p-4 transition hover:bg-surface-soft sm:grid-cols-[140px_1fr_auto] sm:items-center">
                      <span className="text-2xl font-black text-navy">{item.value}</span>
                      <span>
                        <span className="block text-sm font-bold text-navy">{item.label}</span>
                        <span className="mt-1 block text-sm text-muted">{item.detail}</span>
                      </span>
                      <span className="text-sm font-bold text-primary">Open</span>
                    </Link>
                  ))
                ) : (
                  <div className="p-5 text-sm font-semibold text-muted">No urgent order, stock, or expiry items are pending right now.</div>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-black text-navy">Quick Actions</h2>
              <p className="mt-1 text-sm text-muted">Shortcuts for the pages used during daily fulfillment.</p>
              <div className="mt-5 grid gap-2">
                <QuickLink icon={<ClipboardCheck />} label="Review retailer orders" to="/orders" />
                <QuickLink icon={<PackagePlus />} label="Add or update inventory" to="/inventory" />
                <QuickLink icon={<AlertTriangle />} label="Check expiry control" to="/expiry" />
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </>
  );
}

function QuickLink({ icon, label, to }: { icon: ReactNode; label: string; to: string }) {
  return (
    <Link className="inline-flex h-11 items-center gap-3 rounded-lg border border-border bg-white px-3 text-sm font-bold text-navy transition hover:bg-surface-soft hover:text-primary" to={to}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
  tone: "primary" | "warning" | "neutral";
}) {
  const toneClass = tone === "warning" ? "bg-amber-50 text-warning" : tone === "primary" ? "bg-surface-strong text-primary" : "bg-surface-soft text-muted";

  return (
    <Card>
      <div className={`mb-4 inline-flex rounded-lg p-2 ${toneClass}`}>{icon}</div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-3xl font-black text-navy">{value}</p>
      <p className="mt-2 text-sm text-muted">{detail}</p>
    </Card>
  );
}
