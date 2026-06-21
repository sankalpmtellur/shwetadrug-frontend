import { useEffect, useState, type ReactNode } from "react";
import { Boxes, ClipboardCheck, RefreshCcw, ShieldAlert } from "lucide-react";
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

  return (
    <>
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-navy md:text-3xl">Employee Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              A focused workspace for retailer orders, low stock items, and inventory nearing expiry.
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
          <SummaryCard icon={<ClipboardCheck />} label="Orders" value={String(dashboard.pendingOrders)} detail="Incoming orders to review" />
          <SummaryCard icon={<Boxes />} label="Low Stock Items" value={String(dashboard.lowStockItems)} detail="Update stock before dispatch" warning />
          <SummaryCard icon={<ShieldAlert />} label="Expiring Inventory" value={String(dashboard.expiringInventory)} detail="Expiring in next 60 days" warning />
        </div>
      ) : null}
    </>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
  warning = false,
}: {
  icon: ReactNode;
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
