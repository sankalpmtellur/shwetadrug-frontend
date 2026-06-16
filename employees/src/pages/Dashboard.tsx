import { useEffect, useState } from "react";
import { Boxes, ClipboardCheck, RefreshCcw, ShieldAlert, Truck } from "lucide-react";
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
    void loadDashboard();
  }, []);

  return (
    <>
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mt-2 text-2xl font-black text-navy md:text-3xl">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              A simple workspace for checking stock, seeing retailer orders, and reviewing expiry alerts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90" to="/orders">
              View orders
            </Link>
            <Link className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-bold text-navy transition hover:bg-surface-soft" to="/inventory">
              Update stock
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard icon={<ClipboardCheck />} label="Pending Orders" value={String(dashboard.pendingOrders)} detail="Need employee review" />
          <SummaryCard icon={<Truck />} label="Packed/Shipped" value={String(dashboard.packedShippedOrders)} detail="Ready or out for delivery" />
          <SummaryCard icon={<Boxes />} label="Low Stock Items" value={String(dashboard.lowStockItems)} detail="Update stock soon" warning />
          <SummaryCard icon={<ShieldAlert />} label="Expiring Inventory" value={String(dashboard.expiringInventory)} detail="Review before dispatch" warning />
          <SummaryCard icon={<ShieldAlert />} label="Pending Claims" value={String(dashboard.pendingClaims)} detail="Claims need action" warning />
          <SummaryCard icon={<Truck />} label="Active Deliveries" value={String(dashboard.activeDeliveries)} detail="Currently in delivery flow" />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy">Who Ordered</h2>
              <p className="text-sm text-muted">Latest retailer orders with received time and item count.</p>
            </div>
            <Link className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90" to="/orders">
              Open all
            </Link>
          </div>
          <PreviewMessage message="Order preview records are not included in the employee dashboard API yet. Open Orders for the full list after order integration." />
        </Card>

        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy">Check Stocks</h2>
              <p className="text-sm text-muted">Low stock and reorder batches that need attention.</p>
            </div>
            <Link className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-bold text-navy transition hover:bg-surface-soft" to="/inventory">
              Manage stock
            </Link>
          </div>
          <PreviewMessage message="Inventory preview records are not included in the employee dashboard API yet. Open Inventory for the full list after inventory integration." />
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Truck className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-navy">Inventory and Expiry Management</h2>
              <p className="text-sm text-muted">Use the sidebar to add stock, update existing batches, and check expiry dates professionally.</p>
            </div>
          </div>
          <Link className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-bold text-navy transition hover:bg-surface-soft" to="/expiry">
            Open expiry
          </Link>
        </div>
      </Card>
    </>
  );
}

function PreviewMessage({ message }: { message: string }) {
  return <div className="rounded-lg border border-dashed border-border bg-surface-soft p-4 text-sm font-semibold text-muted">{message}</div>;
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
  warning = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  warning?: boolean;
}) {
  return (
    <Card>
      <div className={`mb-4 inline-flex rounded-lg p-2 ${warning ? "bg-amber-50 text-warning" : "bg-surface-strong text-primary"}`}>{icon}</div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-3xl font-black text-navy">{value}</p>
      <p className="mt-2 text-sm text-muted">{detail}</p>
    </Card>
  );
}
