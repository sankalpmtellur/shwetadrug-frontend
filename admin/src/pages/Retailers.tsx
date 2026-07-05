import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Building2, RotateCcw, Search, Store, UserCheck } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { ADMIN_BADGES_REFRESH_EVENT } from "../components/layout/Sidebar";
import { retailerService } from "../services/retailerService";
import type { RetailerAccount } from "../services/retailerService";
import type { ListMeta } from "../services/inventoryService";

const pageSize = 10;

function formatCount(value: number | null | undefined) {
  return typeof value === "number" ? new Intl.NumberFormat("en-IN").format(value) : "-";
}

function getArea(retailer: RetailerAccount) {
  const address = retailer.addresses.find((item) => item.isDefault) ?? retailer.addresses[0];
  if (!address) return "-";
  return [address.line1, address.city, address.state].filter(Boolean).join(", ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function sortRetailers(rows: RetailerAccount[]) {
  return [...rows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function searchMatches(row: RetailerAccount, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [row.pharmacyName, row.ownerName, row.mobile, row.email, row.code, getArea(row)]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalized));
}

export default function Retailers() {
  const [retailers, setRetailers] = useState<RetailerAccount[]>([]);
  const [meta, setMeta] = useState<ListMeta>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadRetailers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await retailerService.getRetailers();
      setRetailers(sortRetailers(result.items));
      setMeta(result.meta);
    } catch (retailerError) {
      setError(retailerError instanceof Error ? retailerError.message : "Unable to load retailers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRetailers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRetailers]);

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    setActionError(null);

    try {
      const result = await retailerService.updateRetailerStatus(id, status);
      setRetailers((current) => sortRetailers(current.map((row) => (row.id === id ? result.data : row))));
      window.dispatchEvent(new Event(ADMIN_BADGES_REFRESH_EVENT));
    } catch (statusError) {
      setActionError(statusError instanceof Error ? statusError.message : "Unable to update retailer status");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredRetailers = useMemo(() => retailers.filter((row) => searchMatches(row, search)), [retailers, search]);
  const activeCount = useMemo(() => retailers.filter((row) => row.status === "ACTIVE").length, [retailers]);
  const blockedCount = useMemo(() => retailers.filter((row) => row.status === "SUSPENDED").length, [retailers]);
  const totalPages = Math.max(1, Math.ceil(filteredRetailers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredRetailers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Store />} label="Retailers" value={formatCount(meta.total ?? retailers.length)} hint="Registered retailer accounts" tone="blue" />
        <Metric icon={<UserCheck />} label="Active" value={formatCount(activeCount)} hint="Can access the retailer portal" tone="green" />
        <Metric icon={<Building2 />} label="Blocked" value={formatCount(blockedCount)} hint="Suspended retailer accounts" tone="orange" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Retailer Accounts</h2>
            <p className="text-sm text-muted">Retailer contact details and access status management.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search retailers"
              />
            </label>
            {error ? (
              <Button type="button" onClick={() => void loadRetailers()}>
                Retry
              </Button>
            ) : null}
          </div>
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading retailers...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {actionError ? <p className="mb-3 text-sm font-bold text-error">{actionError}</p> : null}
        {!isLoading && !error && filteredRetailers.length === 0 ? <p className="text-sm font-bold text-muted">No retailer accounts found.</p> : null}

        {!isLoading && !error && filteredRetailers.length > 0 ? (
          <Table headers={["Pharmacy", "Owner", "Phone", "Email", "Status", "Signup Date", "Actions"]}>
            {pageItems.map((row) => {
              const isBlocked = row.status === "SUSPENDED";
              const isExpanded = expandedId === row.id;
              return (
                <Fragment key={row.id}>
                  <tr key={row.id} className="border-t border-border hover:bg-surface-soft/70">
                    <Cell strong>{row.pharmacyName}</Cell>
                    <Cell>{row.ownerName}</Cell>
                    <Cell>{row.mobile}</Cell>
                    <Cell>{row.email}</Cell>
                    <Cell>{row.status.replaceAll("_", " ")}</Cell>
                    <Cell>{formatDate(row.createdAt)}</Cell>
                    <Cell>
                      <div className="flex min-w-52 flex-col gap-2 sm:flex-row">
                        <Button className="h-9 px-3" variant="secondary" onClick={() => setExpandedId(isExpanded ? null : row.id)}>
                          {isExpanded ? "Hide Details" : "View Details"}
                        </Button>
                        {isBlocked ? (
                          <Button className="h-9 gap-2 px-3" disabled={updatingId === row.id} onClick={() => void handleStatusChange(row.id, "ACTIVE")}>
                            <RotateCcw className="h-4 w-4" />
                            Unblock
                          </Button>
                        ) : (
                          <Button className="h-9 gap-2 px-3" disabled={updatingId === row.id} onClick={() => void handleStatusChange(row.id, "SUSPENDED")} variant="secondary">
                            <Ban className="h-4 w-4" />
                            Block
                          </Button>
                        )}
                      </div>
                    </Cell>
                  </tr>
                  {isExpanded ? (
                    <tr key={`${row.id}-details`} className="border-t border-border bg-surface-soft/60">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                          <Detail label="Retailer Code" value={row.code} />
                          <Detail label="GST Number" value={row.gstNumber ?? "-"} />
                          <Detail label="Drug License" value={row.drugLicenseNumber ?? "-"} />
                          <Detail label="Credit Limit" value={formatCount(row.creditLimit)} />
                          <Detail label="Outstanding" value={formatCount(row.outstandingBalance)} />
                          <Detail label="Address" value={getArea(row)} />
                          <Detail label="Default User" value={row.users[0]?.email ?? "-"} />
                          <Detail label="Notes" value={row.notes ?? "-"} />
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </Table>
        ) : null}
        {!isLoading && !error && filteredRetailers.length > 0 ? <Pagination page={currentPage} totalPages={totalPages} totalItems={filteredRetailers.length} onPageChange={setPage} /> : null}
      </Card>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 break-words font-bold text-navy">{value}</p>
    </div>
  );
}

function Pagination({ page, totalPages, totalItems, onPageChange }: { page: number; totalPages: number; totalItems: number; onPageChange: (page: number) => void }) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-muted">{formatCount(totalItems)} retailers · Page {page} of {totalPages}</p>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button className="w-full sm:w-auto" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
        <Button className="w-full sm:w-auto" variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
