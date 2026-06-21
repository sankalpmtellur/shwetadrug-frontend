import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Store, UserCheck } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { retailerService } from "../services/retailerService";
import type { RetailerAccount } from "../services/retailerService";
import type { ListMeta } from "../services/inventoryService";

const retailerStatuses = ["ACTIVE", "REVIEW", "REJECTED", "SUSPENDED"];
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

export default function Retailers() {
  const [retailers, setRetailers] = useState<RetailerAccount[]>([]);
  const [meta, setMeta] = useState<ListMeta>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [temporaryPasswords, setTemporaryPasswords] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const loadRetailers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await retailerService.getRetailers();
      setRetailers(result.items);
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

  function updateTemporaryPassword(id: string, value: string) {
    setTemporaryPasswords((current) => ({ ...current, [id]: value }));
  }

  async function handleStatusChange(id: string, status: string, temporaryPassword?: string) {
    setUpdatingId(id);
    setActionError(null);

    try {
      const result = await retailerService.updateRetailerStatus(id, status, temporaryPassword);
      setRetailers((current) => current.map((row) => (row.id === id ? result.data : row)));
      setTemporaryPasswords((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    } catch (statusError) {
      setActionError(statusError instanceof Error ? statusError.message : "Unable to update retailer status");
    } finally {
      setUpdatingId(null);
    }
  }

  function approveRetailer(row: RetailerAccount) {
    const temporaryPassword = temporaryPasswords[row.id]?.trim() ?? "";
    if (temporaryPassword.length < 8) {
      setActionError("Temporary password must be at least 8 characters.");
      return;
    }
    void handleStatusChange(row.id, "ACTIVE", temporaryPassword);
  }

  const reviewCount = useMemo(() => retailers.filter((row) => row.status === "REVIEW" || row.status === "PENDING_VERIFICATION").length, [retailers]);
  const activeCount = useMemo(() => retailers.filter((row) => row.status === "ACTIVE").length, [retailers]);
  const totalPages = Math.max(1, Math.ceil(retailers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = retailers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Store />} label="Retailers" value={formatCount(meta.total ?? retailers.length)} hint="Live retailer accounts" tone="blue" />
        <Metric icon={<UserCheck />} label="Active" value={formatCount(activeCount)} hint="Approved accounts" tone="green" />
        <Metric icon={<Building2 />} label="Needs Review" value={formatCount(reviewCount)} hint="Pending or review accounts" tone="orange" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Retailer Accounts</h2>
            <p className="text-sm text-muted">Retailer approval and contact management for launch operations.</p>
          </div>
          {error ? (
            <Button type="button" onClick={() => void loadRetailers()}>
              Retry
            </Button>
          ) : null}
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading retailers...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {actionError ? <p className="mb-3 text-sm font-bold text-error">{actionError}</p> : null}
        {!isLoading && !error && retailers.length === 0 ? <p className="text-sm font-bold text-muted">No retailer accounts found.</p> : null}

        {!isLoading && !error && retailers.length > 0 ? (
          <Table headers={["Pharmacy", "Owner", "Phone", "Email", "Area/Address", "Signup Date", "Actions"]}>
            {pageItems.map((row) => (
              <tr key={row.id} className="border-t border-border hover:bg-surface-soft/70">
                <Cell strong>{row.pharmacyName}</Cell>
                <Cell>{row.ownerName}</Cell>
                <Cell>{row.mobile}</Cell>
                <Cell>{row.email}</Cell>
                <Cell>{getArea(row)}</Cell>
                <Cell>{formatDate(row.createdAt)}</Cell>
                <Cell>
                  {row.status === "PENDING_VERIFICATION" ? (
                    <div className="flex min-w-64 flex-col gap-2">
                      <input
                        className="h-10 rounded-lg border border-border bg-white px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        disabled={updatingId === row.id}
                        onChange={(event) => updateTemporaryPassword(row.id, event.target.value)}
                        placeholder="Temporary Password"
                        type="password"
                        value={temporaryPasswords[row.id] ?? ""}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button className="h-9 px-3" disabled={updatingId === row.id} onClick={() => approveRetailer(row)}>
                          Approve
                        </Button>
                        <Button className="h-9 px-3" disabled={updatingId === row.id} onClick={() => void handleStatusChange(row.id, "REJECTED")} variant="secondary">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <select
                      className="h-10 rounded-lg border border-border bg-white px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                      value={row.status}
                      onChange={(event) => void handleStatusChange(row.id, event.target.value)}
                      disabled={updatingId === row.id}
                    >
                      {retailerStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  )}
                </Cell>
              </tr>
            ))}
          </Table>
        ) : null}
        {!isLoading && !error && retailers.length > 0 ? <Pagination page={currentPage} totalPages={totalPages} totalItems={retailers.length} onPageChange={setPage} /> : null}
      </Card>
    </section>
  );
}

function Pagination({ page, totalPages, totalItems, onPageChange }: { page: number; totalPages: number; totalItems: number; onPageChange: (page: number) => void }) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-muted">{formatCount(totalItems)} retailers · Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
