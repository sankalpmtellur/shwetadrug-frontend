import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Building2,
  CalendarDays,
  IndianRupee,
  PackageSearch,
  ShoppingBag,
  Store,
  UsersRound,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Cell, Table } from "../components/common/Table";
import { Metric } from "../components/common/Metric";
import { dashboardService } from "../services/dashboardService";
import type { AdminDashboard } from "../services/dashboardService";
import { formatCount, formatCurrency } from "../utils/formatters";

function valueOrZero(value: number | null | undefined) {
  return typeof value === "number" ? value : 0;
}

export default function Dashboard() {
  const navigate = useNavigate();
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
    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDashboard]);

  const monthlySales = useMemo(() => dashboard?.monthlySales ?? [], [dashboard?.monthlySales]);
  const topMedicines = useMemo(() => dashboard?.topSellingMedicines ?? [], [dashboard?.topSellingMedicines]);
  const topRetailers = useMemo(() => dashboard?.topRetailersByOrderValue ?? [], [dashboard?.topRetailersByOrderValue]);
  const maxSalesValue = useMemo(() => Math.max(0, ...monthlySales.map((item) => item.value)), [monthlySales]);
  const yAxisValues = useMemo(() => {
    if (maxSalesValue <= 0) return [0, 0, 0, 0, 0];
    return [
      maxSalesValue,
      Math.round(maxSalesValue * 0.75),
      Math.round(maxSalesValue * 0.5),
      Math.round(maxSalesValue * 0.25),
      0,
    ];
  }, [maxSalesValue]);

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
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={<ShoppingBag />}
              label="Orders Today"
              value={formatCount(valueOrZero(dashboard?.ordersToday))}
              hint="Placed order count"
              onClick={() => navigate("/orders")}
              tone="blue"
            />
            <Metric
              icon={<CalendarDays />}
              label="Orders This Month"
              value={formatCount(valueOrZero(dashboard?.ordersThisMonth))}
              hint="Placed this month"
              onClick={() => navigate("/orders")}
              tone="green"
            />
            <Metric
              icon={<IndianRupee />}
              label="Revenue Today"
              value={formatCurrency(valueOrZero(dashboard?.revenueToday))}
              hint="Placed order value"
              onClick={() => navigate("/orders")}
              tone="blue"
            />
            <Metric
              icon={<BarChart3 />}
              label="Revenue This Month"
              value={formatCurrency(valueOrZero(dashboard?.revenueThisMonth))}
              hint="Placed order value"
              onClick={() => navigate("/orders")}
              tone="green"
            />
            <Metric
              icon={<Boxes />}
              label="Low Stock"
              value={formatCount(valueOrZero(dashboard?.lowStockMedicinesCount))}
              hint="Medicines needing stock action"
              onClick={() => navigate("/inventory")}
              tone="orange"
            />
            <Metric
              icon={<AlertTriangle />}
              label="Expiring Medicines"
              value={formatCount(valueOrZero(dashboard?.medicinesExpiringNext60DaysCount))}
              hint="Within next 60 days"
              onClick={() => navigate("/expiry")}
              tone="orange"
            />
            <Metric
              icon={<UsersRound />}
              label="New Retailers"
              value={formatCount(valueOrZero(dashboard?.newRetailersThisMonth))}
              hint="Registered this month"
              onClick={() => navigate("/retailers")}
              tone="green"
            />
            <Metric
              icon={<Store />}
              label="Active Retailers"
              value={formatCount(valueOrZero(dashboard?.activeRetailers))}
              hint={`${formatCount(valueOrZero(dashboard?.totalRetailers))} total retailers`}
              onClick={() => navigate("/retailers")}
              tone="blue"
            />
          </div>

          <div className="grid min-w-0 gap-4 md:grid-cols-3">
            <Metric
              icon={<ShoppingBag />}
              label="Total Orders"
              value={formatCount(valueOrZero(dashboard?.totalOrders))}
              hint={`${formatCount(valueOrZero(dashboard?.pendingOrders))} pending orders`}
              onClick={() => navigate("/orders")}
              tone="blue"
            />
            <Metric
              icon={<IndianRupee />}
              label="Total Revenue"
              value={formatCurrency(valueOrZero(dashboard?.totalRevenue))}
              hint="Total placed order value"
              onClick={() => navigate("/orders")}
              tone="green"
            />
            <Metric
              icon={<Building2 />}
              label="Catalog"
              value={formatCount(valueOrZero(dashboard?.totalMedicines))}
              hint={`${formatCount(valueOrZero(dashboard?.inventoryCount))} inventory lots`}
              onClick={() => navigate("/medicines")}
              tone="blue"
            />
          </div>
        </>
      ) : null}

      <Card className="overflow-hidden">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-navy">Monthly Sales</h2>
            <p className="mt-1 text-sm text-muted">Placed order value for the last 12 months.</p>
          </div>
          <p className="text-sm font-black text-primary sm:text-right">{formatCurrency(maxSalesValue)} peak month</p>
        </div>

        <div className="min-w-0 rounded-lg bg-surface-soft p-3 sm:p-5">
          <div className="flex min-w-0 gap-3 sm:gap-4">
            <div className="flex h-72 w-16 shrink-0 flex-col justify-between pb-8 text-right text-[10px] font-bold text-muted sm:h-80 sm:w-20 sm:text-[11px]">
              {yAxisValues.map((value, index) => (
                <span key={`${value}-${index}`}>{formatCurrency(value)}</span>
              ))}
            </div>

            <div className="min-w-0 flex-1 overflow-x-auto pb-2">
              <div className="relative flex h-72 min-w-[560px] items-end gap-2 border-l border-b border-border pl-3 sm:h-80 sm:min-w-[640px] sm:gap-3">
              <div className="pointer-events-none absolute inset-x-3 top-0 h-[calc(100%-2rem)]">
                {yAxisValues.slice(0, 4).map((value, index) => (
                  <div key={`${value}-${index}`} className="h-1/4 border-t border-border/70" />
                ))}
              </div>

              <div className="relative z-10 flex h-full flex-1 items-end gap-2 sm:gap-3">
                {monthlySales.map((item) => {
                  const height = maxSalesValue > 0 ? Math.max((item.value / maxSalesValue) * 220, item.value > 0 ? 18 : 0) : 0;

                  return (
                    <div key={item.month} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                      <span className="max-w-16 truncate text-[10px] font-black text-primary sm:text-xs">{formatCurrency(item.value)}</span>
                      <div
                        className="w-full max-w-12 rounded-t-lg bg-primary shadow-sm transition-all duration-500 hover:bg-primary/90"
                        style={{ height }}
                        title={`${item.label}: ${formatCurrency(item.value)}`}
                      />
                      <span className="h-6 text-[10px] font-black uppercase text-muted sm:text-xs">{item.label}</span>
                    </div>
                  );
                })}
              </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="mb-4 flex items-center gap-3">
            <div className="shrink-0 rounded-lg bg-amber-50 p-2 text-warning">
              <PackageSearch />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-navy">Top Selling Medicines</h2>
              <p className="text-sm text-muted">Ranked by quantity sold.</p>
            </div>
          </div>

          {topMedicines.length === 0 ? (
            <p className="text-sm font-bold text-muted">No medicine sales yet.</p>
          ) : (
            <Table headers={["Medicine", "SKU", "Qty", "Value"]}>
              {topMedicines.map((item) => (
                <tr key={item.medicineId} className="border-b border-border last:border-0">
                  <Cell strong>{item.name}</Cell>
                  <Cell>{item.sku}</Cell>
                  <Cell>{formatCount(item.quantity)}</Cell>
                  <Cell>{formatCurrency(item.value)}</Cell>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="mb-4 flex items-center gap-3">
            <div className="shrink-0 rounded-lg bg-surface-strong p-2 text-primary">
              <Building2 />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-navy">Top Retailers</h2>
              <p className="text-sm text-muted">Ranked by placed order value.</p>
            </div>
          </div>

          {topRetailers.length === 0 ? (
            <p className="text-sm font-bold text-muted">No retailer orders yet.</p>
          ) : (
            <Table headers={["Retailer", "Owner", "Orders", "Value"]}>
              {topRetailers.map((item) => (
                <tr key={item.retailerId} className="border-b border-border last:border-0">
                  <Cell strong>{item.pharmacyName}</Cell>
                  <Cell>{item.ownerName}</Cell>
                  <Cell>{formatCount(item.orderCount)}</Cell>
                  <Cell>{formatCurrency(item.value)}</Cell>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}
