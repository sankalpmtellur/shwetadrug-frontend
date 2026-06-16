import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  Building2,
  IndianRupee,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { monthlyRevenue, weeklyRevenue } from "../data/mockData";
import { dashboardService } from "../services/dashboardService";
import type { AdminDashboard } from "../services/dashboardService";
import type { Kpi } from "../types";

const icons = [IndianRupee, ShoppingBag, Building2, Boxes];

type ChartMode = "monthly" | "weekly";

function formatCount(value: number | null | undefined) {
  return typeof value === "number" ? new Intl.NumberFormat("en-IN").format(value) : "-";
}

function formatCurrency(value: number | null | undefined) {
  return typeof value === "number"
    ? new Intl.NumberFormat("en-IN", {
        currency: "INR",
        maximumFractionDigits: 0,
        style: "currency",
      }).format(value)
    : "-";
}

function hasValue(value: number | null | undefined) {
  return typeof value === "number";
}

function getKpis(dashboard: AdminDashboard | null): Kpi[] {
  return [
    {
      label: "Total Revenue",
      value: formatCurrency(dashboard?.totalRevenue),
      hint: hasValue(dashboard?.pendingClaims) ? `${formatCount(dashboard?.pendingClaims)} pending claims` : "Pending claims unavailable",
      tone: "blue",
    },
    {
      label: "Total Orders",
      value: formatCount(dashboard?.totalOrders),
      hint:
        hasValue(dashboard?.pendingOrders) && hasValue(dashboard?.deliveredOrders)
          ? `${formatCount(dashboard?.pendingOrders)} pending, ${formatCount(dashboard?.deliveredOrders)} delivered`
          : "Order status unavailable",
      tone: "green",
    },
    {
      label: "Active Retailers",
      value: formatCount(dashboard?.totalRetailers),
      hint: "Registered retailer accounts",
      tone: "blue",
    },
    {
      label: "Inventory Items",
      value: formatCount(dashboard?.inventoryCount),
      hint: hasValue(dashboard?.totalMedicines) ? `${formatCount(dashboard?.totalMedicines)} medicines` : "Medicine count unavailable",
      tone: "orange",
    },
  ];
}

export default function Dashboard() {
  const [chartMode, setChartMode] = useState<ChartMode>("monthly");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getAdminDashboard();
      setDashboard(data);
    } catch (dashboardError) {
      setError(dashboardError instanceof Error ? dashboardError.message : "Unable to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // Temporary mock chart data: the admin dashboard API currently exposes aggregate KPIs only.
  const chartData = chartMode === "monthly" ? monthlyRevenue : weeklyRevenue;
  const kpis = useMemo(() => getKpis(dashboard), [dashboard]);
  const isEmpty = !isLoading && !error && !Object.values(dashboard ?? {}).some((value) => typeof value === "number");

  const maxValue = useMemo(
    () => Math.max(...chartData.map((item) => item.value)),
    [chartData]
  );

  const yAxisValues = useMemo(() => {
    return [maxValue, Math.round(maxValue * 0.75), Math.round(maxValue * 0.5), Math.round(maxValue * 0.25), 0];
  }, [maxValue]);

  return (
    <>
      {isLoading ? (
        <Card>
          <p className="text-sm font-bold text-muted">Loading dashboard data...</p>
        </Card>
      ) : null}

      {error ? (
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-navy">Dashboard unavailable</h2>
              <p className="mt-1 text-sm text-muted">{error}</p>
            </div>
            <Button type="button" onClick={() => void loadDashboard()}>
              Retry
            </Button>
          </div>
        </Card>
      ) : null}

      {!isLoading && !error ? (
        <>
          {isEmpty ? (
            <Card>
              <p className="text-sm font-bold text-muted">Dashboard data is unavailable right now.</p>
            </Card>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi, index) => {
              const Icon = icons[index] ?? BarChart3;
              return <Metric key={kpi.label} {...kpi} icon={<Icon />} />;
            })}
          </div>
        </>
      ) : null}

      <Card>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-navy">Revenue Trend</h2>
              <Badge tone="green">+12.4%</Badge>
            </div>

            <p className="mt-1 text-sm text-muted">
              {chartMode === "monthly"
                ? "Monthly revenue trend across the year."
                : "Revenue trend for the current week."}
            </p>
          </div>

          <div className="grid grid-cols-2 rounded-lg border border-border bg-white p-1">
            {(["monthly", "weekly"] as ChartMode[]).map((mode) => (
              <button
                key={mode}
                className={`rounded-md px-4 py-2 text-sm font-bold capitalize transition ${
                  chartMode === mode
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-surface-soft"
                }`}
                onClick={() => setChartMode(mode)}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-surface-soft p-4 sm:p-5">
          <div className="flex gap-4">
            <div className="flex h-80 w-12 flex-col justify-between pb-8 text-right text-[11px] font-bold text-muted">
              {yAxisValues.map((value) => (
                <span key={value}>₹{value}L</span>
              ))}
            </div>

            <div className="relative flex h-80 flex-1 items-end gap-2 border-l border-b border-border pl-3 sm:gap-3">
              <div className="pointer-events-none absolute inset-x-3 top-0 h-[calc(100%-2rem)]">
                {yAxisValues.slice(0, 4).map((value) => (
                  <div
                    key={value}
                    className="h-1/4 border-t border-border/70"
                  />
                ))}
              </div>

              {chartData.map((item) => {
                const height = Math.max((item.value / maxValue) * 240, 24);

                return (
                  <div
                    key={item.label}
                    className="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-[10px] font-black text-primary sm:text-xs">
                      ₹{item.value}L
                    </span>

                    <div
                      className="w-full max-w-12 rounded-t-xl bg-primary shadow-sm transition-all duration-500 hover:bg-primary/90"
                      style={{ height }}
                      title={`${item.label}: ₹${item.value}L`}
                    />

                    <span className="h-6 text-[10px] font-black uppercase tracking-wide text-muted sm:text-xs">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
